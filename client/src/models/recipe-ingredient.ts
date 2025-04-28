/**
 * Model representing a recipe ingredient relationship
 * Maps to the RecipeIngredient entity in the backend
 */
export interface RecipeIngredient {
    id: number;
    amount?: string;
    unit?: string;
    name: string;
    optional?: boolean;
    notes?: string;
} 