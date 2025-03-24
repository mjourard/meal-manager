import { RecipeOrderItem } from "../models/recipe-order-item";
import http from "./client";

class RecipeOrderItemsDataService {
    async get(id: number): Promise<RecipeOrderItem> {
        try {
            const response = await http.get(`/recipe-order-items/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrderItem with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrderItem with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async update(id: number, data: RecipeOrderItem): Promise<RecipeOrderItem> {
        try {
            const response = await http.put(`/recipe-order-items/${id}`, data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update RecipeOrderItem with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to update RecipeOrderItem with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }
}

export default new RecipeOrderItemsDataService(); 