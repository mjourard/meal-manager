import http from "../http-common";
import Papa from 'papaparse';

class RecipesDataService {
    getAll() {
        return http.get("/recipes");
    }

    get(id) {
        return http.get(`/recipes/${id}`);
    }

    create(data) {
        return http.post("/recipes", data);
    }

    multiCreate(data) {
        console.log(data);
        return new Promise((resolve, reject) => {
            Papa.parse(data, {
                complete: resolve,
                error: reject
            })
        }).then(results => {
            const recipes = [];
            results.data.forEach(rawRecipe => {
                let temp = {
                    name: rawRecipe[0],
                    description: null,
                    recipeurl: null,
                    disabled: false
                };
                temp.description = rawRecipe.length >= 2 ? rawRecipe[1] : null;
                temp.recipeurl = rawRecipe.length >= 3 ? rawRecipe[2] : null;
                temp.disabled = rawRecipe.length >= 4 ? rawRecipe[3] : false;
                recipes.push(temp);
            })
            return http.post("/recipes/multiadd", recipes);
        }).catch(err => {
            //TODO: toast
            console.warn("Something went wrong when running papa parse: ", err)
        })

    }

    update(id, data) {
        return http.put(`/recipes/${id}`, data);
    }

    disable(id) {
        return http.put(`/recipes/disable/${id}`);
    }

    delete(id) {
        return http.delete(`/recipes/${id}`);
    }

    deleteAll() {
        return http.delete(`/recipes`);
    }
}

export default new RecipesDataService();