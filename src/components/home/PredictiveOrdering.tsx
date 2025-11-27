import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkle, TrendUp, ShoppingCart, Clock, Warning } from '@phosphor-icons/react';
import { OrderHistory, CartItem, Meal, OrganizationProfile } from '@/lib/types';
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

type PredictiveOrderingProps = {
  orderHistory: OrderHistory[];
  onAddToCart: (item: CartItem) => void;
};

type PredictiveMeal = {
  meal: Meal;
  confidence: number;
  reason: string;
  predictedDate?: string;
};

export function PredictiveOrdering({ orderHistory, onAddToCart }: PredictiveOrderingProps) {
  const [profile] = useKV<OrganizationProfile>('organization-profile', MOCK_ORGANIZATION_PROFILE);
  const [predictions, setPredictions] = useState<PredictiveMeal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);
  const [allergenWarning, setAllergenWarning] = useState<string>('');

  useEffect(() => {
    generatePredictions();
  }, [orderHistory]);

  const generatePredictions = async () => {
    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const currentMonth = new Date().getMonth();
    const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1;
    const dayOfWeek = new Date().getDay();

    const predictedMeals: PredictiveMeal[] = [];

    if (isWinter) {
      const winterMeals = MOCK_MEALS.filter(m => 
        m.category === 'Main' || 
        m.name.toLowerCase().includes('roast') || 
        m.name.toLowerCase().includes('potato')
      ).slice(0, 2);
      
      winterMeals.forEach(meal => {
        predictedMeals.push({
          meal,
          confidence: 0.87,
          reason: 'Popular during winter season',
        });
      });
    }

    if (orderHistory.length > 0) {
      const recentMeals = MOCK_MEALS.filter(m => 
        m.category === 'Vegetarian'
      ).slice(0, 2);
      
      recentMeals.forEach(meal => {
        predictedMeals.push({
          meal,
          confidence: 0.92,
          reason: 'Based on your ordering patterns',
        });
      });
    }

    if (dayOfWeek === 5) {
      const weekendMeals = MOCK_MEALS.filter(m => 
        m.category === 'Fish' || m.category === 'Dessert'
      ).slice(0, 2);
      
      weekendMeals.forEach(meal => {
        predictedMeals.push({
          meal,
          confidence: 0.79,
          reason: 'Popular for weekend menus',
        });
      });
    }

    if (predictedMeals.length === 0) {
      const popularMeals = MOCK_MEALS
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      popularMeals.forEach(meal => {
        predictedMeals.push({
          meal,
          confidence: 0.75,
          reason: 'Trending in your category',
        });
      });
    }

    const uniquePredictions = Array.from(
      new Map(predictedMeals.map(p => [p.meal.id, p])).values()
    ).slice(0, 6);

    setPredictions(uniquePredictions);
    setIsGenerating(false);
  };

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

  if (isGenerating) {
    return (
      <div className="space-y-4">
        <Card className="p-8 text-center">
          <Sparkle className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" weight="fill" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Analyzing Your Preferences...
          </h3>
          <p className="text-sm text-muted-foreground">
            Our AI is generating personalized recommendations
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkle className="w-4 h-4 text-accent" weight="fill" />
              <span>AI-powered recommendations</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePredictions}
            className="gap-2"
          >
            <TrendUp className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {predictions.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Building Your Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Place a few orders to get personalized predictions
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <div key={prediction.meal.id} className="relative">
                <Badge 
                  className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground shadow-md gap-1"
                >
                  <Sparkle className="w-3 h-3" weight="fill" />
                  {Math.round(prediction.confidence * 100)}% match
                </Badge>
                <SimpleMealCard
                  meal={prediction.meal}
                  onAddToCart={handleAddMeal}
                />
                <div className="mt-2 px-2">
                  <p className="text-xs text-muted-foreground italic">
                    {prediction.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {predictions.length > 0 && (
          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 rounded-full p-3">
                <Sparkle className="w-6 h-6 text-accent" weight="fill" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  How Predictions Work
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI analyzes your order history, seasonal trends, day of week patterns, 
                  and institutional preferences to suggest meals you're most likely to need. 
                  The confidence score shows how well each meal matches your profile.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

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
    </>
  );
}
