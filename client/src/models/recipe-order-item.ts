import { CreateType, UpdateType, DisplayType } from './utility-types';
import { Recipe } from './recipe';

export interface RecipeOrderItem {
    id: number;
    recipeId: number;
    recipeOrderId: number;
    recipe?: Recipe;
}

export type CreateRecipeOrderItem = CreateType<RecipeOrderItem>;
export type UpdateRecipeOrderItem = UpdateType<RecipeOrderItem>;
export type DisplayRecipeOrderItem = DisplayType<RecipeOrderItem>;