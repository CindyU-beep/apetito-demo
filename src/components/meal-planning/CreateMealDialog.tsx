import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlannedMeal, Meal, AllergenType, OrganizationProfile } from '@/lib/types';
import { format } from 'date-fns';
import { MagnifyingGlass, Check, Sparkle, Lightning, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MOCK_MEALS } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';

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
  const [profile] = useKV<OrganizationProfile | null>('organization-profile', null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(
    editingMeal?.meal || null
  );
  const [servings, setServings] = useState(
    editingMeal?.servings.toString() || '1'
  );
  const [search, setSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Meal[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'browse' | 'ai'>('browse');
  const [allergenWarning, setAllergenWarning] = useState<AllergenType[]>([]);

  const filteredMeals = MOCK_MEALS.filter(
    (meal) =>
      meal.name.toLowerCase().includes(search.toLowerCase()) ||
      meal.category.toLowerCase().includes(search.toLowerCase()) ||
      meal.components.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (selectedMeal && profile?.preferences.allergenExclusions) {
      const violatedAllergens = selectedMeal.allergens.filter(allergen =>
        profile.preferences.allergenExclusions.includes(allergen)
      );
      setAllergenWarning(violatedAllergens);
      
      if (violatedAllergens.length > 0) {
        const hasNuts = violatedAllergens.includes('nuts');
        
        if (hasNuts) {
          toast.error(
            `🚨 CRITICAL: This meal contains NUTS which is EXCLUDED in your profile! Nut allergies can be life-threatening for ${profile.type} settings. Please reconsider.`,
            { duration: 8000 }
          );
        } else {
          toast.error(
            `⚠️ Warning: This meal contains ${violatedAllergens.join(', ')} which is restricted in your organization profile!`,
            { duration: 5000 }
          );
        }
      }
    } else {
      setAllergenWarning([]);
    }
  }, [selectedMeal, profile]);

  const getAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    setViewMode('ai');
    
    try {
      const dayOfWeek = format(selectedDate, 'EEEE');
      const mealsData = JSON.stringify(MOCK_MEALS.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        calories: m.nutritionalInfo.calories,
        protein: m.nutritionalInfo.protein,
        price: m.price,
        dietaryTags: m.dietaryTags
      })));

      const promptText = `You are a nutritionist AI. Suggest 3-5 best meals for ${dayOfWeek}.

Available meals:
${mealsData}

Consider:
- Day of week (${dayOfWeek}) - lighter meals mid-week, heartier on weekends
- Nutritional balance (aim for 500-700 kcal, 25-35g protein per meal)
- Variety in categories
- Popular combinations

Return ONLY a JSON object:
{
  "suggestions": [
    {
      "mealId": "meal_id",
      "reason": "Brief reason why this is good for ${dayOfWeek}"
    }
  ]
}`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      const suggestedMeals = result.suggestions
        .map((s: { mealId: string; reason: string }) => {
          const meal = MOCK_MEALS.find(m => m.id === s.mealId);
          return meal ? { ...meal, aiReason: s.reason } : null;
        })
        .filter(Boolean) as (Meal & { aiReason: string })[];

      setAiSuggestions(suggestedMeals);
      
      if (suggestedMeals.length === 0) {
        toast.info('No AI suggestions available, browse all meals');
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to get AI suggestions');
      setViewMode('browse');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMeal) {
      toast.error('Please select a meal');
      return;
    }

    if (allergenWarning.length > 0 && profile) {
      const hasNuts = allergenWarning.includes('nuts');
      const severityLevel = hasNuts ? 'CRITICAL' : 'WARNING';
      
      const promptText = `You are a dietary safety assistant. A user is trying to add a meal to their menu that contains allergens they have excluded in their organization profile.

Organization: ${profile.name}
Organization Type: ${profile.type}
Excluded Allergens: ${profile.preferences.allergenExclusions.join(', ')}

Meal Selected: ${selectedMeal.name}
Meal Allergens: ${selectedMeal.allergens.join(', ')}
Violating Allergens: ${allergenWarning.join(', ')}

${hasNuts ? 'CRITICAL ALERT: This meal contains NUTS, which can cause severe allergic reactions and is life-threatening. This is especially serious for ' + profile.type + ' settings where vulnerable populations are served.' : ''}

Generate a brief (2-3 sentences) ${severityLevel} message that:
1. ${hasNuts ? 'Strongly emphasizes the severe danger of nut allergies and urges immediate reconsideration' : 'Reminds them this violates their organization\'s dietary restrictions'}
2. Explains the potential risks (especially for ${profile.type})
3. ${hasNuts ? 'Strongly recommends removing this meal unless absolutely certain the exclusion is incorrect' : 'Suggests they either remove this meal or update their profile if the restriction is no longer needed'}

${hasNuts ? 'Use strong, urgent language emphasizing safety.' : 'Keep it professional but clear about the safety concern.'}`;

      try {
        const aiWarning = await window.spark.llm(promptText, 'gpt-4o-mini', false);
        
        toast.warning(aiWarning, {
          duration: hasNuts ? 10000 : 8000,
          action: {
            label: 'Add Anyway',
            onClick: () => {
              const plannedMeal: PlannedMeal = {
                id: editingMeal?.id || `planned-${Date.now()}`,
                meal: selectedMeal,
                mealType: 'lunch',
                servings: parseInt(servings) || 1,
              };
              onSave(plannedMeal);
              resetForm();
            },
          },
        });
        return;
      } catch (error) {
        console.error('Error generating AI warning:', error);
      }
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
    setAiSuggestions([]);
    setViewMode('browse');
  };

  const renderMealCard = (meal: Meal & { aiReason?: string }) => {
    const hasRestrictedAllergens = profile?.preferences.allergenExclusions?.some(
      allergen => meal.allergens.includes(allergen)
    );
    
    return (
      <div
        key={meal.id}
        onClick={() => setSelectedMeal(meal)}
        className={cn(
          'relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
          selectedMeal?.id === meal.id
            ? 'border-primary bg-primary/5'
            : hasRestrictedAllergens
            ? 'border-destructive/50 bg-destructive/5'
            : 'border-border hover:border-primary/50'
        )}
      >
        {selectedMeal?.id === meal.id && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        )}
        {hasRestrictedAllergens && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
            <Warning className="w-4 h-4" weight="fill" />
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
            {meal.aiReason && (
              <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded mb-2 line-clamp-2">
                <Sparkle className="w-3 h-3 inline mr-1" weight="fill" />
                {meal.aiReason}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mb-2">
              {meal.dietaryTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {meal.allergens.length > 0 && meal.allergens.map((allergen) => {
                const isRestricted = profile?.preferences.allergenExclusions?.includes(allergen);
                return (
                  <Badge 
                    key={allergen} 
                    variant={isRestricted ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    {allergen}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {meal.nutritionalInfo.calories} kcal • {meal.nutritionalInfo.protein}g protein
            </p>
          </div>
        </div>
      </div>
    );
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
            Get AI suggestions or browse all meals from the catalog
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={getAISuggestions}
              disabled={isLoadingSuggestions}
              className="flex-1"
            >
              {isLoadingSuggestions ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Loading...
                </>
              ) : (
                <>
                  <Lightning className="w-4 h-4 mr-2" weight="fill" />
                  AI Suggestions
                </>
              )}
            </Button>
            <Button
              variant={viewMode === 'browse' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('browse')}
              className="flex-1"
            >
              <MagnifyingGlass className="w-4 h-4 mr-2" />
              Browse All
            </Button>
          </div>

          {viewMode === 'browse' && (
            <>
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
                  {filteredMeals.map(renderMealCard)}
                </div>
              </ScrollArea>
            </>
          )}

          {viewMode === 'ai' && !isLoadingSuggestions && (
            <ScrollArea className="h-[400px] pr-4">
              {aiSuggestions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                    <span>AI recommended meals for {format(selectedDate, 'EEEE')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiSuggestions.map(renderMealCard)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No suggestions available</p>
                </div>
              )}
            </ScrollArea>
          )}

          {selectedMeal && (
            <div className="space-y-2 pt-2 border-t">
              {allergenWarning.length > 0 && (
                <Alert variant="destructive" className="animate-pulse-warning">
                  <Warning className="h-4 w-4" weight="fill" />
                  <AlertTitle>Allergen Warning!</AlertTitle>
                  <AlertDescription>
                    This meal contains <strong>{allergenWarning.join(', ')}</strong> which {allergenWarning.length === 1 ? 'is' : 'are'} restricted in your organization profile for{' '}
                    <strong>{profile?.name}</strong>. Adding this could pose health risks.
                  </AlertDescription>
                </Alert>
              )}
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
