import { useCallback } from 'react';
import { DisplayRecipeOrder } from "../models/recipe-order";
import { DisplayRecipeOrderDetails, CreateRecipeOrderDetails, CreateRecipeOrderResponse } from "../models/recipe-order-details";
import { useAuthClient } from "./client";

export const useRecipeOrdersService = () => {
  const authClient = useAuthClient();

  const getAll = useCallback(async (): Promise<DisplayRecipeOrder[]> => {
    try {
      const response = await authClient.get('/orders');
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
  }, [authClient]);

  const get = useCallback(async (id: number): Promise<DisplayRecipeOrderDetails> => {
    try {
      const response = await authClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch RecipeOrder details with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch RecipeOrder details with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const create = useCallback(async (data: CreateRecipeOrderDetails): Promise<CreateRecipeOrderResponse> => {
    try {
      const response = await authClient.post('/orders', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create RecipeOrder: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to create RecipeOrder: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  return {
    getAll,
    get,
    create
  };
}; 