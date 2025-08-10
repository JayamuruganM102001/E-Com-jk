import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/UserService';
import { useNavigate } from 'react-router-dom';
import StockInventory from './StockInventory';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [formUser, setFormUser] = useState({ username: '', password: '', role: 'USER' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //username for localstorage used on header....
  const [loggedInUsername, setLoggedInUsername] = useState('');


  useEffect(() => {
    loadUsers();
    //logic for username...
    const username = localStorage.getItem('username');
    if (username) {
      setLoggedInUsername(username);
    }
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, formUser);
      } else {
        await createUser(formUser);
      }
      setFormUser({ username: '', password: '', role: 'USER' });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setFormUser({ username: user.username, password: '', role: user.role });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  return (
    <>

      <div className=" bg-gray-100">
        <header className="bg-blue-600 text-white py-4 shadow-md">
          <div className="container mx-auto px-2 sm:px-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

            <h1 className="text-2xl font-bold">StockMart</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                 <span className="text-white font-medium px-2 py-2">
                            Welcome, {loggedInUsername}
                        </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      </div>
      <div className="min-h-screen bg-gray-100 p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit User' : 'Add User'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={formUser.username}
                onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password {editingId && '(enter to change)'}</label>
              <input
                type="password"
                value={formUser.password}
                onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                className="w-full p-2 border rounded"
                required={!editingId} // password required when adding new user
              />
            </div>
            <div>
              <label className="block text-gray-700">Role</label>
              <select
                value={formUser.role}
                onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingId ? 'Update User' : 'Add User'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">User List</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Username</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border p-2">{user.id}</td>
                  <td className="border p-2">{user.username}</td>
                  <td className="border p-2">{user.role}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500 m-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="min-h-screen bg-gray-100 mt-10">
          <StockInventory />
        </div>
        <div>
          <button onClick={() =>navigate("/sample")}>
            Go to sample
          </button>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 StockMart. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default AdminDashboard;
