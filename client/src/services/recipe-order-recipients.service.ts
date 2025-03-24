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
                    throw new Error(`Failed to fetch RecipeOrderRecipient with id ${id}: ${error.message}`, { cause: error });
                } else {
                    throw new Error(`Failed to fetch RecipeOrderRecipient with id ${id}: ${JSON.stringify(error)}`);
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

export default new RecipeOrderRecipientsDataService(); 