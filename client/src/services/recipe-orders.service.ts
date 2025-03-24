import { DisplayRecipeOrder } from "../models/recipe-order";
import { DisplayRecipeOrderDetails, CreateRecipeOrderDetails, CreateRecipeOrderResponse } from "../models/recipe-order-details";
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

    async get(id: number): Promise<DisplayRecipeOrderDetails> {
        try {
            const response = await http.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrder details with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrder details with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async create(data: CreateRecipeOrderDetails): Promise<CreateRecipeOrderResponse> {
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