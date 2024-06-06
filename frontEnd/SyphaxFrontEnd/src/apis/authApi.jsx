// src/apis/authApi.jsx
import axios from 'axios';
import { API_URL } from '../globals/globals';


export async function login(email, password, staySignedIn) {
  const response = await axios.post(`${API_URL}/login`, { email, password, staySignedIn });
  return response.data;
}
