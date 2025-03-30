import { useCallback } from 'react';
import { CreateRecipe, UpdateRecipe, DisplayRecipe } from "../models/recipe";
import { useAuthClient } from "./client";

// Hook for authenticated methods
export const useRecipesService = () => {
  const authClient = useAuthClient();
  
  const getAll = useCallback(async (): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch Recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const get = useCallback(async (id: number): Promise<DisplayRecipe> => {
    try {
      const response = await authClient.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Recipe with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch Recipe with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const create = useCallback(async (data: CreateRecipe): Promise<DisplayRecipe> => {
    try {
      const response = await authClient.post('/recipes', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create Recipe: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to create Recipe: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const update = useCallback(async (id: number, data: UpdateRecipe): Promise<DisplayRecipe> => {
    try {
      const response = await authClient.put(`/recipes/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update Recipe with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to update Recipe with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const disable = useCallback(async (id: number): Promise<DisplayRecipe> => {
    try {
      const response = await authClient.delete(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to disable Recipe with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to disable Recipe with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const deleteRecipe = useCallback(async (id: number): Promise<void> => {
    try {
      await authClient.delete(`/recipes/${id}/delete`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete Recipe with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to delete Recipe with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const deleteAll = useCallback(async (): Promise<void> => {
    try {
      await authClient.delete(`/recipes`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete all Recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to delete all Recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  return {
    getAll,
    get,
    create,
    update,
    disable,
    delete: deleteRecipe,
    deleteAll
  };
};