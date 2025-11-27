import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CartItem, AllergenType } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';
import { TrashSimple, Warning, ShieldCheck, ShoppingCart } from '@phosphor-icons/react';
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
  const [orders, setOrders] = useKV<any[]>('orders', []);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.quantity >= (item.product.bulkMinQuantity || 999) && item.product.bulkPrice
      ? item.product.bulkPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const allAllergens = new Set<AllergenType>();
  cart.forEach((item) => {
    item.product.allergens.forEach((allergen) => allAllergens.add(allergen));
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Date.now().toString(),
      date: Date.now(),
      items: cart,
      total: subtotal,
      status: 'completed' as const,
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
            {allAllergens.size > 0 && (
              <Alert className="animate-pulse-warning">
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

            <div className="space-y-4 pt-4 border-t">
              {allAllergens.size === 0 && (
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
                <Button onClick={handleCheckout} className="flex-1">
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
