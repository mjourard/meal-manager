import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SysUsersDataService from '../../services/sys-users.service';
import { SysUser } from '../../models/sys-user';

const DisplayUsers: React.FC = () => {
  const [users, setUsers] = useState<SysUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SysUser | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    retrieveUsers();
  }, []);

  const retrieveUsers = async () => {
    try {
      setLoading(true);
      const data = await SysUsersDataService.getAll();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const refreshList = () => {
    retrieveUsers();
    setCurrentUser(null);
    setCurrentIndex(-1);
  };

  const setActiveUser = (user: SysUser, index: number) => {
    setCurrentUser(user);
    setCurrentIndex(index);
  };

  const toggleUserDefaultChecked = async (id: number, defaultChecked: boolean) => {
    try {
      await SysUsersDataService.updateDefaultChecked(id, !defaultChecked);
      refreshList();
    } catch (error) {
      console.error('Error updating user default checked status:', error);
      setError('Failed to update user status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="list row">
      <div className="col-md-6">
        <h4>Users List</h4>

        <ul className="list-group">
          {users && users.map((user, index) => (
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