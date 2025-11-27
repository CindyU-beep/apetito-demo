import { useKV } from '@github/spark/hooks';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, ListChecks, Sparkle, Users } from '@phosphor-icons/react';
import { MealPlan, CartItem, PlannedMeal, OrganizationProfile } from '@/lib/types';
import { WeeklyCalendar } from './WeeklyCalendar';
import { CreateMealDialog } from './CreateMealDialog';
import { MealPlansList } from './MealPlansList';
import { ShoppingListView } from './ShoppingListView';
import { MealPlanningAI } from './MealPlanningAI';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { toast } from 'sonner';
import { MOCK_ORGANIZATION_PROFILE } from '@/lib/mockData';

type MealPlannerProps = {
  onAddToCart: (item: CartItem) => void;
};

export function MealPlanner({ onAddToCart }: MealPlannerProps) {
  const [mealPlans, setMealPlans] = useKV<MealPlan[]>('meal-plans', []);
  const [activePlanId, setActivePlanId] = useKV<string | null>('active-meal-plan', null);
  const [profile] = useKV<OrganizationProfile>('organization-profile', MOCK_ORGANIZATION_PROFILE);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateMealOpen, setIsCreateMealOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<PlannedMeal | null>(null);
  const [view, setView] = useState<'calendar' | 'list' | 'ai'>('calendar');

  useEffect(() => {
    if (mealPlans && mealPlans.length > 0) {
      const needsMigration = mealPlans.some(
        plan => plan.servingSize === undefined || plan.organizationName === undefined
      );

      if (needsMigration) {
        setMealPlans((current = []) =>
          current.map(plan => ({
            ...plan,
            servingSize: plan.servingSize ?? profile?.servings ?? 50,
            organizationName: plan.organizationName ?? profile?.name ?? "St. Mary's Regional Hospital",
          }))
        );
      }
    }
  }, []);

  const activePlan = mealPlans?.find((plan) => plan.id === activePlanId);

  const createNewPlan = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const newPlan: MealPlan = {
      id: `plan-${Date.now()}`,
      name: `Meal Plan - Week of ${format(weekStart, 'MMM d')}`,
      organizationName: profile?.name || "St. Mary's Regional Hospital",
      servingSize: profile?.servings || 50,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      days: Array.from({ length: 7 }, (_, i) => ({
        date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
        meals: [],
      })),
      createdAt: Date.now(),
    };

    setMealPlans((current = []) => [...current, newPlan]);
    setActivePlanId(newPlan.id);
    toast.success('New meal plan created');
  };

  const addMealToPlan = (meal: PlannedMeal, date: string) => {
    if (!activePlan) return;

    setMealPlans((current = []) =>
      current.map((plan) => {
        if (plan.id === activePlan.id) {
          return {
            ...plan,
            days: plan.days.map((day) => {
              if (day.date === date) {
                return {
                  ...day,
                  meals: editingMeal
                    ? day.meals.map((m) => (m.id === editingMeal.id ? meal : m))
                    : [...day.meals, meal],
                };
              }
              return day;
            }),
          };
        }
        return plan;
      })
    );

    setIsCreateMealOpen(false);
    setEditingMeal(null);
    toast.success(editingMeal ? 'Meal updated' : 'Meal added to plan');
  };

  const removeMealFromPlan = (mealId: string, date: string) => {
    if (!activePlan) return;

    setMealPlans((current = []) =>
      current.map((plan) => {
        if (plan.id === activePlan.id) {
          return {
            ...plan,
            days: plan.days.map((day) => {
              if (day.date === date) {
                return {
                  ...day,
                  meals: day.meals.filter((m) => m.id !== mealId),
                };
              }
              return day;
            }),
          };
        }
        return plan;
      })
    );

    toast.success('Meal removed from plan');
  };

  const deletePlan = (planId: string) => {
    setMealPlans((current = []) => current.filter((plan) => plan.id !== planId));
    if (activePlanId === planId) {
      setActivePlanId(null);
    }
    toast.success('Meal plan deleted');
  };

  const updateServingSize = (newSize: number) => {
    if (!activePlan || newSize < 1) return;

    setMealPlans((current = []) =>
      current.map((plan) => {
        if (plan.id === activePlan.id) {
          return {
            ...plan,
            servingSize: newSize,
          };
        }
        return plan;
      })
    );

    toast.success(`Serving size updated to ${newSize} people`);
  };

  const applyAISuggestions = (suggestions: { date: string; meals: PlannedMeal[] }[]) => {
    if (!activePlan) return;

    setMealPlans((current = []) =>
      current.map((plan) => {
        if (plan.id === activePlan.id) {
          return {
            ...plan,
            days: plan.days.map((day) => {
              const suggestion = suggestions.find(s => s.date === day.date);
              if (suggestion) {
                return {
                  ...day,
                  meals: suggestion.meals,
                };
              }
              return day;
            }),
          };
        }
        return plan;
      })
    );
  };

  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Meal Planning
            </CardTitle>
            <CardDescription>
              Plan weekly menus, calculate nutritional totals, and generate shopping lists automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mealPlans && mealPlans.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Your Meal Plans</h3>
                <MealPlansList
                  plans={mealPlans}
                  onSelectPlan={setActivePlanId}
                  onDeletePlan={deletePlan}
                />
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">No meal plans yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first meal plan to start organizing your weekly menus
                  </p>
                </div>
              </div>
            )}
            <Button onClick={createNewPlan} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle>{activePlan.name}</CardTitle>
              <CardDescription>
                {activePlan.organizationName && (
                  <span className="block mb-1">{activePlan.organizationName}</span>
                )}
                {format(new Date(activePlan.startDate), 'MMM d')} -{' '}
                {format(new Date(activePlan.endDate), 'MMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="serving-size" className="text-sm font-medium whitespace-nowrap">
                  Serving Size:
                </Label>
                <Input
                  id="serving-size"
                  type="number"
                  min="1"
                  value={activePlan.servingSize}
                  onChange={(e) => updateServingSize(parseInt(e.target.value) || 1)}
                  className="w-20 h-8 text-center"
                />
                <span className="text-sm text-muted-foreground">people</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActivePlanId(null)}>
                  View All Plans
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setEditingMeal(null);
                    setIsCreateMealOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meal
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list' | 'ai')}>
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkle className="w-4 h-4" weight="fill" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            <span className="hidden sm:inline">Shopping List</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <WeeklyCalendar
            plan={activePlan}
            onAddMeal={(date) => {
              setSelectedDate(new Date(date));
              setEditingMeal(null);
              setIsCreateMealOpen(true);
            }}
            onEditMeal={(meal, date) => {
              setSelectedDate(new Date(date));
              setEditingMeal(meal);
              setIsCreateMealOpen(true);
            }}
            onRemoveMeal={removeMealFromPlan}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <MealPlanningAI 
            plan={activePlan}
            onApplySuggestions={applyAISuggestions}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ShoppingListView plan={activePlan} onAddToCart={onAddToCart} />
        </TabsContent>
      </Tabs>

      <CreateMealDialog
        open={isCreateMealOpen}
        onOpenChange={(open) => {
          setIsCreateMealOpen(open);
          if (!open) setEditingMeal(null);
        }}
        onSave={(meal) => addMealToPlan(meal, format(selectedDate, 'yyyy-MM-dd'))}
        editingMeal={editingMeal}
        selectedDate={selectedDate}
      />
    </div>
  );
}
