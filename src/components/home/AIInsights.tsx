import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyEur, ChartBar, ShoppingCart, TrendUp } from '@phosphor-icons/react';
import { OrderHistory } from '@/lib/types';

type AIInsightsProps = {
  orderHistory: OrderHistory[];
};

export function AIInsights({ orderHistory }: AIInsightsProps) {
  if (orderHistory.length === 0) {
    return null;
  }

  const completedOrders = orderHistory.filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

  const totalItems = completedOrders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 
    0
  );

  const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentOrders = completedOrders.filter(o => o.date >= last30Days);
  const recentSpending = recentOrders.reduce((sum, order) => sum + order.total, 0);

  const insights = [
    {
      icon: CurrencyEur,
      label: 'Total Spent',
      value: `€${totalSpent.toFixed(2)}`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: ChartBar,
      label: 'Avg Order Value',
      value: `€${avgOrderValue.toFixed(2)}`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: ShoppingCart,
      label: 'Total Items',
      value: totalItems.toString(),
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: TrendUp,
      label: 'Last 30 Days',
      value: `€${recentSpending.toFixed(2)}`,
      subtitle: `${recentOrders.length} order${recentOrders.length !== 1 ? 's' : ''}`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {insights.map((insight) => {
        const Icon = insight.icon;
        return (
          <Card key={insight.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`${insight.bgColor} rounded-full p-3`}>
                <Icon className={`w-6 h-6 ${insight.color}`} weight="bold" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {insight.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {insight.value}
                </p>
                {insight.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
