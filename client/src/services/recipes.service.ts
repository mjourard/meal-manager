import { Recipe } from "../models/recipe";
import http from "./client";
import Papa from 'papaparse';

class RecipesDataService {
    async getAll(): Promise<Recipe[]> {
        try {
            const response = await http.get("/recipes");
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch Recipes: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch Recipes: ${JSON.stringify(error)}`);
            }
        }
    }

    async get(id: number): Promise<Recipe> {
        try {
            const response = await http.get(`/recipes/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch Recipe with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch Recipe with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async create(data: Recipe): Promise<Recipe> {
        try {
            const response = await http.post("/recipes", data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create Recipe: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to create Recipe: ${JSON.stringify(error)}`);
            }
        }
    }

    async multiCreate(data: string): Promise<Recipe[]> {
        try {
            const results: any = await new Promise((resolve, reject) => {
                Papa.parse(data, {
                    complete: resolve,
                    error: reject
                });
            });

            const recipes: Recipe[] = results.data.map((rawRecipe: any) => ({
                name: rawRecipe[0],
                description: rawRecipe.length >= 2 ? rawRecipe[1] : null,
                recipeURL: rawRecipe.length >= 3 ? rawRecipe[2] : null,
                disabled: rawRecipe.length >= 4 ? rawRecipe[3] : false
            }));

            const response = await http.post("/recipes/multiadd", recipes);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create multiple Recipes: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to create multiple Recipes: ${JSON.stringify(error)}`);
            }
        }
    }

    async disable(id: number): Promise<void> {
        try {
            await http.put(`/recipes/${id}/disable`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to disable Recipe with id ${id}`, { cause: error });
            } else {
                throw new Error(`Failed to disable Recipe with id ${id} ${JSON.stringify(error)}`);
            }
        }
    }

    async deleteAll(): Promise<void> {
        try {
            await http.delete("/recipes");
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete all Recipes`, { cause: error });
            } else {
                throw new Error(`Failed to delete all Recipes: ${JSON.stringify(error)}`);
            }
        }
    }
}

export default new RecipesDataService();