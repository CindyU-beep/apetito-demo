import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MagnifyingGlass, Sparkle, X, Microphone, Stop } from '@phosphor-icons/react';
import { MOCK_MEALS } from '@/lib/mockData';
import { MealCard } from './MealCard';
import { CartItem, Meal } from '@/lib/types';
import { toast } from 'sonner';

type BrowseProductsProps = {
  onAddToCart: (item: CartItem) => void;
};

type SemanticSearchResult = {
  mealIds: string[];
  explanation: string;
  confidence: number;
};

export function BrowseProducts({ onAddToCart }: BrowseProductsProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isSemanticSearchEnabled, setIsSemanticSearchEnabled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult | null>(null);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const categories = ['all', ...Array.from(new Set(MOCK_MEALS.map((m) => m.category)))];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        toast.success('Voice recognized! Searching...');
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Try again.');
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Enable it in browser settings.');
        } else {
          toast.error('Voice recognition error. Try again.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceSearch = () => {
    if (!isVoiceSupported || !recognitionRef.current) {
      toast.error('Voice search is not supported in this browser');
      return;
    }
    
    setIsListening(true);
    setSearch('');
    toast.info('Listening... Speak your search query');
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (isSemanticSearchEnabled && search.trim().length > 3) {
      const timer = setTimeout(() => {
        performSemanticSearch(search);
      }, 800);
      setSearchDebounceTimer(timer);
    } else {
      setSemanticResults(null);
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [search, isSemanticSearchEnabled]);

  const performSemanticSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const mealsData = MOCK_MEALS.map(meal => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        category: meal.category,
        components: meal.components,
        allergens: meal.allergens,
        dietaryTags: meal.dietaryTags,
      }));

      const promptText = `You are an intelligent meal search assistant. Analyze the user's search query and find the most relevant meals from the catalog based on semantic meaning, not just keyword matching.

User Query: "${query}"

Available Meals:
${JSON.stringify(mealsData, null, 2)}

Analyze the query and return the most relevant meal IDs based on:
1. Semantic meaning and intent (e.g., "healthy" matches low-calorie, high-protein meals)
2. Dietary preferences mentioned (e.g., "vegetarian", "vegan", "meat-free")
3. Cuisine types or cooking styles
4. Ingredients and components
5. Meal occasions or times of day
6. Nutritional goals or requirements

Return ONLY a valid JSON object with this exact structure:
{
  "mealIds": ["id1", "id2", "id3"],
  "explanation": "Brief explanation of why these meals match the query",
  "confidence": 0.85
}

Include up to 15 most relevant meals, ordered by relevance. Confidence should be 0-1.`;

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true);
      const result = JSON.parse(response) as SemanticSearchResult;
      
      setSemanticResults(result);
    } catch (error) {
      console.error('Semantic search error:', error);
      toast.error('AI search temporarily unavailable. Showing standard results.');
      setSemanticResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredMeals = MOCK_MEALS.filter((meal) => {
    if (isSemanticSearchEnabled && semanticResults && search.trim().length > 3) {
      const inSemanticResults = semanticResults.mealIds.includes(meal.id);
      const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
      return inSemanticResults && matchesCategory;
    }

    const matchesSearch =
      search.trim() === '' ||
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

  const toggleSemanticSearch = () => {
    setIsSemanticSearchEnabled(!isSemanticSearchEnabled);
    setSemanticResults(null);
    if (!isSemanticSearchEnabled && search.trim().length > 3) {
      performSemanticSearch(search);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSemanticResults(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Search</Label>
              <Button
                variant={isSemanticSearchEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={toggleSemanticSearch}
                className="gap-2"
              >
                <Sparkle className={isSemanticSearchEnabled ? 'fill-current' : ''} weight={isSemanticSearchEnabled ? 'fill' : 'regular'} />
                AI Search {isSemanticSearchEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={
                  isSemanticSearchEnabled
                    ? "Try: 'healthy protein-rich meals' or 'vegetarian comfort food'"
                    : "Search meals by name, category, or ingredients..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-10 pr-24 ${isListening ? 'border-primary border-2 animate-pulse' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isVoiceSupported && (
                  <Button
                    variant={isListening ? "destructive" : "ghost"}
                    size="sm"
                    onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                    className="h-7 px-2"
                  >
                    {isListening ? (
                      <Stop className="w-4 h-4" weight="fill" />
                    ) : (
                      <Microphone className="w-4 h-4" weight="fill" />
                    )}
                  </Button>
                )}
                {search && (
                  <button
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isListening && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Listening... Speak your search query
              </div>
            )}

            {isSemanticSearchEnabled && (
              <div className="bg-accent/50 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" weight="fill" />
                  <div className="text-xs text-foreground space-y-1">
                    <p className="font-medium">AI Semantic Search Active</p>
                    <p className="text-muted-foreground">
                      Search understands context and meaning. Try queries like "low carb dinner options" or "meals with chicken and vegetables"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Analyzing your search with AI...
              </div>
            )}

            {semanticResults && !isSearching && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" weight="fill" />
                  <div className="text-xs space-y-1 flex-1">
                    <p className="font-medium text-foreground">AI Analysis</p>
                    <p className="text-muted-foreground">{semanticResults.explanation}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Confidence: {Math.round(semanticResults.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Category</Label>
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
          <h2 className="text-lg font-semibold">
            {filteredMeals.length} Meal{filteredMeals.length !== 1 ? 's' : ''}
            {isSemanticSearchEnabled && semanticResults && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (AI-ranked by relevance)
              </span>
            )}
          </h2>
        </div>

        {filteredMeals.length === 0 ? (
          <Card className="p-12 text-center">
            <MagnifyingGlass className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              No meals match your criteria.
            </p>
            {isSemanticSearchEnabled ? (
              <p className="text-sm text-muted-foreground">
                Try rephrasing your search or turn off AI search for basic keyword matching.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or enable AI Search for smarter results.
              </p>
            )}
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
