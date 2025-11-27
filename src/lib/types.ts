export type AllergenType = 
  | 'nuts'
  | 'dairy'
  | 'gluten'
  | 'eggs'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

export type FoodSafetyCertification = 
  | 'IFS'
  | 'BRC'
  | 'ISO22000'
  | 'HACCP'
  | 'EUOrganic'
  | 'Halal'
  | 'Kosher';

export type SustainabilityData = {
  co2Footprint?: number;
  regionalSourcing?: boolean;
  organicCertified?: boolean;
  sustainabilityScore?: number;
  packaging?: {
    type: string;
    recyclable: boolean;
    recycledContent?: number;
  };
  transportDistance?: number;
  seasonalProduct?: boolean;
};

export type FoodSafetyInfo = {
  certifications: FoodSafetyCertification[];
  traceabilityCode?: string;
  productionDate?: string;
  bestBefore?: string;
  storageConditions?: string;
  euNutritionLabel?: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  bulkPrice?: number;
  bulkMinQuantity?: number;
  unit: string;
  imageUrl: string;
  allergens: AllergenType[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    salt?: number;
    saturatedFat?: number;
  };
  inStock: boolean;
  sustainability?: SustainabilityData;
  foodSafety?: FoodSafetyInfo;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AgentType = 'coordinator' | 'budget' | 'nutrition' | 'dietary' | 'meal-planning';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  products?: Product[];
  meals?: Meal[];
  agent?: AgentType;
  metadata?: {
    budget?: {
      total: number;
      perServing: number;
      savings?: number;
    };
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    dietary?: {
      restrictions: string[];
      warnings: string[];
    };
  };
};

export type RecipeIngredient = {
  name: string;
  quantity: string;
  matched?: Product;
  confidence?: number;
};

export type Recipe = {
  id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
};

export type ComplianceStatus = {
  allergensFree: boolean;
  detectedAllergens: AllergenType[];
  warnings: string[];
  checkedAt: number;
};

export type OrderHistory = {
  id: string;
  date: number;
  items: CartItem[];
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Meal = {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  components: string[];
  allergens: AllergenType[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    salt?: number;
    saturatedFat?: number;
  };
  dietaryTags: string[];
  price: number;
  servingSize: string;
  sustainability?: SustainabilityData;
  foodSafety?: FoodSafetyInfo;
};

export type PlannedMeal = {
  id: string;
  meal: Meal;
  mealType: MealType;
  servings: number;
  notes?: string;
};

export type DayPlan = {
  date: string;
  meals: PlannedMeal[];
};

export type MealPlan = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  createdAt: number;
};

export type DietaryPreference = 'vegetarian' | 'vegan' | 'pescatarian' | 'halal' | 'kosher';

export type DietaryEnforcement = {
  requireVegetarianDaily?: boolean;
  requireVeganDaily?: boolean;
  minimumVegetarianPerWeek?: number;
  minimumVeganPerWeek?: number;
};

export type OrganizationProfile = {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'care-home' | 'university' | 'corporate' | 'other';
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  servingCapacity?: number;
  preferences: {
    dietaryRestrictions: DietaryPreference[];
    allergenExclusions: AllergenType[];
    budgetPerServing?: number;
    specialRequirements?: string;
    dietaryEnforcement?: DietaryEnforcement;
  };
  orderHistory: OrderHistory[];
  createdAt: number;
  updatedAt: number;
};
