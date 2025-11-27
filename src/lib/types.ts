export type AllergenType = 
  | 'nuts'
  | 'dairy'
  | 'gluten'
  | 'eggs'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

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
  };
  inStock: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  products?: Product[];
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
