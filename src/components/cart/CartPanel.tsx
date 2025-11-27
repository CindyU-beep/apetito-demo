import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CartItem, AllergenType, OrderHistory, OrganizationProfile } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';
import { TrashSimple, Warning, ShieldCheck, ShoppingCart, ForkKnife, Sparkle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

type CartPanelProps = {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
};

export function CartPanel({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onClearCart,
}: CartPanelProps) {
  const [orders, setOrders] = useKV<OrderHistory[]>('order-history', []);
  const [profile] = useKV<OrganizationProfile>('organization-profile', {
    id: 'default',
    name: '',
    type: 'hospital',
    contactEmail: '',
    preferences: {
      dietaryRestrictions: [],
      allergenExclusions: [],
    },
    orderHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [activeTab, setActiveTab] = useState('cart');

  const subtotal = cart.reduce((sum, item) => {
    const price = item.quantity >= (item.product.bulkMinQuantity || 999) && item.product.bulkPrice
      ? item.product.bulkPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalNutrition = cart.reduce(
    (acc, item) => ({
      calories: acc.calories + item.product.nutritionalInfo.calories * item.quantity,
      protein: acc.protein + item.product.nutritionalInfo.protein * item.quantity,
      carbs: acc.carbs + item.product.nutritionalInfo.carbs * item.quantity,
      fat: acc.fat + item.product.nutritionalInfo.fat * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const allAllergens = new Set<AllergenType>();
  const profileViolations: AllergenType[] = [];
  
  cart.forEach((item) => {
    item.product.allergens.forEach((allergen) => {
      allAllergens.add(allergen);
      if (profile?.preferences.allergenExclusions?.includes(allergen)) {
        profileViolations.push(allergen);
      }
    });
  });

  const generateAIAnalysis = () => {
    const avgCaloriesPerItem = cart.length > 0 ? totalNutrition.calories / cart.length : 0;
    const proteinPercentage = totalNutrition.calories > 0 
      ? ((totalNutrition.protein * 4) / totalNutrition.calories) * 100 
      : 0;
    const fatPercentage = totalNutrition.calories > 0 
      ? ((totalNutrition.fat * 9) / totalNutrition.calories) * 100 
      : 0;
    const carbPercentage = totalNutrition.calories > 0 
      ? ((totalNutrition.carbs * 4) / totalNutrition.calories) * 100 
      : 0;

    let insights: string[] = [];
    let recommendations: string[] = [];

    if (proteinPercentage < 15) {
      insights.push('Lower protein content - may not meet institutional nutrition standards');
      recommendations.push('Consider adding high-protein items like chicken, fish, or legume-based meals');
    } else if (proteinPercentage > 35) {
      insights.push('High protein content - excellent for muscle maintenance');
    } else {
      insights.push('Balanced protein levels - meets recommended dietary guidelines');
    }

    if (fatPercentage > 35) {
      insights.push('Higher fat content - monitor for heart-healthy meal planning');
      recommendations.push('Balance with lower-fat vegetables and whole grains');
    } else if (fatPercentage < 20) {
      insights.push('Lower fat content - heart-healthy option');
    }

    if (avgCaloriesPerItem < 250) {
      insights.push('Lower calorie density - suitable for weight management programs');
    } else if (avgCaloriesPerItem > 500) {
      insights.push('Higher calorie density - good for active populations or nutritional support');
    }

    if (profileViolations.length > 0) {
      insights.push(`⚠️ Contains allergens excluded in your profile: ${profileViolations.map(a => ALLERGEN_LABELS[a].label).join(', ')}`);
      recommendations.push('Review and remove items with excluded allergens before ordering');
    }

    if (profile?.preferences.budgetPerServing) {
      const servings = profile.servingCapacity || 100;
      const costPerServing = subtotal / servings;
      if (costPerServing > profile.preferences.budgetPerServing) {
        insights.push(`Over budget: $${costPerServing.toFixed(2)}/serving vs target $${profile.preferences.budgetPerServing.toFixed(2)}`);
        recommendations.push('Consider bulk items or alternative products to reduce cost per serving');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Your order meets all organizational dietary guidelines');
      recommendations.push('Nutritionally balanced for institutional meal planning');
    }

    return { insights, recommendations };
  };

  const analysis = cart.length > 0 ? generateAIAnalysis() : null;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (profileViolations.length > 0) {
      toast.error('Cart contains allergens excluded in your organization profile. Please review before ordering.');
      return;
    }

    const newOrder: OrderHistory = {
      id: Date.now().toString(),
      date: Date.now(),
      items: cart,
      total: subtotal,
      status: 'completed',
    };

    setOrders((current = []) => [...current, newOrder]);
    onClearCart();
    toast.success('Order placed successfully!');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Start adding products to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {profileViolations.length > 0 && (
              <Alert className="animate-pulse-warning border-destructive">
                <Warning className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <strong>Profile Alert:</strong> Cart contains allergens excluded in your organization profile:{' '}
                  {Array.from(new Set(profileViolations))
                    .map((a) => ALLERGEN_LABELS[a].label)
                    .join(', ')}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cart">Cart Items</TabsTrigger>
                <TabsTrigger value="analysis">Apetito Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="cart" className="flex-1 flex flex-col mt-4">
                {allAllergens.size > 0 && (
                  <Alert className="mb-4">
                    <Warning className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Allergen Alert:</strong> This order contains{' '}
                      {Array.from(allAllergens)
                        .map((a) => ALLERGEN_LABELS[a].label)
                        .join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const price =
                        item.quantity >= (item.product.bulkMinQuantity || 999) &&
                        item.product.bulkPrice
                          ? item.product.bulkPrice
                          : item.product.price;

                      return (
                        <div key={item.product.id} className="space-y-2">
                          <div className="flex gap-3">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {item.product.sku}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.product.allergens.map((allergen) => (
                                  <Badge
                                    key={allergen}
                                    className={`text-xs ${ALLERGEN_LABELS[allergen].color}`}
                                  >
                                    {ALLERGEN_LABELS[allergen].label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.quantity - 1)
                                }
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.quantity + 1)
                                }
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => onUpdateQuantity(item.product.id, 0)}
                              >
                                <TrashSimple className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="font-semibold">
                              €{(price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <Separator />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 flex flex-col mt-4">
                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-4">
                    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                        <h3 className="font-semibold">AI-Powered Analysis</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile?.name ? `Tailored for ${profile.name}` : 'Institutional nutrition analysis'}
                      </p>
                    </Card>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ForkKnife className="w-4 h-4" />
                        Nutritional Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3">
                          <p className="text-xs text-muted-foreground">Total Calories</p>
                          <p className="text-2xl font-bold">{totalNutrition.calories.toFixed(0)}</p>
                        </Card>
                        <Card className="p-3">
                          <p className="text-xs text-muted-foreground">Protein</p>
                          <p className="text-2xl font-bold">{totalNutrition.protein.toFixed(0)}g</p>
                        </Card>
                        <Card className="p-3">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="text-2xl font-bold">{totalNutrition.carbs.toFixed(0)}g</p>
                        </Card>
                        <Card className="p-3">
                          <p className="text-xs text-muted-foreground">Fat</p>
                          <p className="text-2xl font-bold">{totalNutrition.fat.toFixed(0)}g</p>
                        </Card>
                      </div>
                    </div>

                    {analysis && (
                      <>
                        <div>
                          <h4 className="font-semibold mb-3">Insights</h4>
                          <div className="space-y-2">
                            {analysis.insights.map((insight, index) => (
                              <Card key={index} className="p-3">
                                <p className="text-sm">{insight}</p>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Recommendations</h4>
                          <div className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                              <Card key={index} className="p-3 bg-accent/5">
                                <p className="text-sm">{rec}</p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 pt-4 border-t mt-4">
              {allAllergens.size === 0 && activeTab === 'cart' && (
                <Alert>
                  <ShieldCheck className="w-4 h-4" />
                  <AlertDescription>
                    No allergens detected in this order
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClearCart} className="flex-1">
                  Clear Cart
                </Button>
                <Button 
                  onClick={handleCheckout} 
                  className="flex-1"
                  disabled={profileViolations.length > 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
