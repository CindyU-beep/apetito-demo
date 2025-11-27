import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Sun, Leaf, CloudRain, Sparkle } from '@phosphor-icons/react';
import { CartItem, Meal } from '@/lib/types';
import { MOCK_MEALS } from '@/lib/mockData';
import { SimpleMealCard } from './SimpleMealCard';
import { toast } from 'sonner';

type SeasonalMenuProps = {
  onAddToCart: (item: CartItem) => void;
};

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const SEASONAL_THEMES = {
  winter: {
    name: 'Winter Delights',
    icon: Snowflake,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Hearty comfort foods for the cold season',
    keywords: ['warm', 'hearty', 'comfort', 'roast', 'stew', 'soup'],
  },
  spring: {
    name: 'Spring Fresh',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    description: 'Light and fresh seasonal favorites',
    keywords: ['fresh', 'light', 'salad', 'vegetables', 'asparagus'],
  },
  summer: {
    name: 'Summer Specials',
    icon: Sun,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    description: 'Refreshing dishes for warmer days',
    keywords: ['light', 'salad', 'grilled', 'fish', 'vegetables'],
  },
  autumn: {
    name: 'Autumn Harvest',
    icon: CloudRain,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'Seasonal harvests and warming meals',
    keywords: ['pumpkin', 'mushroom', 'harvest', 'warm'],
  },
};

const SPECIAL_MENUS = {
  christmas: {
    name: 'Christmas Menu 2024',
    icon: Snowflake,
    description: 'Festive traditional classics and modern creations perfect for the holiday season',
    meals: ['meal-15', 'meal-16', 'meal-12', 'meal-20', 'meal-9'],
  },
  easter: {
    name: 'Easter Menu',
    icon: Leaf,
    description: 'Spring-inspired dishes to celebrate Easter',
    meals: ['meal-15', 'meal-5', 'meal-11', 'meal-13'],
  },
};

export function SeasonalMenu({ onAddToCart }: SeasonalMenuProps) {
  const currentMonth = new Date().getMonth();
  const currentSeason: Season = 
    currentMonth >= 11 || currentMonth <= 1 ? 'winter' :
    currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
    currentMonth >= 5 && currentMonth <= 7 ? 'summer' : 'autumn';

  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [showChristmas, setShowChristmas] = useState(currentMonth === 11 || currentMonth === 0);

  const handleAddMeal = (meal: Meal) => {
    onAddToCart({
      product: {
        id: meal.id,
        sku: `MEAL-${meal.id}`,
        name: meal.name,
        description: meal.description,
        category: meal.category,
        price: meal.price,
        unit: 'serving',
        imageUrl: meal.imageUrl,
        allergens: meal.allergens,
        nutritionalInfo: meal.nutritionalInfo,
        inStock: true,
      },
      quantity: 1,
    });
    toast.success(`Added ${meal.name} to cart`);
  };

  const getSeasonalMeals = (season: Season): Meal[] => {
    const theme = SEASONAL_THEMES[season];
    return MOCK_MEALS.filter(meal => 
      theme.keywords.some(keyword => 
        meal.name.toLowerCase().includes(keyword) ||
        meal.description.toLowerCase().includes(keyword) ||
        meal.category.toLowerCase().includes(keyword)
      )
    ).slice(0, 6);
  };

  const seasonalMeals = getSeasonalMeals(selectedSeason);
  const christmasMeals = MOCK_MEALS.filter(m => 
    SPECIAL_MENUS.christmas.meals.includes(m.id)
  );

  return (
    <div className="space-y-8">
      {showChristmas && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start gap-6">
            <div className="bg-white rounded-full p-4 shadow-md">
              <Snowflake className="w-8 h-8 text-blue-600" weight="fill" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {SPECIAL_MENUS.christmas.name}
                </h3>
                <Badge className="bg-accent text-accent-foreground">
                  <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                  Special
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {SPECIAL_MENUS.christmas.description}
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {christmasMeals.map((meal) => (
                  <SimpleMealCard
                    key={meal.id}
                    meal={meal}
                    onAddToCart={handleAddMeal}
                    showBadge
                    badgeContent={
                      <Badge className="bg-destructive text-destructive-foreground">
                        <Snowflake className="w-3 h-3 mr-1" weight="fill" />
                        Christmas
                      </Badge>
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Seasonal Favorites
          </h3>
          <p className="text-sm text-muted-foreground">
            Curated meals perfect for the current season
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(Object.keys(SEASONAL_THEMES) as Season[]).map((season) => {
            const theme = SEASONAL_THEMES[season];
            const Icon = theme.icon;
            const isActive = selectedSeason === season;

            return (
              <Button
                key={season}
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setSelectedSeason(season)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {theme.name}
              </Button>
            );
          })}
        </div>

        <Card className={`p-6 ${SEASONAL_THEMES[selectedSeason].bgColor} border-2`}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = SEASONAL_THEMES[selectedSeason].icon;
                return <Icon className={`w-6 h-6 ${SEASONAL_THEMES[selectedSeason].color}`} weight="fill" />;
              })()}
              <h4 className="text-lg font-semibold text-foreground">
                {SEASONAL_THEMES[selectedSeason].name}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {SEASONAL_THEMES[selectedSeason].description}
            </p>
          </div>

          {seasonalMeals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {seasonalMeals.map((meal) => (
                <SimpleMealCard
                  key={meal.id}
                  meal={meal}
                  onAddToCart={handleAddMeal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No seasonal meals available at the moment
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
