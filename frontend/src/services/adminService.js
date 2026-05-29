import axios from 'axios';

const API_URL = 'https://foodies-backend-lich.onrender.com/api/admin';

const adminLogin = async (adminData) => {
    const response = await axios.post("https://foodies-backend-lich.onrender.com/api/admin/login", adminData);
    if (response.data) {
        localStorage.setItem('admin', JSON.stringify(response.data));
    }
    return response.data;
};

const adminLogout = () => {
    localStorage.removeItem('admin');
};

const addFood = async (foodData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}/foods`, foodData, config);
    return response.data;
};

const deleteFood = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/foods/${id}`, config);
    return response.data;
};

const getOrders = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/orders`, config);
    return response.data;
};

const adminService = {
    adminLogin,
    adminLogout,
    addFood,
    deleteFood,
    getOrders,
};

export default adminService;
