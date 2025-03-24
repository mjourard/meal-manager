import { Recipe } from './recipe';
import { SysUser } from './sys-user';
import { DisplayType } from './utility-types';

/**
 * Interface that matches the RecipeOrderDetailsDTO returned by the API
 */
export interface RecipeOrderDetails {
  id: number;
  selectedRecipes: Recipe[];
  selectedUsers: SysUser[];
  message?: string;
}

export interface CreateRecipeOrderDetails { 
    selectedRecipes: number[];
    selectedUserIds: number[];
    message: string;
}

export interface CreateRecipeOrderResponse  {
    id: number;
    message: string;
}

export type DisplayRecipeOrderDetails = DisplayType<RecipeOrderDetails>; 