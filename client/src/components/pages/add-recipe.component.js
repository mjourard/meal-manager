import {Component} from "react";
import RecipesDataService from "../../services/recipes.service";
import RecipeForm from "../recipe-form.component";
import RecipeReadonly from "../recipe-readonly.component";

export default class AddRecipe extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRecipeURL = this.onChangeRecipeURL.bind(this);
        this.saveRecipe = this.saveRecipe.bind(this);
        this.newRecipe = this.newRecipe.bind(this);

        let emptyRecipe = this.initEmptyRecipe();
        this.state = {
            ...emptyRecipe,
            submitted: false,
            lastCreatedRecipe: this.initEmptyRecipe()
        };
    }

    initEmptyRecipe() {
        return {
            name: "",
            description: "",
            recipeURL: ""
        }
    }

    onChangeName(name) {
        this.setState({
            name: name
        });
    }

    onChangeDescription(desc) {
        this.setState({
            description: desc
        });
    }

    onChangeRecipeURL(url) {
        this.setState({
            recipeURL: url
        })
    }

    saveRecipe() {
        let data = {
            name: this.state.name,
            description: this.state.description,
            recipeURL: this.state.recipeURL
        };

        RecipesDataService.create(data)
            .then(response => {
                this.setState({
                    lastCreatedRecipe: response.data,
                    submitted: true
                });
                this.newRecipe();
            })
            .catch(e => {
                console.log(e);
            });
    }

    newRecipe() {
        this.setState({
            name: "",
            description: "",
            recipeURL: "",
        });
    }

    render() {
        const newRecipe = this.state.lastCreatedRecipe;

        return (
            <div className="submit-form">
                <h4>Add New Recipe</h4>
                {this.state.submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <RecipeReadonly
                            id={newRecipe.id}
                            name={newRecipe.name}
                            description={newRecipe.description}
                            recipeURL={newRecipe.recipeURL}
                        />
                    </div>
                ) : ""}
                <div>
                    <RecipeForm
                        name={this.state.name}
                        description={this.state.description}
                        recipeURL={this.state.recipeURL}
                        onChangeName={this.onChangeName}
                        onChangeDescription={this.onChangeDescription}
                        onChangeRecipeURL={this.onChangeRecipeURL}
                    />

                    <button onClick={this.saveRecipe} className="btn btn-success">
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}
