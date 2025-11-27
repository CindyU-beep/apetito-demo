import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from '@phosphor-icons/react';
import { Meal } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';

type MealCardProps = {
  meal: Meal;
  onAddToPlan: () => void;
};

export function MealCard({ meal, onAddToPlan }: MealCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end max-w-[50%]">
          {meal.dietaryTags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-success text-success-foreground text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {meal.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {meal.servingSize} • €{meal.price.toFixed(2)}
          </p>
        </div>

        <div className="space-y-2">
          {meal.components.map((component, idx) => (
            <p key={idx} className="text-sm text-foreground leading-snug">
              {component}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <span>{meal.nutritionalInfo.calories} kcal</span>
          <span>•</span>
          <span>P: {meal.nutritionalInfo.protein}g</span>
          <span>•</span>
          <span>C: {meal.nutritionalInfo.carbs}g</span>
          <span>•</span>
          <span>F: {meal.nutritionalInfo.fat}g</span>
        </div>

        {meal.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.allergens.map((allergen) => (
              <Badge
                key={allergen}
                variant="outline"
                className="text-xs"
              >
                {ALLERGEN_LABELS[allergen]?.label || allergen}
              </Badge>
            ))}
          </div>
        )}

        <Button
          onClick={onAddToPlan}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Plan
        </Button>
      </CardContent>
    </Card>
  );
}
