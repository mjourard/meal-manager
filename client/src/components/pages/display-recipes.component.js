import { Component } from "react";
import RecipesDataService from "../../services/recipes.service";
import ToastsService from "../../services/toasts.service";
import RecipesList from "../recipes-list.component";

export default class DisplayRecipes extends Component {
    constructor(props) {
        super(props);
        this.retrieveRecipes = this.retrieveRecipes.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.removeAllRecipes = this.removeAllRecipes.bind(this);
        this.disableRecipe = this.disableRecipe.bind(this);

        this.state = {
            recipes: [],
        };
    }

    componentDidMount() {
        this.retrieveRecipes();
    }

    retrieveRecipes() {
        RecipesDataService.getAll()
            .then(response => {
                this.setState({
                    recipes: response.data
                });
            })
            .catch(e => {
                ToastsService.webError("Failed to fetch Recipes", e)
            });
    }

    refreshList() {
        this.retrieveRecipes();
    }
    disableRecipe(recipe, index) {
        RecipesDataService.disable(recipe.id)
            .then(response => {
                this.refreshList();
            })
            .catch(e => {
                ToastsService.webError("Failed to disable Recipe", e);
            })
    }

    removeAllRecipes() {
        RecipesDataService.deleteAll()
            .then(response => {
                this.refreshList();
            })
            .catch(e => {
                ToastsService.webError("Failed to delete all Recipes", e);
            });
    }

    render() {

        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Recipes List</h4>
                    <RecipesList
                        recipes={this.state.recipes}
                        removeRecipe={this.disableRecipe}
                    />
                    <button
                        className="m-3 btn btn-sm btn-danger"
                        onClick={this.removeAllRecipes}
                    >
                        Remove All
                    </button>
                </div>
            </div>
        );
    }
}
