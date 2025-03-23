export interface RecipeOrderItem {
    id: number;
    recipeId: number;
    recipeOrderId: number;
    recipe?: Recipe;
}

// Add import at the top of the file
import { Recipe } from './recipe'; 