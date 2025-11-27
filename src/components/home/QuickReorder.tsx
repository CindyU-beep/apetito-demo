import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowsClockwise, ShoppingCart, Check } from '@phosphor-icons/react';
import { OrderHistory, CartItem } from '@/lib/types';
import { toast } from 'sonner';

type QuickReorderProps = {
  orderHistory: OrderHistory[];
  onAddToCart: (item: CartItem) => void;
};

export function QuickReorder({ orderHistory, onAddToCart }: QuickReorderProps) {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const recentOrders = [...orderHistory]
    .sort((a, b) => b.date - a.date)
    .slice(0, 3);

  const handleReorderAll = (order: OrderHistory) => {
    order.items.forEach((item) => {
      onAddToCart(item);
    });
    toast.success(`Added ${order.items.length} items from order #${order.id.slice(0, 8)}`);
  };

  const handleAddItem = (item: CartItem, orderId: string) => {
    onAddToCart(item);
    setAddedItems((prev) => new Set(prev).add(`${orderId}-${item.product.id}`));
    toast.success(`Added ${item.product.name} to cart`);
    
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`${orderId}-${item.product.id}`);
        return newSet;
      });
    }, 2000);
  };

  if (recentOrders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ArrowsClockwise className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Order History Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Your recent orders will appear here for quick reordering
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quickly reorder items from your recent orders
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentOrders.map((order) => {
          const orderDate = new Date(order.date);
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <Card key={order.id} className="p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {orderDate.toLocaleDateString('en-GB', { 
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Badge 
                  variant={order.status === 'completed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">€{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Order Items
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {order.items.map((item) => {
                    const itemKey = `${order.id}-${item.product.id}`;
                    const isAdded = addedItems.has(itemKey);

                    return (
                      <div 
                        key={item.product.id}
                        className="flex items-center justify-between gap-2 text-sm py-1"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × €{item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? 'default' : 'outline'}
                          onClick={() => handleAddItem(item, order.id)}
                          disabled={isAdded}
                          className="shrink-0"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => handleReorderAll(order)}
              >
                <ArrowsClockwise className="w-4 h-4 mr-2" />
                Reorder All
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
