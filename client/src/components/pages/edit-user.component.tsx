import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSysUsersService } from '../../services/sys-users.service';
import { SysUser } from '../../models/sys-user';

const EditUser: React.FC = () => {
  const initialUserState: SysUser = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    defaultChecked: false
  };

  const [currentUser, setCurrentUser] = useState<SysUser>(initialUserState);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewUser = id === 'new';

  const sysUsersService = useSysUsersService();

  const getUser = useCallback(async (id: number) => {
    try {
        const userData = await sysUsersService.get(id);
        setCurrentUser(userData);
        setLoading(false);
    } catch (error) {
        console.error('Error retrieving user:', error);
        setError('Error retrieving user');
        setLoading(false);
    }
  }, [sysUsersService]);

  useEffect(() => {
    if (!isNewUser && id) {
      getUser(parseInt(id, 10));
    } else {
      setLoading(false);
    }
  }, [id, isNewUser, getUser]);

  
    

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCurrentUser({ ...currentUser, [name]: checked });
  };

  const saveUser = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNewUser) {
        await sysUsersService.create(currentUser);
        setMessage('User was created successfully!');
        // Optionally navigate back to users list after creation
        // navigate('/users');
      } else {
        await sysUsersService.update(currentUser.id, currentUser);
        setMessage('The user was updated successfully!');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage('Error saving user');
    }
  };

  const deleteUser = async () => {
    try {
      await sysUsersService.delete(currentUser.id);
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Error deleting user');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="edit-user-container">
      <h4>{isNewUser ? 'New User' : 'Edit User'}</h4>
      
      <form onSubmit={saveUser}>
        <div className="form-group mb-3">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            name="firstName"
            value={currentUser.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            name="lastName"
            value={currentUser.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={currentUser.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="defaultChecked"
              name="defaultChecked"
              checked={currentUser.defaultChecked}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="defaultChecked">
              Include in Default Selection
            </label>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            {isNewUser ? 'Create' : 'Update'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/users')}
          >
            Cancel
          </button>
          
          {!isNewUser && (
            <button
              type="button"
              className="btn btn-danger ms-2"
              onClick={deleteUser}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className="alert alert-info mt-3">
          {message}
        </div>
      )}
    </div>
  );
};

export default EditUser; 