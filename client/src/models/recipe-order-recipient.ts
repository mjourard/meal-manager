import { CreateType, UpdateType, DisplayType, ListItemType } from './utility-types';
import { SysUser } from './sys-user';

export interface RecipeOrderRecipient {
    id: number;
    userId: number;
    recipeOrderId: number;
    user?: SysUser;
}

export type CreateRecipeOrderRecipient = CreateType<RecipeOrderRecipient>;
export type UpdateRecipeOrderRecipient = UpdateType<RecipeOrderRecipient>;
export type DisplayRecipeOrderRecipient = DisplayType<RecipeOrderRecipient>;
export type RecipeOrderRecipientListItem = ListItemType<RecipeOrderRecipient, 'userId'>; 