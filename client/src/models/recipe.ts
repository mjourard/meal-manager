import { CreateType, UpdateType, DisplayType, ListItemType } from './utility-types';

export interface Recipe {
    id: number;
    name: string;
    description?: string;
    recipeURL?: string;
    disabled: boolean;
}

export type CreateRecipe = CreateType<Recipe>;
export type UpdateRecipe = UpdateType<Recipe>;
export type DisplayRecipe = DisplayType<Recipe>;
export type RecipeListItem = ListItemType<Recipe, 'name' | 'disabled'>;