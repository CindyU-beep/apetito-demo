import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkle, ArrowsClockwise, TrendUp } from '@phosphor-icons/react';
import { HeroCarousel } from './HeroCarousel';
import { QuickReorder } from './QuickReorder';
import { PredictiveOrdering } from './PredictiveOrdering';
import { TrendingMeals } from './TrendingMeals';
import { ChristmasMenu } from './ChristmasMenu';
import { AIInsights } from './AIInsights';
import { CartItem, OrderHistory } from '@/lib/types';
import { generateSampleOrders } from '@/lib/sampleData';

type HomePageProps = {
  onAddToCart: (item: CartItem) => void;
};

export function HomePage({ onAddToCart }: HomePageProps) {
  const [orderHistory, setOrderHistory] = useKV<OrderHistory[]>('order-history', []);
  const [activeInsight, setActiveInsight] = useState<string>('predictive');

  useEffect(() => {
    if (!orderHistory || orderHistory.length === 0) {
      const sampleOrders = generateSampleOrders();
      setOrderHistory(sampleOrders);
    }
  }, []);

  return (
    <div className="space-y-8">
      <HeroCarousel />

      <AIInsights orderHistory={orderHistory || []} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Sparkle className="w-6 h-6 text-accent" weight="fill" />
              AI-Powered Ordering
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Smart recommendations based on your ordering patterns
            </p>
          </div>
        </div>

        <Tabs value={activeInsight} onValueChange={setActiveInsight} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <TrendUp className="w-4 h-4" />
              <span className="hidden sm:inline">Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="reorder" className="flex items-center gap-2">
              <ArrowsClockwise className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Reorder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictive" className="mt-6">
            <PredictiveOrdering 
              orderHistory={orderHistory || []} 
              onAddToCart={onAddToCart}
            />
          </TabsContent>

          <TabsContent value="reorder" className="mt-6">
            <QuickReorder 
              orderHistory={orderHistory || []} 
              onAddToCart={onAddToCart}
            />
          </TabsContent>
        </Tabs>
      </section>

      <TrendingMeals onAddToCart={onAddToCart} />

      <ChristmasMenu onAddToCart={onAddToCart} />
    </div>
  );
}
