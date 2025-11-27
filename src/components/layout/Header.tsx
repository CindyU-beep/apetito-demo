import { ShoppingCart, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
};

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkle className="w-6 h-6 text-primary-foreground" weight="fill" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Apetito AI</h1>
            <p className="text-xs text-muted-foreground">Institutional Procurement</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="default"
          className="relative"
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
    </header>
  );
}
