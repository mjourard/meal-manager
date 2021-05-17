import {Link} from "react-router-dom";
import RecipeReadonly from "./recipe-readonly.component";
import Table from "./table.component";

const OrderDetails = (props) => {
    return (
        <div>
            <div>
                <label>
                    <strong>Id:</strong>
                </label>{" "}
                {props.id}
            </div>
            <div>
                <label>
                    <strong>Message:</strong>
                </label>{" "}
                {props.message}
            </div>
            <h5>Selected Recipes</h5>
            {props.selectedRecipes ?
                props.selectedRecipes.map((recipe, index) => (
                   <RecipeReadonly
                    id={recipe.id}
                    name={recipe.name}
                    description={recipe.description}
                    recipeURL={recipe.recipeURL}
                    key={index}
                   />
                ))
                : <div>
                    <p>No recipes found for this order!</p>
                </div>
            }
            <h5>Users Who Received The Order</h5>
            {props.selectedUsers ?
                <Table
                    headers={Object.keys(props.selectedUsers[0])}
                    body={props.selectedUsers}
                /> :
                <div><p>No users selected to send order to</p></div>
            }
        </div>
    );
};

export default OrderDetails;