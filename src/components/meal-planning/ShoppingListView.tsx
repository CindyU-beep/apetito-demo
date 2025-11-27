import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { MealPlan, CartItem, RecipeIngredient } from '@/lib/types';
import { ShoppingCart, ListChecks, Package, MagnifyingGlass } from '@phosphor-icons/react';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

type ShoppingListViewProps = {
  plan: MealPlan;
  onAddToCart: (item: CartItem) => void;
};

type ConsolidatedIngredient = {
  name: string;
  totalQuantity: string;
  mealNames: string[];
  checked: boolean;
  matchedProduct?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    price: number;
  };
};

export function ShoppingListView({ plan, onAddToCart }: ShoppingListViewProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const consolidatedIngredients = useMemo(() => {
    const ingredientsMap = new Map<string, ConsolidatedIngredient>();

    plan.days.forEach((day) => {
      day.meals.forEach((meal) => {
        meal.ingredients.forEach((ingredient) => {
          const normalizedName = ingredient.name.toLowerCase().trim();
          const existing = ingredientsMap.get(normalizedName);

          const matchedProduct = MOCK_PRODUCTS.find((p) =>
            p.name.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(p.name.toLowerCase())
          );

          if (existing) {
            existing.mealNames.push(meal.name);
            if (ingredient.quantity) {
              existing.totalQuantity += ` + ${ingredient.quantity}`;
            }
          } else {
            ingredientsMap.set(normalizedName, {
              name: ingredient.name,
              totalQuantity: ingredient.quantity || 'As needed',
              mealNames: [meal.name],
              checked: checkedItems.has(normalizedName),
              matchedProduct: matchedProduct
                ? {
                    id: matchedProduct.id,
                    name: matchedProduct.name,
                    sku: matchedProduct.sku,
                    unit: matchedProduct.unit,
                    price: matchedProduct.bulkPrice || matchedProduct.price,
                  }
                : undefined,
            });
          }
        });
      });
    });

    return Array.from(ingredientsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [plan, checkedItems]);

  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return consolidatedIngredients;
    const lower = searchTerm.toLowerCase();
    return consolidatedIngredients.filter(
      (ing) =>
        ing.name.toLowerCase().includes(lower) ||
        ing.mealNames.some((m) => m.toLowerCase().includes(lower))
    );
  }, [consolidatedIngredients, searchTerm]);

  const toggleChecked = (ingredientName: string) => {
    setCheckedItems((current) => {
      const newSet = new Set(current);
      const normalized = ingredientName.toLowerCase().trim();
      if (newSet.has(normalized)) {
        newSet.delete(normalized);
      } else {
        newSet.add(normalized);
      }
      return newSet;
    });
  };

  const addMatchedToCart = (ingredient: ConsolidatedIngredient) => {
    if (!ingredient.matchedProduct) return;

    const product = MOCK_PRODUCTS.find((p) => p.id === ingredient.matchedProduct!.id);
    if (!product) return;

    onAddToCart({
      product,
      quantity: 1,
    });

    toast.success(`Added ${product.name} to cart`);
  };

  const addAllMatchedToCart = () => {
    let addedCount = 0;
    filteredIngredients.forEach((ingredient) => {
      if (ingredient.matchedProduct && !checkedItems.has(ingredient.name.toLowerCase().trim())) {
        const product = MOCK_PRODUCTS.find((p) => p.id === ingredient.matchedProduct!.id);
        if (product) {
          onAddToCart({
            product,
            quantity: 1,
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    } else {
      toast.info('No new items to add');
    }
  };

  const matchedCount = filteredIngredients.filter((i) => i.matchedProduct).length;
  const unmatchedCount = filteredIngredients.length - matchedCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Shopping List
          </CardTitle>
          <CardDescription>
            Consolidated ingredients from all meals in this plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={addAllMatchedToCart} disabled={matchedCount === 0}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All Matched
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{filteredIngredients.length}</div>
              <div className="text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{matchedCount}</div>
              <div className="text-muted-foreground">Matched Products</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{unmatchedCount}</div>
              <div className="text-muted-foreground">Needs Manual Search</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {filteredIngredients.map((ingredient) => {
            const isChecked = checkedItems.has(ingredient.name.toLowerCase().trim());

            return (
              <Card
                key={ingredient.name}
                className={isChecked ? 'opacity-60' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`ingredient-${ingredient.name}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleChecked(ingredient.name)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`ingredient-${ingredient.name}`}
                        className={`font-medium cursor-pointer block ${
                          isChecked ? 'line-through' : ''
                        }`}
                      >
                        {ingredient.name}
                      </label>
                      <div className="text-sm text-muted-foreground mt-1">
                        {ingredient.totalQuantity}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ingredient.mealNames.map((mealName, idx) => (
                          <Badge
                            key={`${mealName}-${idx}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {mealName}
                          </Badge>
                        ))}
                      </div>

                      {ingredient.matchedProduct && (
                        <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-success shrink-0" />
                                <span className="font-medium text-sm">
                                  {ingredient.matchedProduct.name}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {ingredient.matchedProduct.sku} ·{' '}
                                {ingredient.matchedProduct.unit} · $
                                {ingredient.matchedProduct.price.toFixed(2)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addMatchedToCart(ingredient)}
                              disabled={isChecked}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                              Add
                            </Button>
                          </div>
                        </div>
                      )}
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
