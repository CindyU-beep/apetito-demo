import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkle, TrendUp, Warning, CheckCircle, Lightning, MagicWand, Brain, ChartBar, Users } from '@phosphor-icons/react';
import { MealPlan, PlannedMeal, Meal, OrganizationProfile } from '@/lib/types';
import { MOCK_MEALS } from '@/lib/mockData';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';

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
  const [profile] = useKV<OrganizationProfile | null>('organization-profile', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingCustom, setIsProcessingCustom] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [nutritionalBalance, setNutritionalBalance] = useState<NutritionalBalance | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [peopleCount, setPeopleCount] = useState(profile?.servingCapacity?.toString() || '50');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [budgetPerMeal, setBudgetPerMeal] = useState(profile?.preferences.budgetPerServing?.toString() || '');

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

      const excludedAllergens = profile?.preferences.allergenExclusions || [];
      if (excludedAllergens.length > 0) {
        const mealsWithExcludedAllergens = plan.days.flatMap(day => 
          day.meals.filter(meal => 
            meal.meal.allergens.some(allergen => excludedAllergens.includes(allergen))
          )
        );
        
        if (mealsWithExcludedAllergens.length > 0) {
          newSuggestions.push({
            type: 'warning',
            title: `⚠️ Allergen Violation Detected`,
            description: `${mealsWithExcludedAllergens.length} meal(s) contain allergens that should be excluded for ${profile?.name}: ${excludedAllergens.join(', ')}. This is critical for safety!`,
            action: {
              label: 'Remove Violating Meals',
              onClick: () => toast.error('Please manually review and remove meals with restricted allergens'),
            },
          });
        }
      }

      const targetBudget = profile?.preferences.budgetPerServing || 5;
      const servingCapacity = profile?.servingCapacity || 50;
      const avgCostPerServing = balance.costPerDay / servingCapacity;
      
      if (avgCostPerServing > targetBudget * 1.2) {
        newSuggestions.push({
          type: 'warning',
          title: 'Budget Target Exceeded',
          description: `Cost is $${avgCostPerServing.toFixed(2)}/serving, above your target of $${targetBudget.toFixed(2)}/serving for ${profile?.name || 'your organization'}.`,
          action: {
            label: 'Suggest Budget-Friendly Options',
            onClick: () => suggestBudgetMeals(),
          },
        });
      }

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

      if (balance.costPerDay > 15 && !profile?.preferences.budgetPerServing) {
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
        let message = 'Your meal plan looks nutritionally balanced and varied.';
        if (profile?.name) {
          message = `Your meal plan meets all requirements for ${profile.name}!`;
        }
        newSuggestions.push({
          type: 'success',
          title: 'Well-Balanced Plan!',
          description: message,
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
        dietaryTags: m.dietaryTags,
        allergens: m.allergens
      })));
      
      let profileContext = '';
      if (profile) {
        profileContext = `\n\nORGANIZATION PROFILE - Use this context to inform your recommendations:
- Organization: ${profile.name}
- Type: ${profile.type}
- Serving capacity: ${profile.servingCapacity || 'Not specified'} people
- Dietary preferences: ${profile.preferences.dietaryRestrictions.join(', ') || 'None specified'}
- Allergen exclusions (CRITICAL - exclude these): ${profile.preferences.allergenExclusions.join(', ') || 'None'}
- Budget per serving: ${profile.preferences.budgetPerServing ? `$${profile.preferences.budgetPerServing.toFixed(2)}` : 'Not specified'}
- Special requirements: ${profile.preferences.specialRequirements || 'None'}`;
      }
      
      const restrictions = dietaryRestrictions.trim() ? `\n- Additional dietary restrictions: ${dietaryRestrictions}` : '';
      const budget = budgetPerMeal.trim() ? `\n- Budget limit override: €${budgetPerMeal} per meal` : '';
      const people = peopleCount.trim() ? `\n- Planning for: ${peopleCount} people` : '';
      
      const promptText = `You are a professional nutritionist for institutional catering. Generate a balanced weekly meal plan.${profileContext}

Available meals (JSON format):
${mealsData}

Requirements:
- 2000-2200 calories per day average
- Good protein distribution (60-80g/day)
- Variety of categories (mix mains, vegetarian, sides)
- Budget conscious${profile?.preferences.budgetPerServing ? ` (target $${profile.preferences.budgetPerServing.toFixed(2)}/serving)` : ' (prefer meals under €5)'}
- Maximum variety (avoid repeating meals too often)
- IMPORTANT: ${profile?.preferences.allergenExclusions.length ? `Exclude ALL meals containing: ${profile.preferences.allergenExclusions.join(', ')}` : 'No allergen restrictions'}
- IMPORTANT: ${profile?.preferences.dietaryRestrictions.length ? `Prefer ${profile.preferences.dietaryRestrictions.join(', ')} options` : 'No dietary preference restrictions'}${restrictions}${budget}${people}

Return ONLY a JSON object with this exact structure:
{
  "days": [
    {
      "date": "day_index_0_to_6",
      "mealIds": ["meal_id_1", "meal_id_2"],
      "servings": [2, 1],
      "reasoning": "Brief explanation why these meals work together and align with organization profile"
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
              notes: aiDay.reasoning,
            };
          })
          .filter(Boolean) as PlannedMeal[];

        return { date: day.date, meals };
      });

      onApplySuggestions(daySuggestions);
      toast.success('AI-generated meal plan applied! Check the Calendar tab to see your meals.');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomRequest = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please describe what you want');
      return;
    }

    setIsProcessingCustom(true);
    
    try {
      const mealsData = JSON.stringify(MOCK_MEALS.map(m => ({ 
        id: m.id, 
        name: m.name, 
        category: m.category,
        calories: m.nutritionalInfo.calories,
        protein: m.nutritionalInfo.protein,
        carbs: m.nutritionalInfo.carbs,
        fat: m.nutritionalInfo.fat,
        price: m.price,
        dietaryTags: m.dietaryTags,
        allergens: m.allergens,
        components: m.components
      })));

      const currentPlanSummary = plan.days.map((day, idx) => ({
        dayIndex: idx,
        meals: day.meals.map(m => m.meal.name),
        totalCalories: day.meals.reduce((sum, m) => sum + m.meal.nutritionalInfo.calories * m.servings, 0)
      }));
      
      let profileContext = '';
      if (profile) {
        profileContext = `\nORGANIZATION PROFILE CONTEXT (use to inform recommendations):
