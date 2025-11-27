import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealPlan, PlannedMeal } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Trash, PencilSimple, ForkKnife } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const MEAL_TYPE_COLORS = {
  breakfast: 'bg-amber-100 text-amber-900 border-amber-200',
  lunch: 'bg-blue-100 text-blue-900 border-blue-200',
  dinner: 'bg-purple-100 text-purple-900 border-purple-200',
  snack: 'bg-green-100 text-green-900 border-green-200',
};

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

type WeeklyCalendarProps = {
  plan: MealPlan;
  onAddMeal: (date: string) => void;
  onEditMeal: (meal: PlannedMeal, date: string) => void;
  onRemoveMeal: (mealId: string, date: string) => void;
};

export function WeeklyCalendar({
  plan,
  onAddMeal,
  onEditMeal,
  onRemoveMeal,
}: WeeklyCalendarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {plan.days.map((day) => {
        const date = new Date(day.date);
        const isToday =
          format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

        const nutritionalTotals = day.meals.reduce(
          (acc, meal) => {
            if (meal.nutritionalTotals) {
              return {
                calories: acc.calories + meal.nutritionalTotals.calories,
                protein: acc.protein + meal.nutritionalTotals.protein,
                carbs: acc.carbs + meal.nutritionalTotals.carbs,
                fat: acc.fat + meal.nutritionalTotals.fat,
              };
            }
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return (
          <Card
            key={day.date}
            className={cn(isToday && 'ring-2 ring-primary')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div>
                  <div className="font-semibold">{format(date, 'EEEE')}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {format(date, 'MMM d')}
                  </div>
                </div>
                {isToday && (
                  <Badge variant="secondary" className="text-xs">
                    Today
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.meals.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <ForkKnife className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No meals planned
                </div>
              ) : (
                <div className="space-y-2">
                  {day.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {meal.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs mt-1',
                              MEAL_TYPE_COLORS[meal.mealType]
                            )}
                          >
                            {MEAL_TYPE_LABELS[meal.mealType]}
                          </Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => onEditMeal(meal, day.date)}
                          >
                            <PencilSimple className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => onRemoveMeal(meal.id, day.date)}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {meal.servings} servings
                      </div>
                      {meal.nutritionalTotals && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {meal.nutritionalTotals.calories} cal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {day.meals.length > 0 && (
                <div className="pt-2 border-t text-xs space-y-1">
                  <div className="font-medium">Daily Totals</div>
                  <div className="text-muted-foreground">
                    {nutritionalTotals.calories} cal · {nutritionalTotals.protein}g
                    protein · {nutritionalTotals.carbs}g carbs · {nutritionalTotals.fat}
                    g fat
                  </div>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onAddMeal(day.date)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Meal
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
