import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { MOCK_MEALS } from '@/lib/mockData';
import { MealCard } from './MealCard';
import { CartItem, Meal } from '@/lib/types';

type BrowseProductsProps = {
  onAddToCart: (item: CartItem) => void;
};

export function BrowseProducts({ onAddToCart }: BrowseProductsProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const categories = ['all', ...Array.from(new Set(MOCK_MEALS.map((m) => m.category)))];

  const filteredMeals = MOCK_MEALS.filter((meal) => {
    const matchesSearch =
      meal.name.toLowerCase().includes(search.toLowerCase()) ||
      meal.description.toLowerCase().includes(search.toLowerCase()) ||
      meal.category.toLowerCase().includes(search.toLowerCase()) ||
      meal.components.some((c) => c.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddToPlan = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsAddToPlanOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search meals by name, category, or ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Category:</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Meals' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{filteredMeals.length} Meals</h2>
        </div>

        {filteredMeals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No meals match your criteria. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onAddToPlan={() => handleAddToPlan(meal)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isAddToPlanOpen} onOpenChange={setIsAddToPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Meal Plan</DialogTitle>
            <DialogDescription>
              This feature will be available once you create a meal plan. Go to the Meal Plans
              tab to get started.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setIsAddToPlanOpen(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