- Organization: ${profile.name}
- Type: ${profile.type}
- Serving capacity: ${profile.servingCapacity || 'Not specified'} people
- Dietary preferences: ${profile.preferences.dietaryRestrictions.join(', ') || 'None'}
- Allergen exclusions (MUST AVOID): ${profile.preferences.allergenExclusions.join(', ') || 'None'}
- Budget per serving target: ${profile.preferences.budgetPerServing ? `$${profile.preferences.budgetPerServing.toFixed(2)}` : 'Not specified'}
- Special requirements: ${profile.preferences.specialRequirements || 'None'}
`;
      }
      
      const promptText = `You are a professional nutritionist and meal planning assistant.${profileContext}
Current meal plan:
${JSON.stringify(currentPlanSummary)}

Available meals:
${mealsData}

User request: ${customPrompt}

IMPORTANT: When suggesting meals:
${profile?.preferences.allergenExclusions.length ? `- EXCLUDE any meals with these allergens: ${profile.preferences.allergenExclusions.join(', ')}` : ''}
${profile?.preferences.dietaryRestrictions.length ? `- PREFER meals tagged as: ${profile.preferences.dietaryRestrictions.join(', ')}` : ''}
${profile?.preferences.budgetPerServing ? `- CONSIDER budget target of $${profile.preferences.budgetPerServing.toFixed(2)}/serving` : ''}
${profile?.preferences.specialRequirements ? `- CONSIDER: ${profile.preferences.specialRequirements}` : ''}

