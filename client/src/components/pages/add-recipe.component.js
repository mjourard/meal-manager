import { Component } from "react";
import RecipesDataService from "../../services/recipes.service";
import RecipeForm from "../recipe-form.component";

export default class AddRecipe extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRecipeURL = this.onChangeRecipeURL.bind(this);
        this.saveRecipe = this.saveRecipe.bind(this);
        this.newRecipe = this.newRecipe.bind(this);

        this.state = {
            id: null,
            name: "",
            description: "",
            recipeURL: "",
            submitted: false
        };
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
            description: this.state.description
        };

        RecipesDataService.create(data)
            .then(response => {
                this.setState({
                    id: response.data.id,
                    name: response.data.name,
                    description: response.data.description,

                    submitted: true
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    newRecipe() {
        this.setState({
            id: null,
            name: "",
            description: "",

            submitted: false
        });
    }

    render() {
        return (
            <div className="submit-form">
                <h4>Add New Recipe</h4>
                {this.state.submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <button className="btn btn-success" onClick={this.newRecipe}>
                            Add
                        </button>
                    </div>
                ) : (
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
                )}
            </div>
        );
    }
}
