import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from '@phosphor-icons/react';
import { Meal } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';

type SimpleMealCardProps = {
  meal: Meal;
  onAddToCart: (meal: Meal) => void;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
};

export function SimpleMealCard({ meal, onAddToCart, showBadge, badgeContent }: SimpleMealCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      {showBadge && badgeContent && (
        <div className="absolute top-2 left-2 z-10">
          {badgeContent}
        </div>
      )}
      
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

        <div className="space-y-1">
          {meal.components.slice(0, 2).map((component, idx) => (
            <p key={idx} className="text-xs text-foreground leading-snug">
              {component}
            </p>
          ))}
          {meal.components.length > 2 && (
            <p className="text-xs text-muted-foreground italic">
              +{meal.components.length - 2} more...
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <span>{meal.nutritionalInfo.calories} kcal</span>
          <span>•</span>
          <span>P: {meal.nutritionalInfo.protein}g</span>
        </div>

        {meal.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meal.allergens.slice(0, 3).map((allergen) => (
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
          onClick={() => onAddToCart(meal)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
