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
import { MagnifyingGlass, Sparkle, X, Microphone, MicrophoneSlash, SpeakerSlash, SpeakerHigh } from '@phosphor-icons/react';
import { MOCK_MEALS } from '@/lib/mockData';
import { MealCard } from './MealCard';
import { CartItem, Meal } from '@/lib/types';
import { toast } from 'sonner';
import { llm } from '@/lib/llm';
import { startContinuousRecognition, stopRecognition, speakText, stopSpeaking, cleanup } from '@/lib/voiceChat';

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
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStoppingRef = useRef(false);

  const categories = ['all', ...Array.from(new Set(MOCK_MEALS.map((m) => m.category)))];

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
      }
      cleanup();
    };
  }, []);

  const toggleVoiceRecognition = async () => {
    if (isListening) {
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      setIsListening(false);
      setInterimText('');
      setIsProcessing(false);
    } else {
      // Check if mic is muted
      if (isMicMuted) {
        toast.error('Microphone is muted. Please unmute to use voice.');
        return;
      }
      
      try {
        setIsListening(true);
        setIsProcessing(true);
        setRecognizedText(''); // Clear previous recognition
        setIsSemanticSearchEnabled(true); // Enable semantic search for voice
        
        stopRecognitionRef.current = await startContinuousRecognition(
          async (text) => {
            setInterimText('');
            setIsListening(false);
            setRecognizedText(text); // Store what was heard
            stopRecognitionRef.current = null;
            
            // Get AI meal suggestions based on voice input
            await performSemanticSearchWithVoice(text);
            setIsProcessing(false);
          },
          (interim) => {
            setInterimText(interim);
          },
          (error: any) => {
            console.error('Voice recognition error:', error);
            setIsListening(false);
            setInterimText('');
            setIsProcessing(false);
            stopRecognitionRef.current = null;
          }
        );
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setIsListening(false);
        setIsProcessing(false);
      }
    }
  };

  const resetVoiceStates = () => {
    // Guaranteed cleanup - always resets all voice-related states
    setIsListening(false);
    setInterimText('');
    setIsSpeaking(false);
    setIsSearching(false);
    setIsProcessing(false);
    setRecognizedText('');
    setIsMicMuted(false);
  };

  const stopVoiceAgent = () => {
    // Set stopping flag to prevent race conditions
    isStoppingRef.current = true;
    
    // Abort any ongoing async operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Stop listening if active
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
    }
    
    // Stop speaking if active (kills audio immediately)
    stopSpeaking();
    
    // Reset all states immediately
    resetVoiceStates();
    
    // Reset stopping flag after microtask to allow cleanup to complete
    queueMicrotask(() => {
      isStoppingRef.current = false;
    });
  };

  const toggleMicrophone = () => {
    if (stopRecognitionRef.current && isListening) {
      // Pause listening
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
      setIsListening(false);
      setInterimText('');
    }
    setIsMicMuted(!isMicMuted);
  };

  const performSemanticSearchWithVoice = async (voiceInput: string) => {
    // Create new abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsSearching(true);
    
    try {
      // Check if stopped or aborted
      if (isStoppingRef.current || abortController.signal.aborted) {
        return;
      }
      
      const mealList = MOCK_MEALS.map((m, i) => 
        `${i + 1}. ${m.name} - ${m.category} - €${(m.price || 0).toFixed(2)}/serving\n   Components: ${m.components.join(', ')}`
      ).join('\n');
      
      const prompt = `Based on the user's request: "${voiceInput}"
      
Find meals from this menu that match their request:

${mealList}

Respond with a conversational explanation of the meals you found, then list the meal IDs.

Format your response as:
EXPLANATION: [Your conversational explanation here]
MEAL_IDS: [id1, id2, id3, ...]`;

      const response = await llm(prompt, 'gpt-4o');
      
      // Check if stopped or aborted after LLM call
      if (isStoppingRef.current || abortController.signal.aborted) {
        return;
      }
      
      const explanationMatch = response.match(/EXPLANATION:\s*(.+?)(?=MEAL_IDS:|$)/s);
      const explanation = explanationMatch ? explanationMatch[1].trim() : "Here are the meals I found for you.";
      
      const mealIdsMatch = response.match(/MEAL_IDS:\s*\[([^\]]+)\]/);
      if (mealIdsMatch) {
        const ids = mealIdsMatch[1].split(',').map(id => id.trim());
        
        // Only update results if not stopped
        if (!isStoppingRef.current && !abortController.signal.aborted) {
          setSemanticResults({
            mealIds: ids,
            explanation,
            confidence: 0.9
          });
          setSearch(voiceInput);
        }
        
        // Check if stopped or aborted before speaking
        if (isStoppingRef.current || abortController.signal.aborted) {
          return;
        }
        
        // Speak the explanation
        if (!isStoppingRef.current) {
          setIsSpeaking(true);
        }
        
        try {
          await speakText(explanation);
        } catch (error: any) {
          // Ignore interruption errors (user stopped speaking)
          if (!error?.message?.includes('interrupted')) {
            console.error('Speech error:', error);
          }
        } finally {
          // ALWAYS reset speaking state in finally block
          if (!isStoppingRef.current) {
            setIsSpeaking(false);
          }
        }
      }
    } catch (error: any) {
      if (!abortController.signal.aborted && !isStoppingRef.current) {
        console.error('Error in voice search:', error);
      }
    } finally {
      // ALWAYS reset searching state in finally block
      if (!isStoppingRef.current) {
        setIsSearching(false);
      }
    }
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

      const response = await llm(promptText, 'gpt-4o-mini', true);
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
      <Card className="p-6 shadow-sm border-border/60">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Search Meals</Label>
              <div className="flex items-center gap-2">
                {(isListening || isSearching || isSpeaking) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopVoiceAgent}
                    className="gap-2 shadow-sm animate-pulse"
                  >
                    <X className="w-4 h-4" weight="bold" />
                    Stop Voice Agent
                  </Button>
                )}
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  disabled={isSearching}
                  className="gap-2 shadow-sm"
                >
                  {isListening ? (
                    <>
                      <MicrophoneSlash className="w-4 h-4 animate-pulse" weight="fill" />
                      {interimText && <span className="text-xs max-w-[100px] truncate">{interimText}</span>}
                    </>
                  ) : (
                    <>
                      <Microphone className="w-4 h-4" weight="fill" />
                      Ask AI
                    </>
                  )}
                </Button>
                <Button
                  variant={isSemanticSearchEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleSemanticSearch}
                  className="gap-2 shadow-sm"
                >
                  <Sparkle className={isSemanticSearchEnabled ? 'fill-current' : ''} weight={isSemanticSearchEnabled ? 'fill' : 'regular'} />
                  AI Search
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={
                  isSemanticSearchEnabled
                    ? "Try: 'healthy protein-rich meals' or 'vegetarian comfort food'"
                    : "Search meals by name, category, or ingredients..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-10 pr-10 h-11 ${isListening ? 'border-primary border-2 animate-pulse shadow-lg' : ''}`}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
                >
                  <X className="w-4 h-4" weight="bold" />
                </button>
              )}
            </div>

            {(isListening || interimText || recognizedText || isSearching || isSpeaking) && (
              <div className="space-y-2">
                {isListening && (
                  <div className="flex items-center justify-between gap-2 text-sm font-medium bg-primary/10 rounded-lg p-3 border-2 border-primary/30 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-primary">🎤 Listening...</span>
                    </div>
                  </div>
                )}
                
                {interimText && (
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <p className="text-sm text-muted-foreground italic">
                      Hearing: "{interimText}"
                    </p>
                  </div>
                )}

                {recognizedText && !isSearching && !isSpeaking && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      ✓ Heard: "{recognizedText}"
                    </p>
                  </div>
                )}
                
                {isSearching && (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    AI is analyzing your request...
                  </div>
                )}
                
                {isSpeaking && (
                  <div className="flex items-center justify-between gap-2 text-sm font-medium bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-blue-700 dark:text-blue-400">🔊 AI is speaking...</span>
                      {isMicMuted && (
                        <Badge variant="secondary" className="text-xs">
                          Mic Muted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMicrophone}
                        className="h-7 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900"
                        title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                      >
                        {isMicMuted ? (
                          <MicrophoneSlash className="w-4 h-4" weight="fill" />
                        ) : (
                          <Microphone className="w-4 h-4" weight="fill" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stopVoiceAgent}
                        className="h-7 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        Stop
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isSemanticSearchEnabled && !isListening && !isSearching && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                  </div>
                  <div className="text-sm text-foreground space-y-1 flex-1">
                    <p className="font-semibold">AI Semantic Search Active</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Search understands context and meaning. Try queries like "low carb dinner options" or "meals with chicken and vegetables"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isSearching && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="font-medium">Analyzing your search with AI...</span>
              </div>
            )}

            {semanticResults && !isSearching && (
              <div className="bg-gradient-to-br from-success/5 to-primary/5 border border-primary/20 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Sparkle className="w-4 h-4 text-success" weight="fill" />
                  </div>
                  <div className="text-sm space-y-2 flex-1">
                    <p className="font-semibold text-foreground">AI Analysis Results</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{semanticResults.explanation}</p>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {Math.round(semanticResults.confidence * 100)}% Confidence
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold mb-3 block">Filter by Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`shadow-sm transition-all ${
                    selectedCategory === category ? 'shadow-md scale-105' : 'hover:scale-105'
                  }`}
                >
                  {category === 'all' ? 'All Meals' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {filteredMeals.length} Meal{filteredMeals.length !== 1 ? 's' : ''}
            </h2>
            {isSemanticSearchEnabled && semanticResults && (
              <p className="text-sm text-muted-foreground mt-1">
                AI-ranked by relevance to your search
              </p>
            )}
          </div>
        </div>

        {filteredMeals.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <MagnifyingGlass className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-2">
                  No meals found
                </p>
                <p className="text-sm text-muted-foreground">
                  {isSemanticSearchEnabled
                    ? "Try rephrasing your search or turn off AI search for basic keyword matching."
                    : "Try adjusting your filters or enable AI Search for smarter results."}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSemanticResults(null);
                }}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
