import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { MealPlan, CartItem, Product } from '@/lib/types';
import { ShoppingCart, ListChecks, MagnifyingGlass, Package, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

type ShoppingListViewProps = {
  plan: MealPlan;
  onAddToCart: (item: CartItem) => void;
};

type ConsolidatedMeal = {
  mealName: string;
  category: string;
  totalServings: number;
  price: number;
  checked: boolean;
  days: string[];
};

export function ShoppingListView({ plan, onAddToCart }: ShoppingListViewProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const consolidatedMeals = useMemo(() => {
    const mealsMap = new Map<string, ConsolidatedMeal>();

    plan.days.forEach((day) => {
      day.meals.forEach((plannedMeal) => {
        const mealId = plannedMeal.meal.id;
        const existing = mealsMap.get(mealId);

        if (existing) {
          existing.totalServings += plannedMeal.servings;
          existing.days.push(day.date);
        } else {
          mealsMap.set(mealId, {
            mealName: plannedMeal.meal.name,
            category: plannedMeal.meal.category,
            totalServings: plannedMeal.servings,
            price: plannedMeal.meal.price,
            checked: checkedItems.has(mealId),
            days: [day.date],
          });
        }
      });
    });

    return Array.from(mealsMap.entries()).map(([id, data]) => ({ id, ...data }));
  }, [plan, checkedItems]);

  const filteredMeals = useMemo(() => {
    if (!searchTerm) return consolidatedMeals;
    const lower = searchTerm.toLowerCase();
    return consolidatedMeals.filter(
      (meal) =>
        meal.mealName.toLowerCase().includes(lower) ||
        meal.category.toLowerCase().includes(lower)
    );
  }, [consolidatedMeals, searchTerm]);

  const toggleChecked = (mealId: string) => {
    setCheckedItems((current) => {
      const newSet = new Set(current);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  const totalCost = filteredMeals.reduce(
    (sum, meal) => sum + meal.price * meal.totalServings,
    0
  );

  const totalServings = filteredMeals.reduce(
    (sum, meal) => sum + meal.totalServings,
    0
  );

  const handlePlaceOrder = () => {
    consolidatedMeals.forEach((meal) => {
      const mealData = plan.days
        .flatMap(day => day.meals)
        .find(plannedMeal => plannedMeal.meal.id === meal.id);

      if (mealData) {
        const product: Product = {
          id: mealData.meal.id,
          sku: `MEAL-${mealData.meal.id}`,
          name: mealData.meal.name,
          description: mealData.meal.description,
          category: mealData.meal.category,
          price: mealData.meal.price,
          unit: `per portion (${mealData.meal.servingSize})`,
          imageUrl: mealData.meal.imageUrl,
          allergens: mealData.meal.allergens,
          nutritionalInfo: mealData.meal.nutritionalInfo,
          inStock: true,
          sustainability: mealData.meal.sustainability,
          foodSafety: mealData.meal.foodSafety,
        };

        const cartItem: CartItem = {
          product,
          quantity: meal.totalServings,
        };

        onAddToCart(cartItem);
      }
    });

    toast.success(`${consolidatedMeals.length} meals added to cart! Total: €${totalCost.toFixed(2)}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Meal Plan Summary
              </CardTitle>
              <CardDescription>
                Overview of all meals and servings in this plan
              </CardDescription>
            </div>
            <Button 
              onClick={handlePlaceOrder}
              disabled={consolidatedMeals.length === 0}
              size="lg"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Place Order
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{filteredMeals.length}</div>
              <div className="text-muted-foreground">Unique Meals</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalServings}</div>
              <div className="text-muted-foreground">Total Servings</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">
                €{totalCost.toFixed(2)}
              </div>
              <div className="text-muted-foreground">Estimated Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {filteredMeals.map((meal) => {
            const isChecked = checkedItems.has(meal.id);

            return (
              <Card key={meal.id} className={isChecked ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`meal-${meal.id}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleChecked(meal.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`meal-${meal.id}`}
                        className={`font-medium cursor-pointer block ${
                          isChecked ? 'line-through' : ''
                        }`}
                      >
                        {meal.mealName}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {meal.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {meal.totalServings} servings
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Scheduled for {meal.days.length} day{meal.days.length > 1 ? 's' : ''}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          €{(meal.price * meal.totalServings).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (€{meal.price.toFixed(2)} per serving)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
