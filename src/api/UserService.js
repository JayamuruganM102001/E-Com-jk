import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/users`;
export const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

export const BASE_URL = `${process.env.REACT_APP_API_URL}/api`;




const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const getUsers = () => axios.get(API_URL,authHeader());

export const createUser = (user) => axios.post(API_URL, user,authHeader());

export const updateUser = (id, user) => axios.put(`${API_URL}/${id}`, user,authHeader());

export const deleteUser = (id) => axios.delete(`${API_URL}/${id}`,authHeader());
