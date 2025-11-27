import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@phosphor-icons/react';
import { OrderHistory as OrderHistoryType } from '@/lib/types';

export function OrderHistory() {
  const [orders] = useKV<OrderHistoryType[]>('orders', []);

  const displayOrders = orders || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Order History</h2>

      {displayOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground">
            Your order history will appear here after you place your first order
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === 'completed'
                      ? 'default'
                      : order.status === 'pending'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      €
                      {(
                        (item.quantity >= (item.product.bulkMinQuantity || 999) &&
                        item.product.bulkPrice
                          ? item.product.bulkPrice
                          : item.product.price) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">€{order.total.toFixed(2)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
