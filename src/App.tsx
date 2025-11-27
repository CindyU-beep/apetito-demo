import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { HomePage } from '@/components/home/HomePage';
import { BrowseProducts } from '@/components/products/BrowseProducts';
import { OrderHistory } from '@/components/orders/OrderHistory';
import { CartPanel } from '@/components/cart/CartPanel';
import { Header } from '@/components/layout/Header';
import { MealPlanner } from '@/components/meal-planning/MealPlanner';
import { ChatbotPopup } from '@/components/chat/ChatbotPopup';
import { CartItem } from '@/lib/types';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [cart, setCart] = useKV<CartItem[]>('cart', []);
  const [activeTab, setActiveTab] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: CartItem) => {
    setCart((currentCart = []) => {
      const existingIndex = currentCart.findIndex(
        (i) => i.product.id === item.product.id
      );
      
      if (existingIndex >= 0) {
        const updated = [...currentCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      
      return [...currentCart, item];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((currentCart = []) => 
        currentCart.filter((item) => item.product.id !== productId)
      );
    } else {
      setCart((currentCart = []) =>
        currentCart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={(cart || []).reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home" className="mt-0">
            <HomePage onAddToCart={addToCart} />
          </TabsContent>

          <TabsContent value="browse" className="mt-0">
            <BrowseProducts onAddToCart={addToCart} />
          </TabsContent>

          <TabsContent value="meal-planning" className="mt-0">
            <MealPlanner onAddToCart={addToCart} />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrderHistory />
          </TabsContent>
        </Tabs>
      </main>

      <CartPanel
        cart={cart || []}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onClearCart={clearCart}
      />

      <ChatbotPopup onAddToCart={addToCart} />

      <Toaster />
    </div>
  );
}

export default App;
