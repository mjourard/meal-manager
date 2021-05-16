import { Component } from "react";
import RecipesDataService from "../../services/recipes.service";
import RecipesList from "../recipes-list.component";

export default class DisplayRecipes extends Component {
    constructor(props) {
        super(props);
        this.retrieveRecipes = this.retrieveRecipes.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.removeAllRecipes = this.removeAllRecipes.bind(this);

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
                console.log(e);
            });
    }

    refreshList() {
        this.retrieveRecipes();
    }

    removeAllRecipes() {
        RecipesDataService.deleteAll()
            .then(response => {
                console.log(response.data);
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {

        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Recipes List</h4>
                    <RecipesList
                        recipes={this.state.recipes}
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
