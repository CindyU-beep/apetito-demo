import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkle, PaperPlaneTilt, User } from '@phosphor-icons/react';
import { Message, Product, CartItem } from '@/lib/types';
import { CONVERSATION_STARTERS, MOCK_PRODUCTS } from '@/lib/mockData';
import { ProductCard } from '@/components/products/ProductCard';
import { toast } from 'sonner';

type ChatInterfaceProps = {
  messages: Message[];
  setMessages: (updater: (current: Message[]) => Message[]) => void;
  onAddToCart: (item: CartItem) => void;
};

export function ChatInterface({ messages, setMessages, onAddToCart }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = generateAIResponse(text);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text,
      timestamp: Date.now(),
      products: response.products,
    };

    setMessages((current) => [...current, assistantMessage]);
    setIsLoading(false);
  };

  const generateAIResponse = (query: string): { text: string; products?: Product[] } => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('gluten-free') || lowerQuery.includes('gluten free')) {
      const products = MOCK_PRODUCTS.filter(p => !p.allergens.includes('gluten'));
      return {
        text: `I found ${products.length} gluten-free products for you. These items are all certified gluten-free and safe for celiac or gluten-sensitive diets.`,
        products: products.slice(0, 4),
      };
    }

    if (lowerQuery.includes('dairy-free') || lowerQuery.includes('dairy free') || lowerQuery.includes('lactose')) {
      const products = MOCK_PRODUCTS.filter(p => !p.allergens.includes('dairy'));
      return {
        text: `Here are our dairy-free options. All products are free from milk, cheese, and other dairy ingredients.`,
        products: products.slice(0, 4),
      };
    }

    if (lowerQuery.includes('lasagna') || lowerQuery.includes('pasta')) {
      const products = MOCK_PRODUCTS.filter(p => 
        p.category === 'Pasta & Grains' || 
        p.category === 'Sauces & Condiments' || 
        p.category === 'Dairy'
      );
      return {
        text: `Perfect! For lasagna, you'll need pasta, sauce, and cheese. I've selected our best institutional products with bulk pricing available.`,
        products: products.slice(0, 4),
      };
    }

    if (lowerQuery.includes('asian') || lowerQuery.includes('soy sauce') || lowerQuery.includes('rice')) {
      const products = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes('rice') || 
        p.name.toLowerCase().includes('soy')
      );
      return {
        text: `Here are our Asian cuisine essentials. We have rice, soy sauce, and other staples in bulk quantities.`,
        products: products.slice(0, 4),
      };
    }

    if (lowerQuery.includes('allergen') || lowerQuery.includes('allergy')) {
      return {
        text: `I can help you identify allergens in your order! Each product card shows allergen badges. You can also view your cart's compliance summary to see all detected allergens. What specific allergen are you concerned about?`,
      };
    }

    const randomProducts = MOCK_PRODUCTS.sort(() => Math.random() - 0.5).slice(0, 4);
    return {
      text: `I'd be happy to help you find the right products! Here are some popular items from our catalog. You can refine your search by mentioning specific dietary needs, cuisine types, or menu items.`,
      products: randomProducts,
    };
  };

  return (
    <Card className="h-[calc(100vh-220px)] flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">AI Procurement Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask about products, recipes, or dietary requirements</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkle className="w-8 h-8 text-primary" weight="fill" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Welcome to AI Procurement</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                I'm here to help you find products, plan menus, and ensure compliance with dietary requirements.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CONVERSATION_STARTERS.map((starter, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left"
                    onClick={() => handleSendMessage(starter)}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkle weight="fill" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {message.products && message.products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {message.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={(qty) => {
                            onAddToCart({ product, quantity: qty });
                            toast.success(`Added ${product.name} to cart`);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-slide-up">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkle weight="fill" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, recipes, or allergens..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <PaperPlaneTilt className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
