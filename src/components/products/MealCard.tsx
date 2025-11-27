import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Leaf, 
  MapPin, 
  Flame, 
  Barbell,
  CaretRight,
  Warning,
  Certificate
} from '@phosphor-icons/react';
import { Meal } from '@/lib/types';
import { ALLERGEN_LABELS } from '@/lib/mockData';
import { SustainabilityBadges } from './SustainabilityBadges';

type MealCardProps = {
  meal: Meal;
  onAddToPlan: () => void;
};

export function MealCard({ meal, onAddToPlan }: MealCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  return (
    <>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-primary/30">
        <div className="relative h-56 overflow-hidden">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[70%]">
            {meal.dietaryTags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                className="bg-success/95 text-success-foreground text-xs font-medium shadow-lg backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <p className="text-lg font-bold text-primary">
                €{meal.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {meal.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="font-medium">{meal.servingSize}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-xs">{meal.category}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {meal.description}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 py-3 px-2 bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-1">
              <Flame className="w-4 h-4 text-primary" weight="fill" />
              <span className="text-xs font-semibold text-foreground">{meal.nutritionalInfo.calories}</span>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Barbell className="w-4 h-4 text-primary" weight="fill" />
              <span className="text-xs font-semibold text-foreground">{meal.nutritionalInfo.protein}g</span>
              <span className="text-[10px] text-muted-foreground">protein</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-primary">C</span>
              <span className="text-xs font-semibold text-foreground">{meal.nutritionalInfo.carbs}g</span>
              <span className="text-[10px] text-muted-foreground">carbs</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-primary">F</span>
              <span className="text-xs font-semibold text-foreground">{meal.nutritionalInfo.fat}g</span>
              <span className="text-[10px] text-muted-foreground">fat</span>
            </div>
          </div>

          {meal.sustainability && (
            <div className="flex items-center gap-3 text-xs">
              {meal.sustainability.regionalSourcing && (
                <div className="flex items-center gap-1 text-success">
                  <MapPin className="w-3.5 h-3.5" weight="fill" />
                  <span className="font-medium">Local</span>
                </div>
              )}
              {meal.sustainability.sustainabilityScore && meal.sustainability.sustainabilityScore >= 70 && (
                <div className="flex items-center gap-1 text-success">
                  <Leaf className="w-3.5 h-3.5" weight="fill" />
                  <span className="font-medium">{meal.sustainability.sustainabilityScore}%</span>
                </div>
              )}
            </div>
          )}

          {meal.allergens.length > 0 && (
            <div className="flex items-start gap-2">
              <Warning className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" weight="fill" />
              <div className="flex flex-wrap gap-1">
                {meal.allergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant="outline"
                    className="text-[10px] border-warning/30 text-warning-foreground bg-warning/5"
                  >
                    {ALLERGEN_LABELS[allergen]?.label || allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onAddToPlan}
              className="flex-1 shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" weight="bold" />
              Add to Plan
            </Button>
            <Button
              onClick={() => setIsDetailsOpen(true)}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{meal.name}</DialogTitle>
            <DialogDescription>{meal.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">€{meal.price.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Serving Size</p>
                <p className="text-xl font-semibold">{meal.servingSize}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>Components</span>
              </h4>
              <ul className="space-y-2">
                {meal.components.map((component, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CaretRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" weight="bold" />
                    <span>{component}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Nutritional Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Flame className="w-5 h-5 text-primary mx-auto mb-1" weight="fill" />
                  <p className="text-2xl font-bold">{meal.nutritionalInfo.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Barbell className="w-5 h-5 text-primary mx-auto mb-1" weight="fill" />
                  <p className="text-2xl font-bold">{meal.nutritionalInfo.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-primary mb-1">C</p>
                  <p className="text-2xl font-bold">{meal.nutritionalInfo.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-primary mb-1">F</p>
                  <p className="text-2xl font-bold">{meal.nutritionalInfo.fat}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
              {(meal.nutritionalInfo.fiber || meal.nutritionalInfo.sugar || meal.nutritionalInfo.salt) && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {meal.nutritionalInfo.fiber && (
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <p className="text-sm font-semibold">{meal.nutritionalInfo.fiber}g</p>
                      <p className="text-xs text-muted-foreground">Fiber</p>
                    </div>
                  )}
                  {meal.nutritionalInfo.sugar && (
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <p className="text-sm font-semibold">{meal.nutritionalInfo.sugar}g</p>
                      <p className="text-xs text-muted-foreground">Sugar</p>
                    </div>
                  )}
                  {meal.nutritionalInfo.salt && (
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <p className="text-sm font-semibold">{meal.nutritionalInfo.salt}g</p>
                      <p className="text-xs text-muted-foreground">Salt</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {meal.dietaryTags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Dietary Information</h4>
                <div className="flex flex-wrap gap-2">
                  {meal.dietaryTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-success text-success-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {meal.allergens.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Warning className="w-5 h-5 text-warning" weight="fill" />
                  Allergen Information
                </h4>
                <div className="flex flex-wrap gap-2">
                  {meal.allergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="outline"
                      className="border-warning text-warning-foreground bg-warning/10"
                    >
                      {ALLERGEN_LABELS[allergen]?.label || allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(meal.sustainability || meal.foodSafety) && (
              <div>
                <h4 className="font-semibold mb-3">Sustainability & Safety</h4>
                <SustainabilityBadges 
                  sustainability={meal.sustainability}
                  foodSafety={meal.foodSafety}
                  compact={false}
                />
                
                {meal.foodSafety?.certifications && meal.foodSafety.certifications.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Certificate className="w-4 h-4 text-primary" weight="fill" />
                      <p className="text-sm font-medium">Certifications</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.foodSafety.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  onAddToPlan();
                  setIsDetailsOpen(false);
                }}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" weight="bold" />
                Add to Meal Plan
              </Button>
              <Button
                onClick={() => setIsDetailsOpen(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
