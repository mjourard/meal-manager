import { RecipeOrder } from "../models/recipe-order";
import { RecipeOrderItem } from "../models/recipe-order-item";
import { RecipeOrderRecipient } from "../models/recipe-order-recipient";
import http from "./client";

class RecipeOrdersDataService {
    async getAll(): Promise<RecipeOrder[]> {
        try {
            const response = await http.get("/recipe-orders");
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrders: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrders: ${JSON.stringify(error)}`);
            }
        }
    }

    async get(id: number): Promise<RecipeOrder> {
        try {
            const response = await http.get(`/recipe-orders/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch RecipeOrder with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch RecipeOrder with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async create(data: RecipeOrder): Promise<RecipeOrder> {
        try {
            const response = await http.post("/recipe-orders", data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create RecipeOrder: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to create RecipeOrder: ${JSON.stringify(error)}`);
            }
        }
    }

    async update(id: number, data: RecipeOrder): Promise<RecipeOrder> {
        try {
            const response = await http.put(`/recipe-orders/${id}`, data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update RecipeOrder with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to update RecipeOrder with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await http.delete(`/recipe-orders/${id}`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete RecipeOrder with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to delete RecipeOrder with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async fulfill(id: number): Promise<RecipeOrder> {
        try {
            const response = await http.put(`/recipe-orders/${id}/fulfill`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fulfill RecipeOrder with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fulfill RecipeOrder with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async getItems(orderId: number): Promise<RecipeOrderItem[]> {
        try {
            const response = await http.get(`/recipe-orders/${orderId}/items`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch items for RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch items for RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }

    async addItem(orderId: number, item: RecipeOrderItem): Promise<RecipeOrderItem> {
        try {
            const response = await http.post(`/recipe-orders/${orderId}/items`, item);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add item to RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to add item to RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }

    async removeItem(orderId: number, itemId: number): Promise<void> {
        try {
            await http.delete(`/recipe-orders/${orderId}/items/${itemId}`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to remove item ${itemId} from RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to remove item ${itemId} from RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }

    async getRecipients(orderId: number): Promise<RecipeOrderRecipient[]> {
        try {
            const response = await http.get(`/recipe-orders/${orderId}/recipients`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch recipients for RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch recipients for RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }

    async addRecipient(orderId: number, recipient: RecipeOrderRecipient): Promise<RecipeOrderRecipient> {
        try {
            const response = await http.post(`/recipe-orders/${orderId}/recipients`, recipient);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add recipient to RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to add recipient to RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }

    async removeRecipient(orderId: number, recipientId: number): Promise<void> {
        try {
            await http.delete(`/recipe-orders/${orderId}/recipients/${recipientId}`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to remove recipient ${recipientId} from RecipeOrder with id ${orderId}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to remove recipient ${recipientId} from RecipeOrder with id ${orderId}: ${JSON.stringify(error)}`);
            }
        }
    }
}

export default new RecipeOrdersDataService(); 