Based on the user's request and organization profile, generate appropriate meal suggestions. Return ONLY a JSON object with this structure:
{
  "days": [
    {
      "date": "day_index_0_to_6",
      "mealIds": ["meal_id_1", "meal_id_2"],
      "servings": [2, 1],
      "reasoning": "Brief explanation why these meals address the user's request and align with profile"
    }
  ],
  "summary": "Brief summary of changes made to address the request considering organization context"
}

If the request is about specific days, only modify those days. If it's about the whole week, modify all days.`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const aiResponse = JSON.parse(response);

      const daySuggestions = plan.days.map((day, index) => {
        const aiDay = aiResponse.days.find((d: { date: string }) => d.date === `day_index_${index}`);
        if (!aiDay) return { date: day.date, meals: day.meals };

        const meals: PlannedMeal[] = aiDay.mealIds
          .map((mealId: string, idx: number) => {
            const meal = MOCK_MEALS.find(m => m.id === mealId);
            if (!meal) return null;

            return {
              id: `planned-${Date.now()}-${idx}`,
              meal,
              mealType: 'lunch' as const,
              servings: aiDay.servings[idx] || 1,
              notes: aiDay.reasoning,
            };
          })
          .filter(Boolean) as PlannedMeal[];

        return { date: day.date, meals };
      });

      onApplySuggestions(daySuggestions);
      toast.success(aiResponse.summary || 'Custom meal plan applied!');
      setCustomPrompt('');
    } catch (error) {
      console.error('Error processing custom request:', error);
      toast.error('Failed to process your request. Try rephrasing.');
    } finally {
      setIsProcessingCustom(false);
    }
  };

  const suggestHighCalorieMeals = () => {
    let highCalMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.calories > 600);
    
    if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
      highCalMeals = highCalMeals.filter(m => 
        !m.allergens.some(a => profile.preferences.allergenExclusions.includes(a))
      );
    }
    
    highCalMeals = highCalMeals
      .sort((a, b) => b.nutritionalInfo.calories - a.nutritionalInfo.calories)
      .slice(0, 3);
    
    toast.success(`Try: ${highCalMeals.map(m => m.name).join(', ')}`);
  };

  const suggestLighterMeals = () => {
    let lightMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.calories < 400);
    
    if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
      lightMeals = lightMeals.filter(m => 
        !m.allergens.some(a => profile.preferences.allergenExclusions.includes(a))
      );
    }
    
    lightMeals = lightMeals
      .sort((a, b) => a.nutritionalInfo.calories - b.nutritionalInfo.calories)
      .slice(0, 3);
    
    toast.success(`Try: ${lightMeals.map(m => m.name).join(', ')}`);
  };

  const suggestProteinMeals = () => {
    let proteinMeals = MOCK_MEALS.filter(m => m.nutritionalInfo.protein > 25);
    
    if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
      proteinMeals = proteinMeals.filter(m => 
        !m.allergens.some(a => profile.preferences.allergenExclusions.includes(a))
      );
    }
    
    proteinMeals = proteinMeals
      .sort((a, b) => b.nutritionalInfo.protein - a.nutritionalInfo.protein)
      .slice(0, 3);
    
    toast.success(`Try: ${proteinMeals.map(m => m.name).join(', ')}`);
  };

  const suggestVariedMeals = () => {
    const existingMealIds = new Set(
      plan.days.flatMap(day => day.meals.map(m => m.meal.id))
    );
    
    let newMeals = MOCK_MEALS.filter(m => !existingMealIds.has(m.id));
    
    if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
      newMeals = newMeals.filter(m => 
        !m.allergens.some(a => profile.preferences.allergenExclusions.includes(a))
      );
    }
    
    newMeals = newMeals.slice(0, 3);
    
    toast.success(`Try: ${newMeals.map(m => m.name).join(', ')}`);
  };

  const suggestBudgetMeals = () => {
    let budgetMeals = MOCK_MEALS.filter(m => m.price < 4);
    
    if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
      budgetMeals = budgetMeals.filter(m => 
        !m.allergens.some(a => profile.preferences.allergenExclusions.includes(a))
      );
    }
    
    budgetMeals = budgetMeals
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    
    toast.success(`Try: ${budgetMeals.map(m => `${m.name} (€${m.price.toFixed(2)})`).join(', ')}`);
  };

  return (
    <div className="space-y-4">
      {profile && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Organization Profile Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Organization:</span> {profile.name}
              </div>
              <div>
                <span className="font-medium">Type:</span> {profile.type}
              </div>
              {profile.servingCapacity && (
                <div>
                  <span className="font-medium">Capacity:</span> {profile.servingCapacity} people
                </div>
              )}
              {profile.preferences.budgetPerServing && (
                <div>
                  <span className="font-medium">Budget:</span> ${profile.preferences.budgetPerServing.toFixed(2)}/serving
                </div>
              )}
            </div>
            {profile.preferences.allergenExclusions.length > 0 && (
              <div className="flex items-start gap-2 mt-3 pt-3 border-t">
                <Warning className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" weight="fill" />
                <div>
                  <span className="font-medium text-destructive">Allergen Exclusions:</span>{' '}
                  <span className="text-muted-foreground">
                    {profile.preferences.allergenExclusions.join(', ')}
                  </span>
                </div>
              </div>
            )}
            {profile.preferences.dietaryRestrictions.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" weight="fill" />
                <div>
                  <span className="font-medium text-success">Dietary Preferences:</span>{' '}
                  <span className="text-muted-foreground">
                    {profile.preferences.dietaryRestrictions.join(', ')}
                  </span>
                </div>
              </div>
            )}
            {profile.preferences.specialRequirements && (
              <div className="text-xs text-muted-foreground italic mt-2">
                {profile.preferences.specialRequirements}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" weight="fill" />
            AI Meal Planning Assistant
          </CardTitle>
          <CardDescription>
            Get intelligent suggestions to optimize your meal plan for nutrition, variety, and budget{profile ? ` tailored for ${profile.name}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Lightning className="w-4 h-4" weight="fill" />
                <span className="hidden sm:inline">Generate</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Custom</span>
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <ChartBar className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="people-count">Number of People</Label>
                  <Input
                    id="people-count"
                    type="number"
                    placeholder="50"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dietary-restrictions">Dietary Restrictions (optional)</Label>
                  <Input
                    id="dietary-restrictions"
                    placeholder="e.g., vegetarian, gluten-free, nut-free"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget per Meal (optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 5.00"
                    value={budgetPerMeal}
                    onChange={(e) => setBudgetPerMeal(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={autoFillWeek}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Generating AI Plan...
                  </>
                ) : (
                  <>
                    <Lightning className="w-4 h-4 mr-2" weight="fill" />
                    Auto-Fill Entire Week
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2">
                AI will create a balanced meal plan considering all your requirements
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label htmlFor="custom-prompt">What would you like to change?</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Examples:&#10;- Make Monday and Tuesday lighter&#10;- Add more protein-rich meals&#10;- Include more vegetarian options&#10;- Swap out meals with nuts&#10;- Make Friday special with higher-end meals"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleCustomRequest}
                disabled={isProcessingCustom || !customPrompt.trim()}
                className="w-full"
                size="lg"
              >
                {isProcessingCustom ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MagicWand className="w-4 h-4 mr-2" />
                    Apply Custom Changes
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2">
                Describe any changes you want and AI will adjust your meal plan
              </div>
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4 mt-4">
              <Button
                variant="outline"
                onClick={analyzeMealPlan}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendUp className="w-4 h-4 mr-2" />
                    Analyze Current Plan
                  </>
                )}
              </Button>

              {nutritionalBalance && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgCalories)}</div>
                      <div className="text-xs text-muted-foreground">kcal/day</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgProtein)}g</div>
                      <div className="text-xs text-muted-foreground">protein/day</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">{nutritionalBalance.variety}</div>
                      <div className="text-xs text-muted-foreground">unique meals</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgCarbs)}g</div>
                      <div className="text-xs text-muted-foreground">carbs/day</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">{Math.round(nutritionalBalance.avgFat)}g</div>
                      <div className="text-xs text-muted-foreground">fat/day</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <div className="text-xl font-bold">€{nutritionalBalance.costPerDay.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">cost/day</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>
              Smart suggestions to improve your meal plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
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
