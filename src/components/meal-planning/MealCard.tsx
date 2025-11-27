import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Meal } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';
import { SustainabilityBadges } from '@/components/products/SustainabilityBadges';

type MealCardProps = {
  meal: Meal;
  onAddToCart: () => void;
};

export function MealCard({ meal }: MealCardProps) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-16 h-16 rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-xs mb-1 line-clamp-1">{meal.name}</h4>
          <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
            {meal.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {meal.dietaryTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px]">
                {tag}
              </Badge>
            ))}
          </div>

          {(meal.sustainability || meal.foodSafety) && (
            <div className="mb-2">
              <SustainabilityBadges 
                sustainability={meal.sustainability}
                foodSafety={meal.foodSafety}
                compact={true}
              />
            </div>
          )}

          {meal.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meal.allergens.map((allergen) => {
                const config = ALLERGEN_LABELS[allergen];
                return (
                  <Badge
                    key={allergen}
                    className={`text-[8px] ${config.color}`}
                  >
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <span className="font-semibold text-xs text-primary">
            ${meal.price.toFixed(2)}
          </span>
          <div className="text-[9px] text-muted-foreground text-right">
            <div>{meal.nutritionalInfo.calories} cal</div>
            <div>{meal.nutritionalInfo.protein}g protein</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
