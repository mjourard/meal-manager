import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSysUsersService } from '../../services/sys-users.service';
import { SysUser } from '../../models/sys-user';
import { useUserRegistration } from '../../hooks/useUserRegistration';

/**
 * DisplayUsers component shows the list of system users and allows interaction with them.
 * 
 * Implementation notes:
 * - Uses a useRef to track if users have been loaded to prevent continuous API calls
 *   when no users exist (avoids infinite loading/flickering)
 * - Updates local state directly when toggling user properties to avoid unnecessary API calls
 * - Uses request tracking to prevent duplicate API calls
 * - Includes button to register current authenticated user with the system
 */
const DisplayUsers: React.FC = () => {
  const [users, setUsers] = useState<SysUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SysUser | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Refs to prevent unnecessary API calls
  const usersLoaded = useRef(false);
  const requestInProgress = useRef(false);
  const isMounted = useRef(false);
  // Stabilize the service reference
  const sysUsersServiceRef = useRef(useSysUsersService());
  
  // User registration hook
  const { 
    registerUser, 
    loading: registrationLoading, 
    registrationError 
  } = useUserRegistration();

  // Use the stabilized service reference
  const retrieveUsers = useCallback(async () => {
    // Skip if already loaded or request in progress
    if (usersLoaded.current || requestInProgress.current || !isMounted.current) return;
    
    // Set flag to avoid concurrent requests
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      const data = await sysUsersServiceRef.current.getAll();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setUsers(data);
        usersLoaded.current = true;
        setLoading(false);
      }
    } catch (error) {
      console.error('Error retrieving users:', error);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setError('Failed to load users');
        usersLoaded.current = true;
        setLoading(false);
      }
    } finally {
      requestInProgress.current = false;
    }
  }, [sysUsersServiceRef, usersLoaded, requestInProgress, isMounted]);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Call retrieveUsers once
    retrieveUsers();
    
    // Cleanup: reset mounted flag
    return () => {
      isMounted.current = false;
    };
  }, [retrieveUsers]);

  const setActiveUser = (user: SysUser, index: number) => {
    setCurrentUser(user);
    setCurrentIndex(index);
  };

  const toggleUserDefaultChecked = async (id: number, defaultChecked: boolean) => {
    try {
      // Update the user's defaultChecked status on the server
      await sysUsersServiceRef.current.updateDefaultChecked(id, !defaultChecked);
      
      // Update the local state directly without making another API call
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, defaultChecked: !defaultChecked } : user
        )
      );
      
      // If this is the currently selected user, update that too
      if (currentUser && currentUser.id === id) {
        setCurrentUser({ ...currentUser, defaultChecked: !defaultChecked });
      }
    } catch (error) {
      console.error('Error updating user default checked status:', error);
      setError('Failed to update user status');
    }
  };
  
  const handleRegisterCurrentUser = async () => {
    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
    
    try {
      const userData = await registerUser();
      
      if (userData) {
        // Show success message
        if (userData.isNewUser) {
          setSuccessMessage(`Successfully registered as ${userData.firstName} ${userData.lastName}`);
        } else {
          setSuccessMessage(`User account already exists for ${userData.firstName} ${userData.lastName}`);
        }
        
        // Reset loading state to reload the users list
        usersLoaded.current = false;
        retrieveUsers();
      } else if (registrationError) {
        setError(registrationError);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred during registration');
    }
  };

  if (loading && !usersLoaded.current) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="list row">
      <div className="col-12 mb-4">
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <h2>Users Management</h2>
          <button 
            className="btn btn-success" 
            onClick={handleRegisterCurrentUser}
            disabled={registrationLoading}
          >
            {registrationLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              'Register Current User'
            )}
          </button>
        </div>
        <p className="text-muted">
          Register your Clerk account with the system to create a local user profile.
        </p>
      </div>
      
      <div className="col-md-6">
        <h4>Users List</h4>

        {users.length === 0 ? (
          <div className="alert alert-info">
            No users found. Create a new user to get started.
          </div>
        ) : (
          <ul className="list-group">
            {users.map((user, index) => (
              <li
                className={
                  "list-group-item " + (index === currentIndex ? "active" : "")
                }
                onClick={() => setActiveUser(user, index)}
                key={index}
              >
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        )}

        <Link to="/users/new" className="btn btn-primary mt-3">
          New User
        </Link>
      </div>
      <div className="col-md-6">
        {currentUser ? (
          <div>
            <h4>User</h4>
            <div>
              <label>
                <strong>First Name:</strong>
              </label>{" "}
              {currentUser.firstName}
            </div>
            <div>
              <label>
                <strong>Last Name:</strong>
              </label>{" "}
              {currentUser.lastName}
            </div>
            <div>
              <label>
                <strong>Email:</strong>
              </label>{" "}
              {currentUser.email}
            </div>
            <div>
              <label>
                <strong>Default Selected:</strong>
              </label>{" "}
              {currentUser.defaultChecked ? "Yes" : "No"}
            </div>

            <div className="mt-3">
              <button
                className="btn btn-primary me-2"
                onClick={() => toggleUserDefaultChecked(currentUser.id, currentUser.defaultChecked)}
              >
                {currentUser.defaultChecked ? "Remove from Default Selection" : "Add to Default Selection"}
              </button>

              <Link
                to={"/users/" + currentUser.id}
                className="btn btn-warning"
              >
                Edit
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a User...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayUsers; 