import React, { Component } from "react";
import RecipesDataService from "../services/recipes.service";

export default class Recipe extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.getRecipe = this.getRecipe.bind(this);
        this.updateRecipe = this.updateRecipe.bind(this);
        this.deleteRecipe = this.deleteRecipe.bind(this);

        this.state = {
            currentRecipe: {
                id: null,
                name: "",
                description: ""
            },
            message: ""
        };
    }

    componentDidMount() {
        this.getRecipe(this.props.match.params.id);
    }

    onChangeName(e) {
        const name = e.target.value;

        this.setState(function(prevState) {
            return {
                currentRecipe: {
                    ...prevState.currentRecipe,
                    name: name
                }
            };
        });
    }

    onChangeDescription(e) {
        const description = e.target.value;

        this.setState(prevState => ({
            currentRecipe: {
                ...prevState.currentRecipe,
                description: description
            }
        }));
    }

    getRecipe(id) {
        RecipesDataService.get(id)
            .then(response => {
                this.setState({
                    currentRecipe: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    updateRecipe() {
        RecipesDataService.update(
            this.state.currentRecipe.id,
            this.state.currentRecipe
        )
            .then(response => {
                console.log(response.data);
                this.setState({
                    message: "The recipe was updated successfully!"
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    deleteRecipe() {
        RecipesDataService.delete(this.state.currentRecipe.id)
            .then(response => {
                console.log(response.data);
                this.props.history.push('/recipes')
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { currentRecipe } = this.state;

        return (
            <div>
                {currentRecipe ? (
                    <div className="edit-form">
                        <h4>Recipe</h4>
                        <form>
                            <div className="form-group">
                                <label htmlFor="title">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    value={currentRecipe.name}
                                    onChange={this.onChangeName}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="description"
                                    value={currentRecipe.description}
                                    onChange={this.onChangeDescription}
                                />
                            </div>
                        </form>

                        <button
                            className="badge badge-danger mr-2"
                            onClick={this.deleteRecipe}
                        >
                            Delete
                        </button>

                        <button
                            type="submit"
                            className="badge badge-success"
                            onClick={this.updateRecipe}
                        >
                            Update
                        </button>
                        <p>{this.state.message}</p>
                    </div>
                ) : (
                    <div>
                        <br />
                        <p>Select a Recipe...</p>
                    </div>
                )}
            </div>
        );
    }
}
