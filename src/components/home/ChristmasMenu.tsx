import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Gift, Sparkle, Star } from '@phosphor-icons/react';
import { CartItem, Meal } from '@/lib/types';
import { MOCK_MEALS } from '@/lib/mockData';
import { SimpleMealCard } from './SimpleMealCard';
import { toast } from 'sonner';

type ChristmasMenuProps = {
  onAddToCart: (item: CartItem) => void;
};

export function ChristmasMenu({ onAddToCart }: ChristmasMenuProps) {
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

  const christmasMeals = MOCK_MEALS.filter(m => 
    ['meal-15', 'meal-16', 'meal-12', 'meal-20', 'meal-9', 'meal-7'].includes(m.id)
  );

  const featuredMeal = christmasMeals[0];
  const otherMeals = christmasMeals.slice(1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Snowflake className="w-6 h-6 text-blue-600" weight="fill" />
            Christmas Menu 2024
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Festive traditional classics perfect for the holiday season
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-red-500 to-green-500 text-white gap-1 px-3 py-1">
          <Gift className="w-3 h-3" weight="fill" />
          Limited Time
        </Badge>
      </div>

      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-green-50 opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />
        
        <Card className="relative border-2 border-red-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="p-8">
            {featuredMeal && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground shadow-md gap-1">
                    <Star className="w-3 h-3" weight="fill" />
                    Featured
                  </Badge>
                  <img 
                    src={featuredMeal.imageUrl} 
                    alt={featuredMeal.name}
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <Badge className="mb-3 bg-red-500 text-white">
                      <Snowflake className="w-3 h-3 mr-1" weight="fill" />
                      Christmas Special
                    </Badge>
                    <h3 className="text-3xl font-bold text-foreground mb-2">
                      {featuredMeal.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {featuredMeal.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price per serving</p>
                      <p className="text-3xl font-bold text-primary">
                        £{featuredMeal.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {featuredMeal.nutritionalInfo && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="font-semibold">{featuredMeal.nutritionalInfo.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="font-semibold">{featuredMeal.nutritionalInfo.protein}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="font-semibold">{featuredMeal.nutritionalInfo.carbs}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    size="lg" 
                    onClick={() => handleAddMeal(featuredMeal)}
                    className="w-full gap-2 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
                  >
                    <Gift className="w-5 h-5" weight="fill" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkle className="w-5 h-5 text-accent" weight="fill" />
                <h4 className="text-xl font-semibold text-foreground">
                  Complete Your Christmas Menu
                </h4>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherMeals.map((meal) => (
                  <div key={meal.id} className="relative">
                    <SimpleMealCard
                      meal={meal}
                      onAddToCart={handleAddMeal}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
