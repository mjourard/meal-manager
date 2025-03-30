import { RecipeOrderRecipient } from "../models/recipe-order-recipient";
import { useAuthClient } from "./client";

export const useRecipeOrderRecipientsDataService = () => {
    const http = useAuthClient();
    return {
        async get(id: number): Promise<RecipeOrderRecipient> {
            try {
                const response = await http.get(`/recipe-order-recipients/${id}`);
                return response.data;
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to fetch recipe order recipient with id ${id}: ${error.message}`, { cause: error });
                } else {
                    throw new Error(`Failed to fetch recipe order recipient with id ${id}: ${JSON.stringify(error)}`);
                }
            }
        },
        async create(data: RecipeOrderRecipient): Promise<RecipeOrderRecipient> {
            try {
                const response = await http.post('/recipe-order-recipients', data);
                return response.data;
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to create recipe order recipient: ${error.message}`, { cause: error });
                } else {
                    throw new Error(`Failed to create recipe order recipient: ${JSON.stringify(error)}`);
                }
            }
        },
        async update(id: number, data: RecipeOrderRecipient): Promise<RecipeOrderRecipient> {
            try {
                const response = await http.put(`/recipe-order-recipients/${id}`, data);
                return response.data;
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to update RecipeOrderRecipient with id ${id}: ${error.message}`, { cause: error });
                } else {
                    throw new Error(`Failed to update RecipeOrderRecipient with id ${id}: ${JSON.stringify(error)}`);
                }
            }
        }
    }
} 