import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendUp, Fire } from '@phosphor-icons/react';
import { CartItem, Meal } from '@/lib/types';
import { MOCK_MEALS } from '@/lib/mockData';
import { SimpleMealCard } from './SimpleMealCard';
import { toast } from 'sonner';

type TrendingMealsProps = {
  onAddToCart: (item: CartItem) => void;
};

export function TrendingMeals({ onAddToCart }: TrendingMealsProps) {
  const handleAddMeal = (meal: Meal) => {
    onAddToCart({
      product: {
        id: meal.id,
        sku: `MEAL-${meal.id}`,
        name: meal.name,
        description: meal.description,
        category: meal.category,
        price: meal.price,
        unit: 'serving',
        imageUrl: meal.imageUrl,
        allergens: meal.allergens,
        nutritionalInfo: meal.nutritionalInfo,
        inStock: true,
      },
      quantity: 1,
    });
    toast.success(`Added ${meal.name} to cart`);
  };

  const trendingMeals = MOCK_MEALS
    .filter(m => m.category === 'Vegetarian' || m.category === 'Main')
    .slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Fire className="w-6 h-6 text-destructive" weight="fill" />
            Trending This Week
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Most popular meals among institutional buyers
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trendingMeals.map((meal, index) => (
          <div key={meal.id} className="relative">
            {index < 3 && (
              <Badge 
                className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground shadow-md gap-1"
              >
                <TrendUp className="w-3 h-3" weight="bold" />
                #{index + 1} Trending
              </Badge>
            )}
            <SimpleMealCard
              meal={meal}
              onAddToCart={handleAddMeal}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
