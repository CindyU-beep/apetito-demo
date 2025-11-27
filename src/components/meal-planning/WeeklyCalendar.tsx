import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealPlan, PlannedMeal } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const DAY_COLORS = {
  monday: 'bg-emerald-50 border-emerald-200',
  tuesday: 'bg-sky-50 border-sky-200',
  wednesday: 'bg-amber-50 border-amber-200',
  thursday: 'bg-rose-50 border-rose-200',
  friday: 'bg-violet-50 border-violet-200',
  saturday: 'bg-orange-50 border-orange-200',
  sunday: 'bg-pink-50 border-pink-200',
};

const DAY_HEADER_COLORS = {
  monday: 'bg-emerald-500 text-white',
  tuesday: 'bg-sky-500 text-white',
  wednesday: 'bg-amber-500 text-white',
  thursday: 'bg-rose-500 text-white',
  friday: 'bg-violet-500 text-white',
  saturday: 'bg-orange-500 text-white',
  sunday: 'bg-pink-500 text-white',
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
    <div className="space-y-4">
      {plan.days.map((day) => {
        const date = new Date(day.date);
        const dayName = format(date, 'EEEE').toLowerCase();
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

        const nutritionalTotals = day.meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + meal.meal.nutritionalInfo.calories * meal.servings,
            protein: acc.protein + meal.meal.nutritionalInfo.protein * meal.servings,
            carbs: acc.carbs + meal.meal.nutritionalInfo.carbs * meal.servings,
            fat: acc.fat + meal.meal.nutritionalInfo.fat * meal.servings,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return (
          <div key={day.date} className="space-y-2">
            <div
              className={cn(
                'px-4 py-2 rounded-lg flex items-center justify-between',
                DAY_HEADER_COLORS[dayName as keyof typeof DAY_HEADER_COLORS]
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg capitalize">{dayName}</span>
                <span className="text-sm opacity-90">{format(date, 'dd.MM.yyyy')}</span>
                {isToday && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
                    Today
                  </Badge>
                )}
              </div>
              {day.meals.length > 0 && (
                <div className="text-sm opacity-90">
                  {nutritionalTotals.calories.toFixed(0)} kcal
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {day.meals.length === 0 ? (
                <Card
                  className={cn(
                    'border-2 border-dashed hover:bg-accent/50 cursor-pointer transition-colors',
                    DAY_COLORS[dayName as keyof typeof DAY_COLORS]
                  )}
                  onClick={() => onAddMeal(day.date)}
                >
                  <CardContent className="p-6 text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Add first meal</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {day.meals.map((plannedMeal) => (
                    <Card
                      key={plannedMeal.id}
                      className={cn(
                        'group overflow-hidden hover:shadow-md transition-shadow',
                        DAY_COLORS[dayName as keyof typeof DAY_COLORS]
                      )}
                    >
                      <div className="relative h-32">
                        <img
                          src={plannedMeal.meal.imageUrl}
                          alt={plannedMeal.meal.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onRemoveMeal(plannedMeal.id, day.date)}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                            {plannedMeal.meal.name}
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {plannedMeal.meal.components.slice(0, 2).map((component, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground line-clamp-1">
                              {component}
                            </p>
                          ))}
                          {plannedMeal.meal.components.length > 2 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{plannedMeal.meal.components.length - 2} more
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                          <span>
                            {(
                              plannedMeal.meal.nutritionalInfo.calories * plannedMeal.servings
                            ).toFixed(0)}{' '}
                            kcal
                          </span>
                        </div>
                        {plannedMeal.servings > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {plannedMeal.servings}x servings
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  <Card
                    className={cn(
                      'border-2 border-dashed hover:bg-accent/50 cursor-pointer transition-colors',
                      DAY_COLORS[dayName as keyof typeof DAY_COLORS]
                    )}
                    onClick={() => onAddMeal(day.date)}
                  >
                    <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center">
                      <Plus className="w-6 h-6 mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium">Add meal</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
