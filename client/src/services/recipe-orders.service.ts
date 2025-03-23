import { RecipeOrder, CreateRecipeOrder, UpdateRecipeOrder, DisplayRecipeOrder } from "../models/recipe-order";
import { RecipeOrderItem, DisplayRecipeOrderItem, CreateRecipeOrderItem } from "../models/recipe-order-item";
import { RecipeOrderRecipient, DisplayRecipeOrderRecipient, CreateRecipeOrderRecipient } from "../models/recipe-order-recipient";
import http from "./client";

class RecipeOrdersDataService {
    async getAll(): Promise<DisplayRecipeOrder[]> {
        try {
            const response = await http.get("/orders");
            // Check for 204 No Content
            if (response.status === 204) {
                return [];
            }
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrders: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrders: ${JSON.stringify(error)}`);
            }
        }
    }

    async get(id: number): Promise<DisplayRecipeOrder> {
        try {
            const response = await http.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrder with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrder with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async create(data: CreateRecipeOrder): Promise<DisplayRecipeOrder> {
        try {
            const response = await http.post("/orders", data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create RecipeOrder: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to create RecipeOrder: ${JSON.stringify(error)}`);
            }
        }
    }
}

export default new RecipeOrdersDataService(); 