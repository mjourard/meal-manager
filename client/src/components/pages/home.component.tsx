import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Home() {
  const { user } = useUser();
  
  return (
    <div className="container mt-5">
      <h1>Meal Manager</h1>
      
      <SignedIn>
        <div className="alert alert-success">
            {user && `Welcome back, ${user.firstName}!`}
        </div>
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Recipes</h5>
                <p className="card-text">Manage your collection of recipes.</p>
                <Link to="/recipes" className="btn btn-primary">Go to Recipes</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Orders</h5>
                <p className="card-text">Create and manage meal orders.</p>
                <Link to="/orders" className="btn btn-primary">Go to Orders</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Users</h5>
                <p className="card-text">Manage system users.</p>
                <Link to="/users" className="btn btn-primary">Go to Users</Link>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="jumbotron">
          <p className="lead">Organize and plan your meals with our simple meal management system.</p>
          <hr className="my-4" />
          <p>Please sign in to access the application.</p>
          <a href="/sign-in" className="btn btn-primary btn-lg">Sign In</a>
          <a href="/sign-up" className="btn btn-secondary btn-lg ms-2">Sign Up</a>
        </div>
      </SignedOut>
    </div>
  );
}

export default Home;