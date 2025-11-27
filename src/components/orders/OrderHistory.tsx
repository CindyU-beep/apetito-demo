import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendUp, ShoppingCart, CurrencyEur, ChartBar } from '@phosphor-icons/react';
import { OrderHistory as OrderHistoryType } from '@/lib/types';
import { useMemo } from 'react';

export function OrderHistory() {
  const [orders] = useKV<OrderHistoryType[]>('orders', []);

  const displayOrders = orders || [];

  const stats = useMemo(() => {
    if (displayOrders.length === 0) {
      return null;
    }

    const completedOrders = displayOrders.filter(o => o.status === 'completed');
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalSpent / completedOrders.length;
    
    const itemCounts = new Map<string, { name: string; count: number }>();
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = itemCounts.get(item.product.id);
        if (existing) {
          existing.count += item.quantity;
        } else {
          itemCounts.set(item.product.id, { 
            name: item.product.name, 
            count: item.quantity 
          });
        }
      });
    });

    const topItems = Array.from(itemCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const totalItems = completedOrders.reduce(
      (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 
      0
    );

    const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentOrders = completedOrders.filter(o => o.date >= last30Days);
    const recentSpending = recentOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders: completedOrders.length,
      totalSpent,
      avgOrderValue,
      topItems,
      totalItems,
      recentSpending,
      recentOrderCount: recentOrders.length,
    };
  }, [displayOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Order History</h2>
        {stats && (
          <Badge variant="secondary" className="text-sm">
            {stats.totalOrders} completed order{stats.totalOrders !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {displayOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground">
            Your order history will appear here after you place your first order
          </p>
        </Card>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-2xl font-bold">€{stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CurrencyEur className="w-5 h-5 text-primary" weight="bold" />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold">€{stats.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <ChartBar className="w-5 h-5 text-accent" weight="bold" />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                  <div className="bg-success/10 p-2 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-success" weight="bold" />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                    <p className="text-2xl font-bold">€{stats.recentSpending.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.recentOrderCount} order{stats.recentOrderCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-warning/10 p-2 rounded-lg">
                    <TrendUp className="w-5 h-5 text-warning" weight="bold" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {stats && stats.topItems.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" weight="bold" />
                Most Ordered Items
              </h3>
              <div className="space-y-3">
                {stats.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                    </div>
                    <Badge variant="secondary">{item.count} units</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Orders</h3>
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
        </>
      )}
    </div>
  );
}
