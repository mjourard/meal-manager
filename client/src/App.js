import './App.css';
import {Link,Switch,Route} from "react-router-dom";
import AddRecipe from "./components/pages/add-recipe.component";
import Recipe from "./components/recipe.component";
import DisplayRecipes from "./components/pages/display-recipes.component";
import RecipeSelector from "./components/pages/recipe-selector.component";

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
          </div>
        </nav>

        <div className="container mt-3">
          <Switch>
            <Route exact path={["/", "/recipes"]} component={DisplayRecipes} />
            <Route exact path="/add" component={AddRecipe} />
            <Route path="/recipes/:id" component={Recipe} />
            <Route path="/choose-recipes" component={RecipeSelector} />
          </Switch>
        </div>
      </div>
  );
}

export default App;
