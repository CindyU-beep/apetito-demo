import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Fire, Star, Heart, CaretLeft, CaretRight } from '@phosphor-icons/react';
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

type TrendingMealsProps = {
  onAddToCart: (item: CartItem) => void;
};

export function TrendingMeals({ onAddToCart }: TrendingMealsProps) {
  const [profile] = useKV<OrganizationProfile>('organization-profile', MOCK_ORGANIZATION_PROFILE);
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);
  const [allergenWarning, setAllergenWarning] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const trendingMeals = MOCK_MEALS
    .filter(m => m.category === 'Vegetarian' || m.category === 'Main')
    .slice(0, 8);

  const getMealRating = (index: number) => {
    const ratings = [4.4, 4.6, 4.2, 4.5, 4.3, 4.7, 4.4, 4.5];
    return ratings[index] || 4.4;
  };

  const getMealReviews = (index: number) => {
    const reviews = [844, 311, 234, 567, 423, 678, 392, 501];
    return reviews[index] || 300;
  };

  const hasDiscount = (index: number) => {
    return index % 3 === 0;
  };

  const getOriginalPrice = (price: number) => {
    return price * 1.2;
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Fire className="w-6 h-6 text-destructive" weight="fill" />
              Trending This Week
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-primary hover:underline">
              View all
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll('left')}
              >
                <CaretLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll('right')}
              >
                <CaretRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingMeals.map((meal, index) => (
            <Card key={meal.id} className="flex-none w-[280px] overflow-hidden border-border hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative h-44 bg-card">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
                {index < 3 && meal.dietaryTags.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-success shadow-md">
                      <span className="text-success font-bold text-xs leading-tight text-center">
                        {meal.dietaryTags[0] === 'Vegetarian' ? '🌱' : 'Top'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="h-5">
                  {hasDiscount(index) && (
                    <Badge className="bg-warning text-warning-foreground text-xs font-semibold">
                      SAVE €{(getOriginalPrice(meal.price) - meal.price).toFixed(2)}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      €{meal.price.toFixed(2)}
                    </span>
                    {hasDiscount(index) && (
                      <span className="text-sm text-muted-foreground line-through">
                        €{getOriginalPrice(meal.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    €{(meal.price / 1).toFixed(2)} / {meal.servingSize}
                  </p>
                </div>

                <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] text-foreground">
                  {meal.name}
                </h3>

                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 text-warning fill-warning" weight="fill" />
                  <span className="font-semibold text-foreground">{getMealRating(index)}</span>
                  <span className="text-muted-foreground">/ {getMealReviews(index)}</span>
                </div>

                <div className="space-y-2 pt-2 mt-auto">
                  <Button
                    onClick={() => handleAddMeal(meal)}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold"
                    size="sm"
                  >
                    Add to cart
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-semibold"
                    size="sm"
                  >
                    Add to plan
                  </Button>
                </div>
              </CardContent>
            </Card>
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
