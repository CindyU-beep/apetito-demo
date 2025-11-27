import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Gift, Star, Warning, ShoppingCart } from '@phosphor-icons/react';
import { CartItem, Meal, OrganizationProfile } from '@/lib/types';
import { MOCK_MEALS, MOCK_ORGANIZATION_PROFILE } from '@/lib/mockData';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { checkAllergenViolation } from '@/lib/allergenCheck';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ChristmasMenuProps = {
  onAddToCart: (item: CartItem) => void;
};

export function ChristmasMenu({ onAddToCart }: ChristmasMenuProps) {
  const [profile] = useKV<OrganizationProfile>('organization-profile', MOCK_ORGANIZATION_PROFILE);
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);
  const [allergenWarning, setAllergenWarning] = useState<string>('');

  const handleAddMeal = (meal: Meal) => {
    const product = {
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
    };

    const allergenCheck = checkAllergenViolation(product, profile || null);

    if (allergenCheck.hasViolation) {
      setPendingMeal(meal);
      setAllergenWarning(allergenCheck.warningMessage);
      toast.error(`⚠️ Allergen Warning: ${meal.name} contains ${allergenCheck.violatedAllergens.join(', ')}`);
      return;
    }

    onAddToCart({
      product,
      quantity: 1,
    });
    toast.success(`Added ${meal.name} to cart`);
  };

  const confirmAddMeal = () => {
    if (!pendingMeal) return;

    onAddToCart({
      product: {
        id: pendingMeal.id,
        sku: `MEAL-${pendingMeal.id}`,
        name: pendingMeal.name,
        description: pendingMeal.description,
        category: pendingMeal.category,
        price: pendingMeal.price,
        unit: 'serving',
        imageUrl: pendingMeal.imageUrl,
        allergens: pendingMeal.allergens,
        nutritionalInfo: pendingMeal.nutritionalInfo,
        inStock: true,
      },
      quantity: 1,
    });
    toast.success(`Added ${pendingMeal.name} to cart (with allergen warning)`);
    setPendingMeal(null);
    setAllergenWarning('');
  };

  const cancelAddMeal = () => {
    setPendingMeal(null);
    setAllergenWarning('');
  };

  const christmasMeals = MOCK_MEALS.filter(m => 
    ['meal-15', 'meal-16', 'meal-12', 'meal-20', 'meal-9', 'meal-7'].includes(m.id)
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-red-600" weight="fill" />
            Christmas Menu 2024
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Festive traditional classics
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-red-600 to-green-600 text-white gap-1 px-2.5 py-0.5 text-xs">
          <Gift className="w-3 h-3" weight="fill" />
          Limited
        </Badge>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {christmasMeals.map((meal, idx) => (
              <Card 
                key={meal.id} 
                className="overflow-hidden hover:shadow-md transition-all hover:scale-[1.02] border border-border group"
              >
                <div className="relative h-32">
                  {idx === 0 && (
                    <Badge className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs gap-1 px-1.5 py-0.5">
                      <Star className="w-2.5 h-2.5" weight="fill" />
                      Featured
                    </Badge>
                  )}
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-3 space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
                      {meal.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {meal.nutritionalInfo.calories} kcal
                      </span>
                      <span className="text-sm font-bold text-primary">
                        £{meal.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddMeal(meal)}
                    className="w-full h-8 text-xs gap-1.5"
                    size="sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <AlertDialog open={!!pendingMeal} onOpenChange={(open) => !open && cancelAddMeal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Warning className="w-5 h-5" weight="fill" />
              Allergen Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-base">
              {allergenWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAddMeal}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddMeal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
