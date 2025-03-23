import './App.css'

import {
    Link,Routes,Route,
    BrowserRouter as Router, useParams
} from "react-router-dom";

import AddRecipe from "./components/pages/add-recipe.component";
import EditRecipe from "./components/pages/edit-recipe.component";
import DisplayRecipes from "./components/pages/display-recipes.component";
import RecipeSelector from "./components/pages/recipe-selector.component";
import DisplayOrders from "./components/pages/display-orders.component";
import EditOrder from "./components/pages/edit-order.component";
import DisplayUsers from "./components/pages/display-users.component";
import EditUser from "./components/pages/edit-user.component";

function App() {
  return (
      <Router>
        <nav className="navbar fixed-top navbar-expand navbar-dark bg-dark">
          <a href={"/recipes"} className="navbar-brand">
            Meal Manager
          </a>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to="/recipes" className="nav-link">
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
        <div className="container mt-3" id="main-content">
          <Routes> 
            <Route path="/" element={<DisplayRecipes />} />
            <Route path="/recipes" element={<DisplayRecipes />} />
            <Route path="/add" element={<AddRecipe />} />
            <Route path="/recipes/:id" element={<EditRecipe />} />
            <Route path="/choose-recipes" element={<RecipeSelector />} />
            <Route path="/orders" element={<DisplayOrders />} />
            <Route path="/orders/:id" element={<EditOrder />} />
            <Route path="/users" element={<DisplayUsers />} />
            <Route path="/myusers/:id" element={<EditUser />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App
