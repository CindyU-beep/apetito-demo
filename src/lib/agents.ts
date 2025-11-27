import { Product, Meal } from './types';
import { MOCK_PRODUCTS, MOCK_MEALS } from './mockData';

export type AgentType = 'coordinator' | 'budget' | 'nutrition' | 'dietary' | 'meal-planning';

export type AgentResponse = {
  agent: AgentType;
  message: string;
  data?: {
    products?: Product[];
    meals?: Meal[];
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

export type AgentContext = {
  userQuery: string;
  budget?: number;
  servings?: number;
  dietaryRestrictions?: string[];
  mealType?: string;
  preferences?: string[];
};

class BudgetAgent {
  name = 'Budget Agent';
  role = 'Helping you stay within budget and find the best deals';

  analyze(context: AgentContext): AgentResponse | null {
    const query = context.userQuery.toLowerCase();
    
    if (query.includes('budget') || query.includes('cheap') || query.includes('save') || query.includes('cost') || query.includes('price')) {
      const affordableProducts = MOCK_PRODUCTS
        .filter(p => p.inStock)
        .sort((a, b) => {
          const priceA = a.bulkPrice || a.price;
          const priceB = b.bulkPrice || b.price;
          return priceA - priceB;
        })
        .slice(0, 6);

      const total = affordableProducts.reduce((sum, p) => sum + (p.bulkPrice || p.price), 0);
      const potentialSavings = affordableProducts.reduce((sum, p) => {
        return sum + (p.bulkPrice ? (p.price - p.bulkPrice) : 0);
      }, 0);

      return {
        agent: 'budget',
        message: `💰 **Budget Agent here!** I've found cost-effective options for you. By buying in bulk, you could save $${potentialSavings.toFixed(2)}. These products offer the best value for institutional kitchens.`,
        data: {
          products: affordableProducts,
          budget: {
            total: total,
            perServing: context.servings ? total / context.servings : 0,
            savings: potentialSavings,
          },
        },
      };
    }

    return null;
  }
}

class NutritionAgent {
  name = 'Nutrition Agent';
  role = 'Ensuring balanced nutrition and healthy meal choices';

  analyze(context: AgentContext): AgentResponse | null {
    const query = context.userQuery.toLowerCase();
    
    if (query.includes('nutrition') || query.includes('protein') || query.includes('healthy') || 
        query.includes('calories') || query.includes('low-fat') || query.includes('low fat')) {
      
      let filteredProducts = MOCK_PRODUCTS.filter(p => p.inStock);
      let message = '🥗 **Nutrition Agent reporting!** ';

      if (query.includes('protein') || query.includes('high protein')) {
        filteredProducts = filteredProducts
          .filter(p => p.nutritionalInfo.protein > 15)
          .sort((a, b) => b.nutritionalInfo.protein - a.nutritionalInfo.protein);
        message += `I've selected high-protein options (>15g per serving) to support muscle health and satiety.`;
      } else if (query.includes('low-fat') || query.includes('low fat')) {
        filteredProducts = filteredProducts
          .filter(p => p.nutritionalInfo.fat < 10)
          .sort((a, b) => a.nutritionalInfo.fat - b.nutritionalInfo.fat);
        message += `Here are low-fat options (<10g per serving) for heart-healthy meal planning.`;
      } else if (query.includes('calories') || query.includes('low calorie')) {
        filteredProducts = filteredProducts
          .filter(p => p.nutritionalInfo.calories < 300)
          .sort((a, b) => a.nutritionalInfo.calories - b.nutritionalInfo.calories);
        message += `These are lower-calorie options (<300 cal per serving) for balanced meal planning.`;
      } else {
        filteredProducts = filteredProducts
          .sort((a, b) => {
            const scoreA = a.nutritionalInfo.protein - (a.nutritionalInfo.fat / 2);
            const scoreB = b.nutritionalInfo.protein - (b.nutritionalInfo.fat / 2);
            return scoreB - scoreA;
          });
        message += `I've curated nutritionally balanced options with good protein-to-fat ratios.`;
      }

      const products = filteredProducts.slice(0, 6);
      const avgNutrition = products.reduce((acc, p) => ({
        calories: acc.calories + p.nutritionalInfo.calories,
        protein: acc.protein + p.nutritionalInfo.protein,
        carbs: acc.carbs + p.nutritionalInfo.carbs,
        fat: acc.fat + p.nutritionalInfo.fat,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      Object.keys(avgNutrition).forEach(key => {
        avgNutrition[key as keyof typeof avgNutrition] /= products.length;
      });

      return {
        agent: 'nutrition',
        message,
        data: {
          products,
          nutrition: {
            calories: Math.round(avgNutrition.calories),
            protein: Math.round(avgNutrition.protein),
            carbs: Math.round(avgNutrition.carbs),
            fat: Math.round(avgNutrition.fat),
          },
        },
      };
    }

    return null;
  }
}

class DietaryAgent {
  name = 'Dietary Agent';
  role = 'Managing allergens and dietary restrictions';

  analyze(context: AgentContext): AgentResponse | null {
    const query = context.userQuery.toLowerCase();
    
    const allergenKeywords = {
      'gluten': ['gluten-free', 'gluten free', 'celiac', 'no gluten'],
      'dairy': ['dairy-free', 'dairy free', 'lactose', 'no dairy', 'vegan'],
      'nuts': ['nut-free', 'nut free', 'no nuts', 'allergy'],
      'soy': ['soy-free', 'soy free', 'no soy'],
      'eggs': ['egg-free', 'egg free', 'no eggs', 'vegan'],
      'fish': ['no fish', 'fish-free'],
      'shellfish': ['no shellfish', 'shellfish-free'],
    };

    let detectedRestrictions: string[] = [];
    let filteredProducts = MOCK_PRODUCTS.filter(p => p.inStock);

    for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        detectedRestrictions.push(allergen);
        filteredProducts = filteredProducts.filter(p => !p.allergens.includes(allergen as any));
      }
    }

    if (query.includes('vegan')) {
      detectedRestrictions.push('vegan');
      filteredProducts = filteredProducts.filter(p => 
        !p.allergens.includes('dairy') && 
        !p.allergens.includes('eggs') &&
        !p.allergens.includes('fish') &&
        !p.allergens.includes('shellfish')
      );
    }

    if (query.includes('vegetarian')) {
      detectedRestrictions.push('vegetarian');
      filteredProducts = filteredProducts.filter(p => 
        !p.allergens.includes('fish') &&
        !p.allergens.includes('shellfish')
      );
    }

    if (detectedRestrictions.length > 0) {
      const warnings: string[] = [];
      
      if (detectedRestrictions.includes('nuts') && filteredProducts.some(p => p.category === 'Baking')) {
        warnings.push('Some baking products may have cross-contamination risks');
      }

      const restrictionText = detectedRestrictions.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');

      return {
        agent: 'dietary',
        message: `🛡️ **Dietary Agent checking in!** I've screened all products for ${restrictionText} restrictions. Found ${filteredProducts.length} safe options that meet your dietary requirements.${warnings.length > 0 ? ' ⚠️ Note: ' + warnings.join('. ') : ''}`,
        data: {
          products: filteredProducts.slice(0, 6),
          dietary: {
            restrictions: detectedRestrictions,
            warnings,
          },
        },
      };
    }

    return null;
  }
}

class MealPlanningAgent {
  name = 'Meal Planning Agent';
  role = 'Creating comprehensive meal plans and menus';

  analyze(context: AgentContext): AgentResponse | null {
    const query = context.userQuery.toLowerCase();
    
    if (query.includes('meal plan') || query.includes('menu') || query.includes('recipe') || 
        query.includes('breakfast') || query.includes('lunch') || query.includes('dinner')) {
      
      let filteredMeals = MOCK_MEALS;
      let mealType = '';

      if (query.includes('breakfast')) {
        mealType = 'breakfast';
        filteredMeals = MOCK_MEALS.filter(m => 
          m.category === 'Bread' || m.category === 'Dessert' && m.name.includes('Joghurt')
        );
      } else if (query.includes('lunch') || query.includes('dinner')) {
        mealType = query.includes('lunch') ? 'lunch' : 'dinner';
        filteredMeals = MOCK_MEALS.filter(m => 
          m.category === 'Vegetarian' || m.category === 'Poultry' || 
          m.category === 'Fish' || m.category === 'Meat'
        );
      } else if (query.includes('vegetarian') || query.includes('veggie')) {
        filteredMeals = MOCK_MEALS.filter(m => 
          m.dietaryTags.includes('Vegetarian') || m.dietaryTags.includes('Vegan')
        );
      } else if (query.includes('vegan')) {
        filteredMeals = MOCK_MEALS.filter(m => m.dietaryTags.includes('Vegan'));
      }

      const selectedMeals = filteredMeals.slice(0, 6);
      const relatedProducts = this.findRelatedProducts(selectedMeals);

      return {
        agent: 'meal-planning',
        message: `👨‍🍳 **Meal Planning Agent at your service!** I've curated ${selectedMeals.length} ${mealType ? mealType + ' ' : ''}options with complete nutritional profiles. I've also identified key ingredients you'll need from our catalog.`,
        data: {
          meals: selectedMeals,
          products: relatedProducts,
        },
      };
    }

    if (query.includes('ingredients') || query.includes('shopping list')) {
      const products = MOCK_PRODUCTS.filter(p => p.inStock).slice(0, 8);
      
      return {
        agent: 'meal-planning',
        message: `👨‍🍳 **Meal Planning Agent here!** I've compiled essential ingredients for your kitchen. These staples will help you prepare a variety of meals efficiently.`,
        data: {
          products,
        },
      };
    }

    return null;
  }

  private findRelatedProducts(meals: Meal[]): Product[] {
    const categories = new Set<string>();
    meals.forEach(meal => {
      if (meal.components.some(c => c.toLowerCase().includes('pasta') || c.toLowerCase().includes('reis'))) {
        categories.add('Pasta & Grains');
      }
      if (meal.allergens.includes('dairy') || meal.components.some(c => c.toLowerCase().includes('käse'))) {
        categories.add('Dairy');
      }
      if (meal.components.some(c => c.toLowerCase().includes('soße') || c.toLowerCase().includes('sauce'))) {
        categories.add('Sauces & Condiments');
      }
    });

    return MOCK_PRODUCTS
      .filter(p => categories.has(p.category))
      .slice(0, 4);
  }
}

class CoordinatorAgent {
  name = 'Coordinator Agent';
  role = 'Orchestrating specialized agents for optimal results';

  private agents: {
    budget: BudgetAgent;
    nutrition: NutritionAgent;
    dietary: DietaryAgent;
    mealPlanning: MealPlanningAgent;
  };

  constructor() {
    this.agents = {
      budget: new BudgetAgent(),
      nutrition: new NutritionAgent(),
      dietary: new DietaryAgent(),
      mealPlanning: new MealPlanningAgent(),
    };
  }

  analyze(context: AgentContext): AgentResponse[] {
    const responses: AgentResponse[] = [];

    const dietaryResponse = this.agents.dietary.analyze(context);
    if (dietaryResponse) responses.push(dietaryResponse);

    const nutritionResponse = this.agents.nutrition.analyze(context);
    if (nutritionResponse) responses.push(nutritionResponse);

    const budgetResponse = this.agents.budget.analyze(context);
    if (budgetResponse) responses.push(budgetResponse);

    const mealPlanningResponse = this.agents.mealPlanning.analyze(context);
    if (mealPlanningResponse) responses.push(mealPlanningResponse);

    if (responses.length === 0) {
      responses.push(this.getGeneralResponse(context));
    } else if (responses.length > 1) {
      responses.unshift({
        agent: 'coordinator',
        message: `🎯 **Coordinator Agent:** I've consulted with ${responses.length} specialized agents to give you comprehensive guidance. Here's what they found:`,
      });
    }

    return responses;
  }

  analyzeWithSpecificAgent(context: AgentContext, agentType: AgentType): AgentResponse[] {
    const responses: AgentResponse[] = [];

    switch (agentType) {
      case 'coordinator':
        return this.analyze(context);
      case 'budget':
        const budgetResponse = this.agents.budget.analyze(context);
        responses.push(budgetResponse || this.getFallbackResponse(agentType, context));
        break;
      case 'nutrition':
        const nutritionResponse = this.agents.nutrition.analyze(context);
        responses.push(nutritionResponse || this.getFallbackResponse(agentType, context));
        break;
      case 'dietary':
        const dietaryResponse = this.agents.dietary.analyze(context);
        responses.push(dietaryResponse || this.getFallbackResponse(agentType, context));
        break;
      case 'meal-planning':
        const mealPlanningResponse = this.agents.mealPlanning.analyze(context);
        responses.push(mealPlanningResponse || this.getFallbackResponse(agentType, context));
        break;
    }

    return responses;
  }

  private getFallbackResponse(agentType: AgentType, context: AgentContext): AgentResponse {
    const products = MOCK_PRODUCTS.filter(p => p.inStock).slice(0, 6);

    const messages: Record<AgentType, string> = {
      'coordinator': `🎯 I'm coordinating with specialized agents. Try asking about budget, nutrition, dietary restrictions, or meal planning!`,
      'budget': `💰 **Budget Agent:** I can help you find cost-effective options! Try asking about:\n• Budget-friendly products\n• Bulk pricing deals\n• Cost per serving analysis\n• Money-saving tips`,
      'nutrition': `🥗 **Nutrition Agent:** I specialize in nutritional guidance! Ask me about:\n• High-protein options\n• Low-fat products\n• Calorie-conscious choices\n• Balanced nutrition`,
      'dietary': `🛡️ **Dietary Agent:** I manage dietary restrictions! I can help with:\n• Allergen-free products\n• Gluten-free options\n• Vegan/vegetarian items\n• Specific dietary needs`,
      'meal-planning': `👨‍🍳 **Meal Planning Agent:** Let me help you plan meals! Ask about:\n• Breakfast/lunch/dinner ideas\n• Weekly meal plans\n• Recipe ingredients\n• Menu suggestions`,
    };

    return {
      agent: agentType,
      message: messages[agentType],
      data: { products },
    };
  }

  private getGeneralResponse(context: AgentContext): AgentResponse {
    const randomProducts = MOCK_PRODUCTS
      .filter(p => p.inStock)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return {
      agent: 'coordinator',
      message: `🎯 **Coordinator Agent:** I'm here to help! I can connect you with specialized agents:\n\n💰 **Budget Agent** - Cost optimization & bulk deals\n🥗 **Nutrition Agent** - Balanced meal nutrition\n🛡️ **Dietary Agent** - Allergen & restriction management\n👨‍🍳 **Meal Planning Agent** - Menu creation & recipes\n\nTry asking about budget options, dietary restrictions, nutrition goals, or meal planning!`,
      data: {
        products: randomProducts,
      },
    };
  }
}

export const coordinatorAgent = new CoordinatorAgent();
