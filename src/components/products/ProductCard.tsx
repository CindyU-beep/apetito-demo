import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from '@phosphor-icons/react';
import { Product } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';
import { useState } from 'react';

type ProductCardProps = {
  product: Product;
  onAddToCart: (quantity: number) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(product.bulkMinQuantity || 1);

  const displayPrice = quantity >= (product.bulkMinQuantity || 999) && product.bulkPrice
    ? product.bulkPrice
    : product.price;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {product.sku}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {product.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.allergens.map((allergen) => (
              <Badge
                key={allergen}
                className={`text-xs ${ALLERGEN_LABELS[allergen].color}`}
                variant="secondary"
              >
                {ALLERGEN_LABELS[allergen].label}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">€{displayPrice.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">/ {product.unit}</span>
        </div>

        {product.bulkPrice && quantity >= (product.bulkMinQuantity || 0) && (
          <Badge variant="default" className="text-xs">
            Bulk pricing applied
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <span className="px-3 text-sm font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>

        <Button
          className="flex-1"
          size="sm"
          onClick={() => onAddToCart(quantity)}
          disabled={!product.inStock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
