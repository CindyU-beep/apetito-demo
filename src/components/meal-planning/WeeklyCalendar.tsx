import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealPlan, PlannedMeal, OrganizationProfile, AllergenType } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Minus, PencilSimple, CaretRight, TrendUp, Warning, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

type WeeklyCalendarProps = {
  plan: MealPlan;
  onAddMeal: (date: string) => void;
  onEditMeal: (meal: PlannedMeal, date: string) => void;
  onRemoveMeal: (mealId: string, date: string) => void;
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

export function WeeklyCalendar({
  plan,
  onAddMeal,
  onEditMeal,
  onRemoveMeal,
}: WeeklyCalendarProps) {
  const [profile] = useKV<OrganizationProfile | null>('organization-profile', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingDayIndex, setAnalyzingDayIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [nutritionalBalance, setNutritionalBalance] = useState<NutritionalBalance | null>(null);

  const calculateDayTotal = (meals: PlannedMeal[]) => {
    return meals.reduce(
      (sum, m) => sum + m.meal.price * m.servings,
      0
    );
  };

  const getShortDayName = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE').substring(0, 2);
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd.MM');
  };

  const analyzeMealPlan = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    setNutritionalBalance(null);
    
    try {
      const totalDays = plan.days.filter(day => day.meals.length > 0).length;
      
      if (totalDays === 0) {
        toast.info('Add some meals first to get AI insights');
        setIsAnalyzing(false);
        return;
      }

      for (let i = 0; i < plan.days.length; i++) {
        if (plan.days[i].meals.length > 0) {
          setAnalyzingDayIndex(i);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setAnalyzingDayIndex(null);

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

      if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
        const violatingMeals: { meal: string; allergens: AllergenType[]; day: string }[] = [];
        
        plan.days.forEach(day => {
          day.meals.forEach(plannedMeal => {
            const mealAllergens = plannedMeal.meal.allergens.filter(allergen =>
              profile.preferences.allergenExclusions.includes(allergen)
            );
            if (mealAllergens.length > 0) {
              violatingMeals.push({
                meal: plannedMeal.meal.name,
                allergens: mealAllergens,
                day: format(new Date(day.date), 'EEEE'),
              });
            }
          });
        });

        if (violatingMeals.length > 0) {
          const promptText = `You are a dietary compliance AI for ${profile.name}, a ${profile.type}. 
          
The organization has excluded these allergens: ${profile.preferences.allergenExclusions.join(', ')}

However, their current meal plan includes these violations:
${violatingMeals.map(v => `- ${v.meal} (${v.day}) contains: ${v.allergens.join(', ')}`).join('\n')}

Generate a brief, urgent warning message (2-3 sentences) that:
1. States this is a critical compliance issue for their ${profile.type}
2. Lists the specific violations
3. Strongly recommends removing these meals immediately

Keep it professional but emphasize the safety risk.`;

          try {
            const aiWarning = await window.spark.llm(promptText, 'gpt-4o-mini', false);
            
            newSuggestions.push({
              type: 'warning',
              title: '🚨 CRITICAL: Allergen Violations Detected',
              description: aiWarning,
            });
          } catch (error) {
            newSuggestions.push({
              type: 'warning',
              title: '🚨 CRITICAL: Allergen Violations Detected',
              description: `Your meal plan contains ${violatingMeals.length} meal(s) with restricted allergens (${[...new Set(violatingMeals.flatMap(v => v.allergens))].join(', ')}). This violates ${profile.name}'s dietary requirements. Remove these meals immediately.`,
            });
          }
        }
      }

      if (balance.avgCalories < 1500) {
        newSuggestions.push({
          type: 'warning',
          title: 'Low Daily Calories',
          description: `Average ${Math.round(balance.avgCalories)} kcal/day. Consider adding more substantial meals.`,
        });
      }

      if (balance.avgCalories > 2500) {
        newSuggestions.push({
          type: 'warning',
          title: 'High Daily Calories',
          description: `Average ${Math.round(balance.avgCalories)} kcal/day. Consider lighter options.`,
        });
      }

      if (balance.avgProtein < 50) {
        newSuggestions.push({
          type: 'warning',
          title: 'Low Protein Intake',
          description: `Average ${Math.round(balance.avgProtein)}g/day. Add protein-rich meals.`,
        });
      }

      if (uniqueMeals < 4 && totalDays >= 5) {
        newSuggestions.push({
          type: 'info',
          title: 'Limited Variety',
          description: `Only ${uniqueMeals} unique meals. Mix it up for better nutrition!`,
        });
      }

      if (balance.costPerDay > 15) {
        newSuggestions.push({
          type: 'info',
          title: 'Budget Optimization',
          description: `€${balance.costPerDay.toFixed(2)}/day. Save with budget-friendly alternatives.`,
        });
      }

      const sustainabilityMetrics = plan.days.reduce(
        (acc, day) => {
          day.meals.forEach(plannedMeal => {
            if (plannedMeal.meal.sustainability) {
              const s = plannedMeal.meal.sustainability;
              if (s.co2Footprint) acc.totalCO2 += s.co2Footprint * plannedMeal.servings;
              if (s.regionalSourcing) acc.regionalCount++;
              if (s.organicCertified) acc.organicCount++;
              if (s.seasonalProduct) acc.seasonalCount++;
              if (s.sustainabilityScore) {
                acc.totalSustainabilityScore += s.sustainabilityScore;
                acc.sustainabilityCount++;
              }
            }
          });
          return acc;
        },
        { totalCO2: 0, regionalCount: 0, organicCount: 0, seasonalCount: 0, totalSustainabilityScore: 0, sustainabilityCount: 0 }
      );

      const totalMeals = plan.days.reduce((sum, day) => sum + day.meals.length, 0);
      const avgSustainabilityScore = sustainabilityMetrics.sustainabilityCount > 0 
        ? sustainabilityMetrics.totalSustainabilityScore / sustainabilityMetrics.sustainabilityCount 
        : 0;

      if (avgSustainabilityScore > 0 && avgSustainabilityScore >= 80) {
        newSuggestions.push({
          type: 'success',
          title: '🌱 Excellent Sustainability',
          description: `Average sustainability score: ${avgSustainabilityScore.toFixed(0)}/100. Your plan includes ${sustainabilityMetrics.regionalCount} regional, ${sustainabilityMetrics.organicCount} organic, and ${sustainabilityMetrics.seasonalCount} seasonal meals. Total CO₂ footprint: ${sustainabilityMetrics.totalCO2.toFixed(2)}kg.`,
        });
      } else if (avgSustainabilityScore > 0 && avgSustainabilityScore < 70) {
        newSuggestions.push({
          type: 'info',
          title: '🌍 Sustainability Improvement',
          description: `Average sustainability score: ${avgSustainabilityScore.toFixed(0)}/100. Consider adding more regional, organic, or seasonal options to reduce environmental impact. Current CO₂: ${sustainabilityMetrics.totalCO2.toFixed(2)}kg.`,
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

  return (
    <div className="space-y-6">
      <Card className="border-4 border-success rounded-2xl overflow-hidden">
        <div className="bg-background">
          <div className="flex items-center gap-4 px-6 py-4 border-b-2 border-success/30">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {plan.name}
            </h3>
            <div className="ml-auto text-sm text-muted-foreground">
              ✚ Price: {plan.days.reduce((sum, day) => sum + calculateDayTotal(day.meals), 0).toFixed(2)} €
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex">
              {plan.days.map((day, dayIndex) => {
                const dayTotal = calculateDayTotal(day.meals);
                const isLastDay = dayIndex === plan.days.length - 1;

                return (
                  <div
                    key={day.date}
                    className={cn(
                      'flex-1 min-w-[180px] border-r-2 border-success/30 transition-all duration-300',
                      isLastDay && 'border-r-0',
                      analyzingDayIndex === dayIndex && 'ring-4 ring-primary/50 ring-inset animate-pulse bg-primary/5'
                    )}
                  >
                    <div className="border-b-2 border-success/30 px-3 py-2 bg-muted/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{getShortDayName(day.date)}</span>
                          <span className="text-xs text-muted-foreground">{getFormattedDate(day.date)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onAddMeal(day.date)}
                        >
                          <PencilSimple className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-0 min-h-[400px]">
                      {day.meals.length === 0 ? (
                        <div
                          className="h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/30 transition-colors border-b border-border/50"
                          onClick={() => onAddMeal(day.date)}
                        >
                          <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Add meal</span>
                        </div>
                      ) : (
                        <>
                          {day.meals.map((plannedMeal) => {
                            const hasRestrictedAllergens = profile?.preferences.allergenExclusions?.some(
                              allergen => plannedMeal.meal.allergens.includes(allergen)
                            );
                            
                            return (
                              <div
                                key={plannedMeal.id}
                                className={cn(
                                  "px-3 py-3 border-b border-border/50 hover:bg-accent/30 transition-all cursor-pointer group relative overflow-hidden",
                                  hasRestrictedAllergens && "bg-destructive/10 border-l-4 border-l-destructive",
                                  analyzingDayIndex === dayIndex && "animate-pulse"
                                )}
                                onClick={() => onEditMeal(plannedMeal, day.date)}
                              >
                                {analyzingDayIndex === dayIndex && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-slide-right pointer-events-none" />
                                )}
                                <div className="space-y-1.5 relative z-10">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                      {hasRestrictedAllergens && (
                                        <Warning className="w-4 h-4 text-destructive shrink-0 mt-0.5" weight="fill" />
                                      )}
                                      <h4 className="font-semibold text-xs leading-tight line-clamp-2">
                                        {plannedMeal.meal.name}
                                      </h4>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveMeal(plannedMeal.id, day.date);
                                      }}
                                    >
                                      <Minus className="w-3 h-3 text-destructive" />
                                    </Button>
                                  </div>
                                  
                                  {plannedMeal.meal.components.slice(0, 3).map((component, idx) => (
                                    <p key={idx} className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                      {component}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          <div
                            className="h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/30 transition-colors border-b border-border/50"
                            onClick={() => onAddMeal(day.date)}
                          >
                            <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Add meal</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t-2 border-success/30 px-3 py-2 bg-muted/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">TG</span>
                        <span className="font-bold">{dayTotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-center px-4 bg-muted/10">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <CaretRight className="w-5 h-5 text-success" weight="bold" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" weight="fill" />
            Apetito Analysis
          </CardTitle>
          <CardDescription>
            Get comprehensive insights on your weekly meal plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                <h4 className="text-sm font-semibold mb-2 text-primary">Summary</h4>
                <p className="text-sm leading-relaxed">
                  Your {plan.days.filter(d => d.meals.length > 0).length}-day meal plan contains{' '}
                  <span className="font-semibold">{nutritionalBalance.variety} unique meals</span> with an average of{' '}
                  <span className="font-semibold">{Math.round(nutritionalBalance.avgCalories)} calories</span> per day.
                  Daily budget averages <span className="font-semibold">€{nutritionalBalance.costPerDay.toFixed(2)}</span>.
                  {nutritionalBalance.avgCalories >= 1800 && nutritionalBalance.avgCalories <= 2200 && 
                   nutritionalBalance.avgProtein >= 50 ? (
                    <span className="text-success font-medium"> Your plan is well-balanced!</span>
                  ) : (
                    <span className="text-warning font-medium"> See recommendations below for improvements.</span>
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendUp className="w-4 h-4 text-primary" />
                  Nutritional Breakdown
                </h4>
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
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                Insights & Recommendations
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      suggestion.type === 'warning'
                        ? 'bg-warning/10 border-warning/30'
                        : suggestion.type === 'success'
                        ? 'bg-success/10 border-success/30'
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
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
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm mb-1">{suggestion.title}</h5>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
