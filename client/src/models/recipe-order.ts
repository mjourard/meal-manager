import { CreateType, UpdateType, DisplayType } from './utility-types';

export interface RecipeOrder {
    id: number;
    createdAt: Date;
    fulfilled: boolean;
}

export type CreateRecipeOrder = CreateType<RecipeOrder>;
export type UpdateRecipeOrder = UpdateType<RecipeOrder>;
export type DisplayRecipeOrder = DisplayType<RecipeOrder>;