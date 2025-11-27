import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkle, TrendUp, Warning, CheckCircle, Lightning } from '@phosphor-icons/react';
import { MealPlan, PlannedMeal, Meal } from '@/lib/types';
import { MOCK_MEALS } from '@/lib/mockData';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

type MealPlanningAIProps = {
  plan: MealPlan;
  onApplySuggestions: (suggestions: { date: string; meals: PlannedMeal[] }[]) => void;
};

type AISuggestion = {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type NutritionalBalance = {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  variety: number;
  costPerDay: number;
};

export function MealPlanningAI({ plan, onApplySuggestions }: MealPlanningAIProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [nutritionalBalance, setNutritionalBalance] = useState<NutritionalBalance | null>(null);

  const analyzeMealPlan = async () => {
    setIsAnalyzing(true);
    
    try {
      const totalDays = plan.days.filter(day => day.meals.length > 0).length;
      
      if (totalDays === 0) {
        toast.info('Add some meals first to get AI insights');
        setIsAnalyzing(false);
        return;
      }

      const totals = plan.days.reduce(
        (acc, day) => {
          const dayTotals = day.meals.reduce(
            (dayAcc, meal) => ({
              calories: dayAcc.calories + meal.meal.nutritionalInfo.calories * meal.servings,
              protein: dayAcc.protein + meal.meal.nutritionalInfo.protein * meal.servings,
              carbs: dayAcc.carbs + meal.meal.nutritionalInfo.carbs * meal.servings,
              fat: dayAcc.fat + meal.meal.nutritionalInfo.fat * meal.servings,
              cost: dayAcc.cost + meal.meal.price * meal.servings,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
          );
          
          if (day.meals.length > 0) {
            acc.calories += dayTotals.calories;
            acc.protein += dayTotals.protein;
            acc.carbs += dayTotals.carbs;
            acc.fat += dayTotals.fat;
            acc.cost += dayTotals.cost;
          }
          
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
      );

      const uniqueMeals = new Set(
        plan.days.flatMap(day => day.meals.map(m => m.meal.id))
      ).size;

      const balance: NutritionalBalance = {
        avgCalories: totals.calories / totalDays,
        avgProtein: totals.protein / totalDays,
        avgCarbs: totals.carbs / totalDays,
        avgFat: totals.fat / totalDays,
        variety: uniqueMeals,
        costPerDay: totals.cost / totalDays,
      };

      setNutritionalBalance(balance);

      const newSuggestions: AISuggestion[] = [];

      if (balance.avgCalories < 1500) {
        newSuggestions.push({
          type: 'warning',
          title: 'Low Daily Calories',
          description: `Average ${Math.round(balance.avgCalories)} kcal/day. Consider adding more substantial meals.`,
          action: {
            label: 'Add High-Calorie Meals',
            onClick: () => suggestHighCalorieMeals(),
          },
        });
      }

      if (balance.avgCalories > 2500) {
        newSuggestions.push({
          type: 'warning',
          title: 'High Daily Calories',
          description: `Average ${Math.round(balance.avgCalories)} kcal/day. Consider lighter options.`,
          action: {
            label: 'Suggest Lighter Meals',
            onClick: () => suggestLighterMeals(),
          },
        });
      }

      if (balance.avgProtein < 50) {
        newSuggestions.push({
          type: 'warning',
          title: 'Low Protein Intake',
          description: `Average ${Math.round(balance.avgProtein)}g/day. Add protein-rich meals.`,
          action: {
            label: 'Add Protein',
            onClick: () => suggestProteinMeals(),
          },
        });
      }

      if (uniqueMeals < 4 && totalDays >= 5) {
        newSuggestions.push({
          type: 'info',
          title: 'Limited Variety',
          description: `Only ${uniqueMeals} unique meals. Mix it up for better nutrition!`,
          action: {
            label: 'Add Variety',
            onClick: () => suggestVariedMeals(),
          },
        });
      }

      if (balance.costPerDay > 15) {
        newSuggestions.push({
          type: 'info',
          title: 'Budget Optimization',
          description: `€${balance.costPerDay.toFixed(2)}/day. Save with budget-friendly alternatives.`,
          action: {
            label: 'Optimize Costs',
            onClick: () => suggestBudgetMeals(),
          },
        });
      }

      if (newSuggestions.length === 0) {
        newSuggestions.push({
          type: 'success',
          title: 'Well-Balanced Plan!',
          description: 'Your meal plan looks nutritionally balanced and varied.',
        });
      }

      setSuggestions(newSuggestions);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const autoFillWeek = async () => {
    setIsGenerating(true);
    
    try {
      const mealsData = JSON.stringify(MOCK_MEALS.map(m => ({ 
        id: m.id, 
        name: m.name, 
        category: m.category,
        calories: m.nutritionalInfo.calories,
        protein: m.nutritionalInfo.protein,
        price: m.price,
        dietaryTags: m.dietaryTags
      })));
      
      const promptText = `You are a professional nutritionist. Generate a balanced weekly meal plan.

Available meals (JSON format):
${mealsData}

Create a 7-day meal plan with:
- 2000-2200 calories per day average
- Good protein distribution (60-80g/day)
- Variety of categories (mix mains, vegetarian, sides)
- Budget conscious (prefer meals under €5)
- Maximum variety (avoid repeating meals too often)

Return ONLY a JSON object with this structure:
{
  "days": [
    {
      "date": "day_index_0_to_6",
      "mealIds": ["meal_id_1", "meal_id_2"],
      "servings": [2, 1]
    }
  ]
}`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const aiPlan = JSON.parse(response);

      const daySuggestions = plan.days.map((day, index) => {
        const aiDay = aiPlan.days[index];
        if (!aiDay) return { date: day.date, meals: [] };

        const meals: PlannedMeal[] = aiDay.mealIds
          .map((mealId: string, idx: number) => {
            const meal = MOCK_MEALS.find(m => m.id === mealId);
            if (!meal) return null;

            return {
              id: `planned-${Date.now()}-${idx}`,
              meal,
              mealType: 'lunch' as const,
              servings: aiDay.servings[idx] || 1,
            };
          })
          .filter(Boolean) as PlannedMeal[];

        return { date: day.date, meals };
      });

      onApplySuggestions(daySuggestions);
      toast.success('AI-generated meal plan applied!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestHighCalorieMeals = () => {
    const highCalMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.calories > 600)
      .sort((a, b) => b.nutritionalInfo.calories - a.nutritionalInfo.calories)
      .slice(0, 3);
    
    toast.success(`Try: ${highCalMeals.map(m => m.name).join(', ')}`);
  };

  const suggestLighterMeals = () => {
    const lightMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.calories < 400)
      .sort((a, b) => a.nutritionalInfo.calories - b.nutritionalInfo.calories)
      .slice(0, 3);
    
    toast.success(`Try: ${lightMeals.map(m => m.name).join(', ')}`);
  };

  const suggestProteinMeals = () => {
    const proteinMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.protein > 25)
      .sort((a, b) => b.nutritionalInfo.protein - a.nutritionalInfo.protein)
      .slice(0, 3);
    
    toast.success(`Try: ${proteinMeals.map(m => m.name).join(', ')}`);
  };

  const suggestVariedMeals = () => {
    const existingMealIds = new Set(
      plan.days.flatMap(day => day.meals.map(m => m.meal.id))
    );
    
    const newMeals = MOCK_MEALS.filter(m => !existingMealIds.has(m.id))
      .slice(0, 3);
    
    toast.success(`Try: ${newMeals.map(m => m.name).join(', ')}`);
  };

  const suggestBudgetMeals = () => {
    const budgetMeals = MOCK_MEALS.filter(m => m.price < 4)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    
    toast.success(`Try: ${budgetMeals.map(m => `${m.name} (€${m.price.toFixed(2)})`).join(', ')}`);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" weight="fill" />
            AI Meal Planning Assistant
          </CardTitle>
          <CardDescription>
            Get intelligent suggestions to optimize your meal plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={autoFillWeek}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightning className="w-4 h-4 mr-2" weight="fill" />
                  Auto-Fill Week
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={analyzeMealPlan}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendUp className="w-4 h-4 mr-2" />
                  Analyze Plan
                </>
              )}
            </Button>
          </div>

          {nutritionalBalance && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgCalories)}</div>
                <div className="text-xs text-muted-foreground">kcal/day</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgProtein)}g</div>
                <div className="text-xs text-muted-foreground">protein/day</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">{nutritionalBalance.variety}</div>
                <div className="text-xs text-muted-foreground">unique meals</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgCarbs)}g</div>
                <div className="text-xs text-muted-foreground">carbs/day</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgFat)}g</div>
                <div className="text-xs text-muted-foreground">fat/day</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-xl font-bold">€{nutritionalBalance.costPerDay.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">cost/day</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      suggestion.type === 'warning'
                        ? 'bg-warning/10 border-warning/30'
                        : suggestion.type === 'success'
                        ? 'bg-success/10 border-success/30'
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {suggestion.type === 'warning' && (
                          <Warning className="w-5 h-5 text-warning" weight="fill" />
                        )}
                        {suggestion.type === 'success' && (
                          <CheckCircle className="w-5 h-5 text-success" weight="fill" />
                        )}
                        {suggestion.type === 'info' && (
                          <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        {suggestion.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={suggestion.action.onClick}
                          >
                            {suggestion.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
