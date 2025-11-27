import { ShoppingCart, Sparkle, House, Calendar, ClockCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function Header({ cartCount, onCartClick, activeTab, onTabChange }: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'browse', label: 'Meals', icon: ShoppingCart },
    { id: 'meal-planning', label: 'Plan', icon: Calendar },
    { id: 'orders', label: 'Orders', icon: ClockCounterClockwise },
  ];

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Sparkle className="w-6 h-6 text-primary-foreground" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Apetito AI</h1>
              <p className="text-xs text-muted-foreground">Institutional Procurement</p>
            </div>
          </div>

          <nav className="flex items-center justify-center gap-1 flex-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Button
            variant="outline"
            size="default"
            className="relative flex-shrink-0"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center p-1"
                variant="default"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
