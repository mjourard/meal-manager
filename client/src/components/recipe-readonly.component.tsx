import {Link} from "react-router-dom";

export type RecipeReadonlyProps = {
    id: number;
    name: string;
    description?: string;
    recipeURL?: string;
    disabled: boolean;
}
const RecipeReadonly = (props: RecipeReadonlyProps) => {
    return (
        <div>
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
            <div>
                <label>
                    <strong>Disabled</strong>
                </label>
                <input type="checkbox" disabled checked={props.disabled} />
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