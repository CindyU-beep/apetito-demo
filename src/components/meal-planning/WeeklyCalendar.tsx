import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealPlan, PlannedMeal } from '@/lib/types';
import { format } from 'date-fns';
import { Plus, Minus, PencilSimple, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  return (
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
                    'flex-1 min-w-[180px] border-r-2 border-success/30',
                    isLastDay && 'border-r-0'
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
                        {day.meals.map((plannedMeal) => (
                          <div
                            key={plannedMeal.id}
                            className="px-3 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer group"
                            onClick={() => onEditMeal(plannedMeal, day.date)}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-xs leading-tight line-clamp-2">
                                  {plannedMeal.meal.name}
                                </h4>
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
                        ))}
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
  );
}
