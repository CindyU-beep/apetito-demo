import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkle, PaperPlaneTilt, User, CurrencyDollar, ForkKnife, ShieldCheck, ChefHat } from '@phosphor-icons/react';
import { Message, CartItem, AgentType } from '@/lib/types';
import { CONVERSATION_STARTERS } from '@/lib/mockData';
import { ProductCard } from '@/components/products/ProductCard';
import { MealCard } from '@/components/meal-planning/MealCard';
import { coordinatorAgent } from '@/lib/agents';
import { toast } from 'sonner';

type ChatInterfaceProps = {
  messages: Message[];
  setMessages: (updater: (current: Message[]) => Message[]) => void;
  onAddToCart: (item: CartItem) => void;
};

const AGENT_CONFIG = {
  coordinator: { 
    icon: Sparkle, 
    color: 'bg-primary text-primary-foreground',
    label: 'Coordinator',
  },
  budget: { 
    icon: CurrencyDollar, 
    color: 'bg-green-600 text-white',
    label: 'Budget Agent',
  },
  nutrition: { 
    icon: ForkKnife, 
    color: 'bg-emerald-600 text-white',
    label: 'Nutrition Agent',
  },
  dietary: { 
    icon: ShieldCheck, 
    color: 'bg-blue-600 text-white',
    label: 'Dietary Agent',
  },
  'meal-planning': { 
    icon: ChefHat, 
    color: 'bg-orange-600 text-white',
    label: 'Meal Planning',
  },
};

export function ChatInterface({ messages, setMessages, onAddToCart }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const agentResponses = coordinatorAgent.analyze({
      userQuery: text,
    });

    const newMessages: Message[] = agentResponses.map((response, index) => ({
      id: (Date.now() + index + 1).toString(),
      role: 'assistant' as const,
      content: response.message,
      timestamp: Date.now() + index,
      products: response.data?.products,
      meals: response.data?.meals,
      agent: response.agent,
      metadata: {
        budget: response.data?.budget,
        nutrition: response.data?.nutrition,
        dietary: response.data?.dietary,
      },
    }));

    setMessages((current) => [...current, ...newMessages]);
    setIsLoading(false);
  };

  const getAgentAvatar = (agent?: AgentType) => {
    if (!agent) return <Sparkle weight="fill" className="w-4 h-4" />;
    const config = AGENT_CONFIG[agent];
    const Icon = config.icon;
    return <Icon weight="fill" className="w-4 h-4" />;
  };

  const getAgentColor = (agent?: AgentType) => {
    if (!agent) return 'bg-primary text-primary-foreground';
    return AGENT_CONFIG[agent].color;
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkle className="w-6 h-6 text-primary" weight="fill" />
              </div>
              <h3 className="font-semibold text-base mb-2">Multi-Agent Assistant</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Powered by specialized agents working together
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Object.entries(AGENT_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Badge key={key} variant="outline" className="text-xs gap-1">
                      <Icon className="w-3 h-3" weight="fill" />
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Try asking:</p>
              <div className="grid grid-cols-1 gap-2">
                {CONVERSATION_STARTERS.map((starter, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3 text-left text-xs"
                    onClick={() => handleSendMessage(starter)}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 animate-slide-up ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className={getAgentColor(message.agent)}>
                      {getAgentAvatar(message.agent)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-2.5 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.agent && (
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] mb-1.5 gap-1"
                      >
                        {getAgentAvatar(message.agent)}
                        {AGENT_CONFIG[message.agent].label}
                      </Badge>
                    )}
                    <div className="text-xs leading-relaxed whitespace-pre-line">{message.content}</div>
                  </div>

                  {message.metadata?.budget && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <CurrencyDollar className="w-3 h-3 text-green-700" weight="bold" />
                        <span className="text-[10px] font-semibold text-green-700">Budget Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold ml-1">${message.metadata.budget.total.toFixed(2)}</span>
                        </div>
                        {message.metadata.budget.savings && message.metadata.budget.savings > 0 && (
                          <div>
                            <span className="text-muted-foreground">Savings:</span>
                            <span className="font-semibold ml-1 text-green-700">${message.metadata.budget.savings.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {message.metadata?.nutrition && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <ForkKnife className="w-3 h-3 text-emerald-700" weight="bold" />
                        <span className="text-[10px] font-semibold text-emerald-700">Avg. Nutrition</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Cal:</span>
                          <span className="font-semibold ml-1">{message.metadata.nutrition.calories}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Protein:</span>
                          <span className="font-semibold ml-1">{message.metadata.nutrition.protein}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbs:</span>
                          <span className="font-semibold ml-1">{message.metadata.nutrition.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fat:</span>
                          <span className="font-semibold ml-1">{message.metadata.nutrition.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.metadata?.dietary && message.metadata.dietary.restrictions.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <ShieldCheck className="w-3 h-3 text-blue-700" weight="bold" />
                        <span className="text-[10px] font-semibold text-blue-700">Dietary Compliance</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.dietary.restrictions.map((r) => (
                          <Badge key={r} variant="secondary" className="text-[9px] capitalize">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.meals && message.meals.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {message.meals.map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onAddToCart={() => {
                            toast.success(`Added ${meal.name} to meal plan`);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {message.products && message.products.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
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
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 animate-slide-up">
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkle weight="fill" className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border">
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
            placeholder="Ask our specialized agents..."
            className="flex-1 text-sm h-9"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="sm" className="h-9 w-9 p-0">
            <PaperPlaneTilt className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
