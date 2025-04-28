/**
 * Model representing a recipe equipment relationship
 * Maps to the RecipeEquipment entity in the backend
 */
export interface RecipeEquipment {
    id: number;
    name: string;
    quantity?: number;
    notes?: string;
    required: boolean;
} 