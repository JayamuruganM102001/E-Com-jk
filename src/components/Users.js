import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/UserService';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'USER' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateUser(editId, form);
    } else {
      await createUser(form);
    }
    setForm({ username: '', password: '', role: 'USER' });
    setEditId(null);
    loadUsers();
  };

  const handleEdit = (user) => {
    setForm({ username: user.username, password: user.password, role: user.role });
    setEditId(user.id);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  return (
    <div className="container mt-4">
      <h2>Warehouse Users</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit">{editId ? "Update" : "Add"} User</button>
      </form>

      <table border="1" cellPadding="10" className="mt-3">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Password</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.password}</td>
              <td>{u.role}</td>
              <td>
                <button className="action edit" onClick={() => handleEdit(u)}>Edit</button>
                <button className="action delete" onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
