import { Component } from "react";
import RecipeReadonly from "./recipe-readonly.component";

export default class RecipesList extends Component {
    constructor(props) {
        super(props);
        this.setActiveRecipe = this.setActiveRecipe.bind(this);
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
                                onClick={() => this.setActiveRecipe(recipe, index)}
                                key={index}
                            >
                                {recipe.name}
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
