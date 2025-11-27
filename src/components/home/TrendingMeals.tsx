import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendUp, Fire } from '@phosphor-icons/react';
import { CartItem, Meal, OrganizationProfile } from '@/lib/types';
import { MOCK_MEALS, MOCK_ORGANIZATION_PROFILE } from '@/lib/mockData';
import { SimpleMealCard } from './SimpleMealCard';
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

type TrendingMealsProps = {
  onAddToCart: (item: CartItem) => void;
};

export function TrendingMeals({ onAddToCart }: TrendingMealsProps) {
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

  const trendingMeals = MOCK_MEALS
    .filter(m => m.category === 'Vegetarian' || m.category === 'Main')
    .slice(0, 6);

  return (
    <>
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

      <AlertDialog open={!!pendingMeal} onOpenChange={(open) => !open && cancelAddMeal()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Fire className="w-5 h-5" weight="fill" />
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
    </>
  );
}
