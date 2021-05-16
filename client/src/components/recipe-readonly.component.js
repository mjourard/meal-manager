import {Link} from "react-router-dom";

const RecipeReadonly = (props) => {
    return (
        <div>
            <h4>Recipe</h4>
            <div>
                <label>
                    <strong>Name:</strong>
                </label>{" "}
                {props.name}
            </div>
            <div>
                <label>
                    <strong>Description:</strong>
                </label>{" "}
                {props.description}
            </div>
            <div>
                <label>
                    <strong>Recipe URL:</strong>
                </label>{" "}
                <a href={props.recipeURL} target={"_blank"} rel="noreferrer">{props.recipeURL}</a>
            </div>

            <Link
                to={"/recipes/" + props.id}
                className="badge bg-warning"
            >
                Edit
            </Link>
        </div>
    )
}

export default RecipeReadonly;