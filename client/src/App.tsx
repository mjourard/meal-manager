import './App.css'
import { 
    SignIn, 
    SignUp, 
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
import CreateOrder from "./components/pages/create-order.component";
import DisplayOrders from "./components/pages/display-orders.component";
import EditOrder from "./components/pages/edit-order.component";
import DisplayUsers from "./components/pages/display-users.component";
import EditUser from "./components/pages/edit-user.component";
import ContactUs from "./components/pages/contact-us.component";
import BuildInfoPage from "./components/pages/build-info.component";
import CrawlerJobDetails from "./components/pages/crawler-job-details.component";
import DisplayCrawlerJobs from "./components/pages/display-crawler-jobs.component";

function App() {
  return (
      <Router>
        <nav className="navbar fixed-top navbar-expand navbar-dark bg-dark">
          <div className="container-fluid">
            <li className="navbar-brand">
              <Link to={"/"}  className="nav-link">
                Meal Manager
              </Link>
            </li>
            <div className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/recipes" className="nav-link">
                  Recipes
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/recipes/new"} className="nav-link">
                  Add
                </Link>
              </li>
              <li className={"nav-item"}>
                <Link to={"/orders/new"} className={"nav-link"}>
                  Create Order
                </Link>
              </li>
              <li className={"nav-item"}>
                <Link to={"/orders"} className={"nav-link"}>
                  Orders
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="jobsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Jobs
                </a>
                <ul className="dropdown-menu" aria-labelledby="jobsDropdown">
                  <li>
                    <Link to="/crawler-jobs" className="dropdown-item">
                      Crawler Jobs
                    </Link>
                  </li>
                </ul>
              </li>
              <li className={"nav-item"}>
                <Link to={"/users"} className={"nav-link"}>
                  Users
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="aboutDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  About
                </a>
                <ul className="dropdown-menu" aria-labelledby="aboutDropdown">
                  <li>
                    <Link to="/contact-us" className="dropdown-item">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/build-info" className="dropdown-item">
                      Build Info
                    </Link>
                  </li>
                </ul>
              </li>
            </div>
            <div className="d-flex">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <div className="d-flex gap-2">
                  <a href={import.meta.env.VITE_CLERK_SIGN_IN_URL} className="btn btn-outline-light">Sign In</a>
                  <a href={import.meta.env.VITE_CLERK_SIGN_UP_URL} className="btn btn-outline-light">Sign Up</a>
                </div>
              </SignedOut>
            </div>
          </div>
        </nav>
        <div className="container mt-3" id="main-content">
          <Routes> 
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/build-info" element={<BuildInfoPage />} />
            
            {/* Protected routes */} 
            <Route path="/recipes" element={<RequireAuth><DisplayRecipes /></RequireAuth>} />
            <Route path="/recipes/new" element={<RequireAuth><AddRecipe /></RequireAuth>} />
            <Route path="/recipes/:id" element={<RequireAuth><EditRecipe /></RequireAuth>} />
            <Route path="/orders/new" element={<RequireAuth><CreateOrder /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><DisplayOrders /></RequireAuth>} />
            <Route path="/orders/:id" element={<RequireAuth><EditOrder /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><DisplayUsers /></RequireAuth>} />
            <Route path="/users/:id" element={<RequireAuth><EditUser /></RequireAuth>} />
            <Route path="/crawler-jobs" element={<RequireAuth><DisplayCrawlerJobs /></RequireAuth>} />
            <Route path="/crawler-jobs/:id" element={<RequireAuth><CrawlerJobDetails /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
  );
}

// RequireAuth component to protect routes and ensure user registration
function RequireAuth({ children }: { children: React.ReactNode }) {
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
