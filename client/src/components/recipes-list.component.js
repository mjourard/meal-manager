import { Component } from "react";
import RecipeReadonly from "./recipe-readonly.component";
import {Search, XCircle} from 'react-bootstrap-icons';

export default class RecipesList extends Component {
    constructor(props) {
        super(props);
        this.setActiveRecipe = this.setActiveRecipe.bind(this);
        this.removeRecipe = this.removeRecipe.bind(this);
        this.state = {
            currentRecipe: null,
            currentIndex: -1
        };
    }

    setActiveRecipe(recipe, index) {
        this.setState({
            currentRecipe: recipe,
            currentIndex: index
        });
    }

    removeRecipe(recipe, index) {
        this.props.removeRecipe(recipe, index);
    }

    render() {
        const { currentRecipe, currentIndex } = this.state;
        return (
            <div className="list row">
                <div className="col-md-6">
                    <ul className="list-group">
                        {this.props.recipes &&
                        this.props.recipes.map((recipe, index) => (
                            <li
                                className={
                                    "list-group-item " +
                                    (index === currentIndex ? "active" : "")
                                }

                                key={index}
                            >
                                <div className="d-flex justify-content-start align-items-stretch">
                                    {recipe.name}
                                    <div className="d-flex justify-content-end align-items-center flex-fill border-dark border-1">
                                        <Search onClick={() => this.setActiveRecipe(recipe, index)} className="ms-2 me-2" role="button"/>
                                        <XCircle onClick={() => this.removeRecipe(recipe, index)} className="text-danger ms-2 me-2" role="button"/>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-6">
                    {currentRecipe ? (
                        <RecipeReadonly
                            name={currentRecipe.name}
                            description={currentRecipe.description}
                            id={currentRecipe.id}
                            recipeURL={currentRecipe.recipeURL}
                        />
                    ) : (
                        <div>
                            <br />
                            <p>Please select a Recipe...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
