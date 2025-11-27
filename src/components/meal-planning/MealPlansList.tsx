import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealPlan } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, Trash, Users } from '@phosphor-icons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type MealPlansListProps = {
  plans: MealPlan[];
  onSelectPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
};

export function MealPlansList({
  plans,
  onSelectPlan,
  onDeletePlan,
}: MealPlansListProps) {
  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const totalMeals = plan.days.reduce(
          (sum, day) => sum + day.meals.length,
          0
        );

        return (
          <Card
            key={plan.id}
            className="hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex-1"
                  onClick={() => onSelectPlan(plan.id)}
                >
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-1 space-y-1">
                    <div>
                      {format(new Date(plan.startDate), 'MMM d')} -{' '}
                      {format(new Date(plan.endDate), 'MMM d, yyyy')}
                    </div>
                    {plan.organizationName && (
                      <div className="text-xs">{plan.organizationName}</div>
                    )}
                  </CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{plan.name}"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeletePlan(plan.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent onClick={() => onSelectPlan(plan.id)}>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {totalMeals} {totalMeals === 1 ? 'meal' : 'meals'} planned
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {plan.servingSize} people
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
