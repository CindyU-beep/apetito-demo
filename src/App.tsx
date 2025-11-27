import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatsCircle, ShoppingCart, ClockCounterClockwise, Calendar } from '@phosphor-icons/react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { BrowseProducts } from '@/components/products/BrowseProducts';
import { OrderHistory } from '@/components/orders/OrderHistory';
import { CartPanel } from '@/components/cart/CartPanel';
import { Header } from '@/components/layout/Header';
import { MealPlanner } from '@/components/meal-planning/MealPlanner';
import { CartItem, Message } from '@/lib/types';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [cart, setCart] = useKV<CartItem[]>('cart', []);
  const [messages, setMessages] = useKV<Message[]>('messages', []);
  const [activeTab, setActiveTab] = useState('chat');
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
      />
      
      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <ChatsCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="meal-planning" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Meal Plans</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClockCounterClockwise className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <ChatInterface 
              messages={messages || []}
              setMessages={setMessages}
              onAddToCart={addToCart}
            />
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

      <Toaster />
    </div>
  );
}

export default App;
