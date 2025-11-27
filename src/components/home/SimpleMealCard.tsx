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
      
      <div className="relative h-32">
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end max-w-[50%]">
          {meal.dietaryTags.slice(0, 1).map((tag) => (
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
      
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1">
            {meal.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {meal.servingSize} • €{meal.price.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{meal.nutritionalInfo.calories} kcal</span>
          <span>•</span>
          <span>P: {meal.nutritionalInfo.protein}g</span>
        </div>

        <Button
          onClick={() => onAddToCart(meal)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
