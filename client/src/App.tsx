import './App.css'
import { 
    SignIn, 
    SignUp, 
    UserProfile, 
    UserButton, 
    SignedIn, 
    SignedOut,
    RedirectToSignIn 
  } from '@clerk/clerk-react';
import {
    Link,Routes,Route,
    BrowserRouter as Router
} from "react-router-dom";

import Home from "./components/pages/home.component";
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
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="navbar-nav mr-auto">
              <a href="/sign-in" className="btn btn-outline-light">Sign In</a>
              <a href="/sign-up" className="btn btn-outline-light">Sign Up</a>
            </div>
          </SignedOut>
        </nav>
        <div className="container mt-3" id="main-content">
          <Routes> 
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            
            {/* Protected routes */} 
            <Route path="/recipes" element={<RequireAuth><DisplayRecipes /></RequireAuth>} />
            <Route path="/add" element={<RequireAuth><AddRecipe /></RequireAuth>} />
            <Route path="/recipes/:id" element={<RequireAuth><EditRecipe /></RequireAuth>} />
            <Route path="/choose-recipes" element={<RequireAuth><RecipeSelector /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><DisplayOrders /></RequireAuth>} />
            <Route path="/orders/:id" element={<RequireAuth><EditOrder /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><DisplayUsers /></RequireAuth>} />
            <Route path="/myusers/:id" element={<RequireAuth><EditUser /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
  );
}

// RequireAuth component to protect routes
function RequireAuth({ children }) {
    return (
      <>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    );
  }

export default App
