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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlannedMeal, MealType } from '@/lib/types';
import { format } from 'date-fns';
import { Sparkle } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
  const [name, setName] = useState(editingMeal?.name || '');
  const [mealType, setMealType] = useState<MealType>(
    editingMeal?.mealType || 'lunch'
  );
  const [servings, setServings] = useState(
    editingMeal?.servings.toString() || '50'
  );
  const [notes, setNotes] = useState(editingMeal?.notes || '');
  const [ingredients, setIngredients] = useState(
    editingMeal?.ingredients.map((i) => `${i.quantity} ${i.name}`).join('\n') || ''
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a meal name');
      return;
    }

    const ingredientsList = ingredients
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.trim().match(/^([\d./\s]+)?(.+)$/);
        return {
          name: parts?.[2]?.trim() || line.trim(),
          quantity: parts?.[1]?.trim() || '',
        };
      });

    const meal: PlannedMeal = {
      id: editingMeal?.id || `meal-${Date.now()}`,
      name: name.trim(),
      mealType,
      servings: parseInt(servings) || 50,
      ingredients: ingredientsList,
      notes: notes.trim() || undefined,
    };

    onSave(meal);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setMealType('lunch');
    setServings('50');
    setNotes('');
    setIngredients('');
  };

  const generateRecipe = async () => {
    if (!name.trim()) {
      toast.error('Please enter a meal name first');
      return;
    }

    setIsGenerating(true);
    try {
      const mealLower = name.toLowerCase();
      let generatedIngredients = '';

      if (mealLower.includes('pasta') || mealLower.includes('spaghetti')) {
        generatedIngredients = `${Math.ceil(parseInt(servings) / 10)}kg pasta\n${Math.ceil(parseInt(servings) / 15)}L tomato sauce\n${Math.ceil(parseInt(servings) / 20)}kg ground beef\n500g parmesan cheese\n2L olive oil\n1kg onions\n500g garlic`;
      } else if (mealLower.includes('chicken')) {
        generatedIngredients = `${Math.ceil(parseInt(servings) / 5)}kg chicken breast\n2L olive oil\n1kg mixed vegetables\n500g garlic\n1kg onions\n500g herbs and spices`;
      } else if (mealLower.includes('salad')) {
        generatedIngredients = `${Math.ceil(parseInt(servings) / 8)}kg lettuce\n${Math.ceil(parseInt(servings) / 10)}kg tomatoes\n1kg cucumbers\n500g carrots\n1L salad dressing\n500g croutons`;
      } else if (mealLower.includes('soup')) {
        generatedIngredients = `${Math.ceil(parseInt(servings) / 5)}L vegetable broth\n2kg mixed vegetables\n1kg potatoes\n500g onions\n200g garlic\n500g herbs`;
      } else {
        generatedIngredients = `${Math.ceil(parseInt(servings) / 10)}kg main ingredient\n2L cooking oil\n1kg vegetables\n500g seasonings`;
      }

      setIngredients(generatedIngredients);
      toast.success('Recipe generated! Review and adjust as needed.');
    } catch (error) {
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMeal ? 'Edit Meal' : 'Add Meal'} - {format(selectedDate, 'EEEE, MMM d')}
          </DialogTitle>
          <DialogDescription>
            Add a meal to your plan with ingredients and serving information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              placeholder="e.g., Chicken Pasta Primavera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <SelectTrigger id="meal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                placeholder="50"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generateRecipe}
                disabled={isGenerating}
              >
                <Sparkle className="w-3.5 h-3.5 mr-1.5" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
            <Textarea
              id="ingredients"
              placeholder="Enter ingredients (one per line)&#10;e.g., 5kg chicken breast&#10;2L olive oil"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Format: quantity item (one per line)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions, dietary considerations, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingMeal ? 'Update Meal' : 'Add Meal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
