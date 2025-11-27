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
            `🚨 CRITICAL ALLERGEN ALERT: "${selectedMeal.name}" contains NUTS which are STRICTLY EXCLUDED for ${profile.name}. Nut allergies can cause severe anaphylaxis and are life-threatening, especially in ${profile.type} settings. STRONGLY RECOMMEND removing this selection immediately.`,
            { 
              duration: 12000,
              action: {
                label: 'Remove Meal',
                onClick: () => {
                  setSelectedMeal(null);
                  toast.success('Meal removed for safety');
                }
              }
            }
          );
        } else {
          toast.warning(
            `⚠️ ALLERGEN WARNING: "${selectedMeal.name}" contains ${violatedAllergens.join(', ')} which ${violatedAllergens.length === 1 ? 'is' : 'are'} restricted for ${profile.name}. This could cause allergic reactions for individuals at your ${profile.type}. Please consider removing this meal.`,
            { 
              duration: 8000,
              action: {
                label: 'Remove Meal',
                onClick: () => {
                  setSelectedMeal(null);
                  toast.success('Meal removed for safety');
                }
              }
            }
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
      
      let availableMeals = MOCK_MEALS;
      if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
        availableMeals = MOCK_MEALS.filter(meal => 
          !meal.allergens.some(allergen => profile.preferences.allergenExclusions.includes(allergen))
        );
      }
      
      const mealsData = JSON.stringify(availableMeals.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        calories: m.nutritionalInfo.calories,
        protein: m.nutritionalInfo.protein,
        price: m.price,
        dietaryTags: m.dietaryTags,
        allergens: m.allergens
      })));

      let profileContext = '';
      if (profile) {
        profileContext = `\n\nORGANIZATION CONTEXT:
- Organization: ${profile.name}
- Type: ${profile.type}
- Excluded Allergens (meals with these have been pre-filtered): ${profile.preferences.allergenExclusions.join(', ') || 'None'}
- Dietary Preferences: ${profile.preferences.dietaryRestrictions.join(', ') || 'None'}`;
      }

      const promptText = `You are a nutritionist AI assistant. Suggest 3-5 best meals for ${dayOfWeek} that are SAFE and appropriate.${profileContext}

Available meals (pre-filtered for allergen safety):
${mealsData}

Consider:
- Day of week (${dayOfWeek}) - lighter meals mid-week, heartier on weekends
- Nutritional balance (aim for 500-700 kcal, 25-35g protein per meal)
- Variety in categories
- Popular combinations
${profile ? `- Organization type: ${profile.type} (consider appropriate meal types for this setting)` : ''}
${profile?.preferences.dietaryRestrictions.length ? `- Prefer meals tagged as: ${profile.preferences.dietaryRestrictions.join(', ')}` : ''}

Return ONLY a JSON object:
{
  "suggestions": [
    {
      "mealId": "meal_id",
      "reason": "Brief reason why this is good for ${dayOfWeek}${profile ? ` at ${profile.name}` : ''}"
    }
  ]
}`;

      const response = await window.spark.llm(promptText, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      const suggestedMeals = result.suggestions
        .map((s: { mealId: string; reason: string }) => {
          const meal = availableMeals.find(m => m.id === s.mealId);
          return meal ? { ...meal, aiReason: s.reason } : null;
        })
        .filter(Boolean) as (Meal & { aiReason: string })[];

      setAiSuggestions(suggestedMeals);
      
      if (suggestedMeals.length === 0) {
        toast.info('No AI suggestions available, browse all meals');
      } else if (profile?.preferences.allergenExclusions && profile.preferences.allergenExclusions.length > 0) {
        toast.success(`AI suggestions filtered to exclude ${profile.preferences.allergenExclusions.join(', ')} for safety`);
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
      const severityLevel = hasNuts ? 'CRITICAL SAFETY ALERT' : 'SAFETY WARNING';
      
      const promptText = `You are an AI dietary safety assistant specializing in institutional food service safety compliance. 

A meal planner at ${profile.name} (a ${profile.type} facility) is attempting to add a meal that contains allergens explicitly excluded in their organization's safety profile.

ORGANIZATION CONTEXT:
- Name: ${profile.name}
- Type: ${profile.type}
- Excluded Allergens (MUST NOT SERVE): ${profile.preferences.allergenExclusions.join(', ')}
- Serving Capacity: ${profile.servingCapacity || 'Not specified'} people

MEAL BEING ADDED:
- Meal Name: ${selectedMeal.name}
- Contains Allergens: ${selectedMeal.allergens.join(', ')}
- VIOLATING ALLERGENS: ${allergenWarning.join(', ')}

${hasNuts ? `
⚠️ CRITICAL ESCALATION: This meal contains NUTS
- Nut allergies are among the most dangerous food allergens
- Can trigger severe anaphylactic shock within minutes
- Life-threatening, especially for vulnerable populations in ${profile.type} settings
- Cross-contamination risks are high and can affect multiple people
- Legal liability and duty of care considerations are paramount
` : `
⚠️ ALLERGEN VIOLATION DETECTED
- These allergens are restricted for documented safety reasons
- Could cause allergic reactions ranging from mild to severe
- In ${profile.type} settings, vulnerable individuals may not be able to self-advocate
- Safety compliance is a legal and ethical requirement
`}

Generate a ${hasNuts ? 'strongly worded, urgent' : 'firm but professional'} warning message (3-4 sentences) that:

1. Opens with "${severityLevel}:" followed by a clear statement of the violation
2. ${hasNuts ? 'Emphasizes the LIFE-THREATENING nature of nut allergies and the severe consequences of serving this meal' : 'Explains the health risks and why this allergen was excluded'}
3. References the specific context of ${profile.type} facilities and duty of care to vulnerable populations
4. ${hasNuts ? 'STRONGLY URGES immediate removal with language like "This meal MUST NOT be added" and "We strongly recommend selecting a different meal"' : 'Firmly recommends removing this meal or verifying if the allergen exclusion needs updating'}
5. ${hasNuts ? 'Ends with a final urgent plea to prioritize safety over convenience' : 'Ends with a reminder about organizational safety policies'}

${hasNuts ? 'Use CAPITALIZED words for emphasis on critical safety points. Make this unmistakably serious and urgent.' : 'Be clear and direct about the safety concern while remaining professional.'}

Return ONLY the warning message text, no JSON, no extra formatting.`;

      try {
        const prompt = window.spark.llmPrompt([promptText], []);
        const aiWarning = await window.spark.llm(prompt, 'gpt-4o', false);
        
        toast.error(aiWarning, {
          duration: hasNuts ? 15000 : 10000,
          action: {
            label: hasNuts ? 'Remove Meal (Recommended)' : 'Remove Meal',
            onClick: () => {
              setSelectedMeal(null);
              toast.success('Meal removed for safety compliance');
            },
          },
          cancel: {
            label: 'Add Anyway (Override)',
            onClick: () => {
              const plannedMeal: PlannedMeal = {
                id: editingMeal?.id || `planned-${Date.now()}`,
                meal: selectedMeal,
                mealType: 'lunch',
                servings: parseInt(servings) || 1,
              };
              onSave(plannedMeal);
              resetForm();
              toast.warning(`${selectedMeal.name} added with allergen override. Please document this decision.`, { duration: 8000 });
            },
          },
        });
        return;
      } catch (error) {
        console.error('Error generating AI warning:', error);
        
        toast.error(
          hasNuts 
            ? `🚨 CRITICAL SAFETY ALERT: "${selectedMeal.name}" contains NUTS which are STRICTLY PROHIBITED for ${profile.name}. Nut allergies can cause FATAL anaphylactic reactions. This meal MUST NOT be served in ${profile.type} settings. STRONGLY RECOMMEND removing this selection immediately to protect lives.`
            : `⚠️ SAFETY WARNING: "${selectedMeal.name}" contains ${allergenWarning.join(', ')} which are excluded allergens for ${profile.name}. Adding this meal violates your organization's safety policies and could cause allergic reactions. Please remove this meal or verify your allergen exclusion settings.`,
          {
            duration: hasNuts ? 15000 : 10000,
            action: {
              label: hasNuts ? 'Remove Meal (Recommended)' : 'Remove Meal',
              onClick: () => {
                setSelectedMeal(null);
                toast.success('Meal removed for safety compliance');
              },
            },
          }
        );
        return;
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
                <Alert variant="destructive" className={cn(
                  "animate-pulse-warning border-2",
                  allergenWarning.includes('nuts') ? "border-destructive bg-destructive/20" : "border-warning bg-warning/10"
                )}>
                  <Warning className="h-5 w-5" weight="fill" />
                  <AlertTitle className="text-base font-bold">
                    {allergenWarning.includes('nuts') ? '🚨 CRITICAL ALLERGEN ALERT' : '⚠️ Allergen Safety Warning'}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p className="font-semibold">
                      This meal contains <strong className="underline">{allergenWarning.join(', ').toUpperCase()}</strong> which {allergenWarning.length === 1 ? 'is' : 'are'} STRICTLY EXCLUDED for{' '}
                      <strong>{profile?.name}</strong>.
                    </p>
                    {allergenWarning.includes('nuts') ? (
                      <p className="text-sm">
                        Nut allergies can cause SEVERE ANAPHYLAXIS and are LIFE-THREATENING. This poses an extreme safety risk in {profile?.type} settings. 
                        <strong className="block mt-1">STRONGLY RECOMMEND selecting a different meal immediately.</strong>
                      </p>
                    ) : (
                      <p className="text-sm">
                        Adding this meal violates your organization's safety policies and could cause allergic reactions to vulnerable individuals.
                        <strong className="block mt-1">Please select a safer alternative or verify your allergen settings.</strong>
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-background"
                      onClick={() => {
                        setSelectedMeal(null);
                        toast.success('Meal removed for safety compliance');
                      }}
                    >
                      <Warning className="w-4 h-4 mr-2" weight="fill" />
                      Remove This Meal
                    </Button>
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
