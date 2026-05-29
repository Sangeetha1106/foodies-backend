import axios from 'axios';

const API = axios.create({
    baseURL: 'https://foodies-backend-lich.onrender.com/api',
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
