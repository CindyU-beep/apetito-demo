import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlannedMeal, Meal } from '@/lib/types';
import { format } from 'date-fns';
import { MagnifyingGlass, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MOCK_MEALS } from '@/lib/mockData';
import { cn } from '@/lib/utils';

type CreateMealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meal: PlannedMeal) => void;
  editingMeal: PlannedMeal | null;
  selectedDate: Date;
};

export function CreateMealDialog({
  open,
  onOpenChange,
  onSave,
  editingMeal,
  selectedDate,
}: CreateMealDialogProps) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(
    editingMeal?.meal || null
  );
  const [servings, setServings] = useState(
    editingMeal?.servings.toString() || '1'
  );
  const [search, setSearch] = useState('');

  const filteredMeals = MOCK_MEALS.filter(
    (meal) =>
      meal.name.toLowerCase().includes(search.toLowerCase()) ||
      meal.category.toLowerCase().includes(search.toLowerCase()) ||
      meal.components.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!selectedMeal) {
      toast.error('Please select a meal');
      return;
    }

    const plannedMeal: PlannedMeal = {
      id: editingMeal?.id || `planned-${Date.now()}`,
      meal: selectedMeal,
      mealType: 'lunch',
      servings: parseInt(servings) || 1,
    };

    onSave(plannedMeal);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMeal(null);
    setServings('1');
    setSearch('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingMeal ? 'Edit Meal' : 'Add Meal'} - {format(selectedDate, 'EEEE, MMM d')}
          </DialogTitle>
          <DialogDescription>
            Select a meal from the catalog and specify servings
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search meals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
                    selectedMeal?.id === meal.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {selectedMeal?.id === meal.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                        {meal.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {meal.category} • €{meal.price.toFixed(2)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {meal.dietaryTags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {meal.nutritionalInfo.calories} kcal
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedMeal && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="servings">Number of Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                placeholder="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedMeal}>
            {editingMeal ? 'Update Meal' : 'Add Meal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
