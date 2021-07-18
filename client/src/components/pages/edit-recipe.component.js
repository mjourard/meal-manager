import React, {Component} from "react";
import RecipesDataService from "../../services/recipes.service";
import ToastsService from "../../services/toasts.service";
import RecipeForm from "../recipe-form.component";

export default class EditRecipe extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRecipeURL = this.onChangeRecipeURL.bind(this);
        this.onChangeDisabled = this.onChangeDisabled.bind(this);
        this.getRecipe = this.getRecipe.bind(this);
        this.updateRecipe = this.updateRecipe.bind(this);
        this.deleteRecipe = this.deleteRecipe.bind(this);

        this.state = {
            currentRecipe: {
                id: null,
                name: "",
                description: "",
                recipeURL: "",
                disabled: false
            }
        };
    }

    componentDidMount() {
        this.getRecipe(this.props.match.params.id);
    }

    onChangeName(name) {
        this.setState(prevState => ({
            currentRecipe: {
                ...prevState.currentRecipe,
                name: name
            }
        }));
    }

    onChangeDescription(description) {
        this.setState(prevState => ({
            currentRecipe: {
                ...prevState.currentRecipe,
                description: description
            }
        }));
    }

    onChangeRecipeURL(url) {
        this.setState(prevState => ({
            currentRecipe: {
                ...prevState.currentRecipe,
                recipeURL: url
            }
        }));
    }

    onChangeDisabled(disabled) {
        this.setState(prevState => ({
            currentRecipe: {
                ...prevState.currentRecipe,
                disabled: disabled
            }
        }))
    }

    getRecipe(id) {
        RecipesDataService.get(id)
            .then(response => {
                this.setState({
                    currentRecipe: response.data
                });
            })
            .catch(e => {
                ToastsService.webError("Failed to retrieve Recipe", e);
            });
    }

    updateRecipe() {
        RecipesDataService.update(
            this.state.currentRecipe.id,
            this.state.currentRecipe
        )
            .then(response => {
                ToastsService.success("Update Successful", "The recipe was updated successfully!");
            })
            .catch(e => {
                ToastsService.webError("Update failed", e);
            });
    }

    deleteRecipe() {
        RecipesDataService.delete(this.state.currentRecipe.id)
            .then(response => {
                this.props.history.push('/recipes')
            })
            .catch(e => {
                ToastsService.webError("Delete failed", e);
            });
    }

    render() {
        const currentRecipe = this.state.currentRecipe;
        return (
            <div>
                {currentRecipe ? (
                    <div className="edit-form">
                        <h4>Recipe</h4>
                        <RecipeForm
                            name={currentRecipe.name}
                            description={currentRecipe.description}
                            recipeURL={currentRecipe.recipeURL}
                            disabled={currentRecipe.disabled}
                            onChangeName={this.onChangeName}
                            onChangeDescription={this.onChangeDescription}
                            onChangeRecipeURL={this.onChangeRecipeURL}
                            onChangeDisabled={this.onChangeDisabled}
                        />

                        <button
                            className="badge bg-danger mr-2"
                            onClick={this.deleteRecipe}
                        >
                            Delete
                        </button>

                        <button
                            type="submit"
                            className="badge bg-success"
                            onClick={this.updateRecipe}
                        >
                            Update
                        </button>
                    </div>
                ) : (
                    <div>
                        <br/>
                        <p>Select a Recipe...</p>
                    </div>
                )}
            </div>
        );
    }
}
