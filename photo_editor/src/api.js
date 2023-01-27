import axios from 'axios';

//const API = axios.create({ baseURL: 'http://localhost:5000' });

//export const API = axios.create({ baseURL: 'https://visionsim-backend.onrender.com' });

const url = 'http://localhost:5000/';//'https://visionsim-backend.onrender.com';
//const url = 'https://dogstagram-api.onrender.com';

export const API = axios.create({ baseURL: url });

//export const fetchPosts = () => API.get('/posts');
//export const fetchPosts = () => API.get('/api');
//export const API


