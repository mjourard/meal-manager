import './App.css';
import {Link,Switch,Route} from "react-router-dom";
import AddRecipe from "./components/pages/add-recipe.component";
import EditRecipe from "./components/pages/edit-recipe.component";
import DisplayRecipes from "./components/pages/display-recipes.component";
import RecipeSelector from "./components/pages/recipe-selector.component";
import DisplayOrders from "./components/pages/display-orders.components";
import EditOrder from "./components/pages/edit-order.components";
import DisplayUsers from "./components/pages/display-users.component";
import EditUser from "./components/pages/edit-user.component";
import AddUser from "./components/pages/add-user.component";
import ToastContainer from "./components/utilities/toast-container.component";

function App() {
  return (
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <a href={"/recipes"} className="navbar-brand">
            Meal Manager
          </a>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/recipes"} className="nav-link">
                Recipes
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/add"} className="nav-link">
                Add
              </Link>
            </li>
            <li className={"nav-item"}>
              <Link to={"/choose-recipes"} className={"nav-link"}>
                Choose Recipes
              </Link>
            </li>
            <li className={"nav-item"}>
              <Link to={"/orders"} className={"nav-link"}>
                Orders
              </Link>
            </li>
            <li className={"nav-item"}>
              <Link to={"/users"} className={"nav-link"}>
                Users
              </Link>
            </li>
          </div>
        </nav>
        <ToastContainer />
        <div className="container mt-3">
          <Switch>
            <Route exact path={["/", "/recipes"]} component={DisplayRecipes} />
            <Route exact path="/add" component={AddRecipe} />
            <Route path="/recipes/:id" component={EditRecipe} />
            <Route path="/choose-recipes" component={RecipeSelector} />
            <Route path="/orders" component={DisplayOrders} />
            <Route path="/myorders/:id" component={EditOrder} />
            <Route path="/users" component={DisplayUsers} />
            <Route path="/myusers/:id" component={EditUser} />
            <Route path="/adduser" component={AddUser} />
          </Switch>
        </div>
      </div>
  );
}

export default App;
