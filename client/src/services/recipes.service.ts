import { useCallback } from 'react';
import { UpdateRecipe, DisplayRecipe, CreateRecipeRequest } from "../models/recipe";
import { useAuthClient } from "./client";

interface PaginatedRecipesResponse {
  recipes: DisplayRecipe[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Hook for authenticated methods
export const useRecipesService = () => {
  const authClient = useAuthClient();
  
  /**
   * Get all recipes - handles both paginated and non-paginated responses
   */
  const getAll = useCallback(async (params?: { 
    title?: string, 
    page?: number, 
    size?: number, 
    sort?: string 
  }): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes', { 
        params
      });
      
      // Handle both array and paginated object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.recipes)) {
        return response.data.recipes;
      }
      
      return [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch Recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Get paginated recipes with metadata
   */
  const getPaginated = useCallback(async (params?: { 
    title?: string, 
    page?: number, 
    size?: number, 
    sort?: string 
  }): Promise<PaginatedRecipesResponse> => {
    try {
      const response = await authClient.get('/recipes', { 
        params
      });
      
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return {
          recipes: response.data.recipes || [],
          currentPage: response.data.currentPage || 0,
          totalItems: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 0
        };
      }
      
      // If response is an array, create a default paginated response
      if (Array.isArray(response.data)) {
        return {
          recipes: response.data,
          currentPage: 0,
          totalItems: response.data.length,
          totalPages: 1
        };
      }
      
      return {
        recipes: [],
        currentPage: 0,
        totalItems: 0,
        totalPages: 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch paginated recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch paginated recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Get my recipes (owned by current user)
   */
  const getMyRecipes = useCallback(async (): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes/my');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch my recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch my recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Get public recipes
   */
  const getPublicRecipes = useCallback(async (): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes/public');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch public recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch public recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Get a single recipe by ID
   */
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

  /**
   * Create a new recipe
   */
  const create = useCallback(async (data: CreateRecipeRequest): Promise<DisplayRecipe> => {
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

  /**
   * Update an existing recipe
   */
  const update = useCallback(async (id: number, data: UpdateRecipe): Promise<DisplayRecipe> => {
    try {
      // Make sure we're not trying to update read-only fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, owner, ingredients, equipment, ...updateData } = data;
      
      const response = await authClient.put(`/recipes/${id}`, updateData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update Recipe with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to update Recipe with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Disable a recipe (soft delete)
   */
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

  /**
   * Permanently delete a recipe
   */
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

  /**
   * Delete all recipes
   */
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

  /**
   * Find recipes by dietary preferences
   */
  const findByDietaryPreferences = useCallback(async (preferences: {
    isVegetarian?: boolean,
    isVegan?: boolean,
    isDairyFree?: boolean,
    isNutFree?: boolean
  }): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes/dietary', { params: preferences });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch recipes by dietary preferences: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch recipes by dietary preferences: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  /**
   * Find quick recipes (recipes that can be prepared in less than maxTotalTime minutes)
   */
  const findQuickRecipes = useCallback(async (maxTotalTime: number): Promise<DisplayRecipe[]> => {
    try {
      const response = await authClient.get('/recipes/quick', { params: { maxTotalTime } });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch quick recipes: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch quick recipes: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  return {
    getAll,
    getPaginated,
    getMyRecipes,
    getPublicRecipes,
    get,
    create,
    update,
    disable,
    delete: deleteRecipe,
    deleteAll,
    findByDietaryPreferences,
    findQuickRecipes
  };
};