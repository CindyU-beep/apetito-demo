import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartLine, TrendUp, Clock, ShoppingCart } from '@phosphor-icons/react';
import { OrderHistory } from '@/lib/types';

type AIInsightsProps = {
  orderHistory: OrderHistory[];
};

export function AIInsights({ orderHistory }: AIInsightsProps) {
  if (orderHistory.length === 0) {
    return null;
  }

  const totalOrders = orderHistory.length;
  const completedOrders = orderHistory.filter(o => o.status === 'completed').length;
  const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalSpent / totalOrders;

  const lastOrder = orderHistory.length > 0 
    ? [...orderHistory].sort((a, b) => b.date - a.date)[0]
    : null;

  const daysSinceLastOrder = lastOrder 
    ? Math.floor((Date.now() - lastOrder.date) / (1000 * 60 * 60 * 24))
    : 0;

  const insights = [
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: totalOrders.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: ChartLine,
      label: 'Avg Order Value',
      value: `€${avgOrderValue.toFixed(2)}`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendUp,
      label: 'Completed',
      value: `${completedOrders}/${totalOrders}`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Clock,
      label: 'Last Order',
      value: daysSinceLastOrder === 0 ? 'Today' : `${daysSinceLastOrder}d ago`,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
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
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
