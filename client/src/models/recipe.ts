import { CreateType, UpdateType, DisplayType } from './utility-types';
import { SysUser } from './sys-user';
import { RecipeIngredient } from './recipe-ingredient';
import { RecipeEquipment } from './recipe-equipment';

export interface Recipe {
    id: number;
    name: string;
    description?: string;
    recipeURL?: string;
    disabled: boolean;
    
    // Additional fields from backend
    owner?: SysUser;
    instructions?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    portionSize?: string;
    portionCount?: number;
    vegetarian?: boolean;
    vegan?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    isPrivate?: boolean;
    linkDead?: boolean;
    ingredients?: RecipeIngredient[];
    equipment?: RecipeEquipment[];
}

// Type ensuring all required fields are present when creating
export interface CreateRecipeRequest {
    name: string;
    description?: string;
    recipeURL?: string;
    disabled?: boolean;
    instructions?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    portionSize?: string;
    portionCount?: number;
    vegetarian?: boolean;
    vegan?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    isPrivate?: boolean;
}

export type CreateRecipe = CreateType<Recipe>;
export type UpdateRecipe = UpdateType<Recipe>;
export type DisplayRecipe = DisplayType<Recipe>;