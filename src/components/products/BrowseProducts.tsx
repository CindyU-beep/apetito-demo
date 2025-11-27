import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { MOCK_PRODUCTS, ALLERGEN_LABELS } from '@/lib/mockData';
import { ProductCard } from './ProductCard';
import { CartItem, AllergenType } from '@/lib/types';
import { toast } from 'sonner';

type BrowseProductsProps = {
  onAddToCart: (item: CartItem) => void;
};

export function BrowseProducts({ onAddToCart }: BrowseProductsProps) {
  const [search, setSearch] = useState('');
  const [excludedAllergens, setExcludedAllergens] = useState<AllergenType[]>([]);

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    const matchesAllergens = excludedAllergens.every(
      (allergen) => !product.allergens.includes(allergen)
    );

    return matchesSearch && matchesAllergens;
  });

  const toggleAllergen = (allergen: AllergenType) => {
    setExcludedAllergens((current) =>
      current.includes(allergen)
        ? current.filter((a) => a !== allergen)
        : [...current, allergen]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products by name, category, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Exclude Allergens:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ALLERGEN_LABELS).map(([key, { label }]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${key}`}
                    checked={excludedAllergens.includes(key as AllergenType)}
                    onCheckedChange={() => toggleAllergen(key as AllergenType)}
                  />
                  <Label
                    htmlFor={`allergen-${key}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {filteredProducts.length} Products
          </h2>
          {excludedAllergens.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Filtering {excludedAllergens.length} allergen{excludedAllergens.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No products match your criteria. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(quantity) => {
                  onAddToCart({ product, quantity });
                  toast.success(`Added ${product.name} to cart`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
