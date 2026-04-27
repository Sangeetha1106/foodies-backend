import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, ShoppingBag, Utensils, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('foods');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form state for adding food
    const [newFood, setNewFood] = useState({
        name: '',
        price: '',
        image: '',
        description: '',
        category: 'General'
    });

    const admin = JSON.parse(localStorage.getItem('admin'));


    const fetchOrders = async () => {
        try {
            const orderData = await adminService.getOrders(admin.token);
            setOrders(orderData);
        } catch (error) {
            console.error("Fetch orders failed", error);
        }
    };

    useEffect(() => {
        if (!admin) {
            navigate('/admin-login');
            return;
        }
        fetchData();
        fetchOrders(); // Initial fetch
    }, []);

    useEffect(() => {
        if (!admin) return;
        
        // Auto-refresh orders every 3 seconds as requested
        const interval = setInterval(() => {
            fetchOrders();
        }, 3000);

        return () => clearInterval(interval);
    }, [admin]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch foods (using API service)
            const { data: foodData } = await API.get('/foods');
            setFoods(foodData);

            // Fetch orders
            const orderData = await adminService.getOrders(admin.token);
            setOrders(orderData);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            await adminService.addFood(newFood, admin.token);
            toast.success("Food added successfully");
            setNewFood({ name: '', price: '', image: '', description: '', category: 'General' });
            fetchData();
        } catch (error) {
            toast.error("Failed to add food");
        }
    };

    const handleDeleteFood = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await adminService.deleteFood(id, admin.token);
                toast.success("Food deleted");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete food");
            }
        }
    };

    const handleLogout = () => {
        adminService.adminLogout();
        navigate('/admin-login');
    };

    if (loading && foods.length === 0) return <div className="admin-loading">Loading Admin Panel...</div>;

    return (
        <div className="admin-container fade-in">
            <aside className="admin-sidebar glass">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <p>{admin?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={activeTab === 'foods' ? 'active' : ''} 
                        onClick={() => setActiveTab('foods')}
                    >
                        <Utensils size={20} /> Manage Foods
                    </button>
                    <button 
                        className={activeTab === 'orders' ? 'active' : ''} 
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingBag size={20} /> View Orders
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                {activeTab === 'foods' ? (
                    <div className="admin-section">
                        <div className="section-header">
                            <h1>Manage Food Menu</h1>
                        </div>
                        
                        <div className="admin-grid">
                            {/* Add Food Form */}
                            <div className="admin-card glass add-food-card">
                                <h3>Add New Item</h3>
                                <form onSubmit={handleAddFood}>
                                    <input 
                                        type="text" 
                                        placeholder="Food Name" 
                                        value={newFood.name}
                                        onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                                        required
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Price (₹)" 
                                        value={newFood.price}
                                        onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Image URL" 
                                        value={newFood.image}
                                        onChange={(e) => setNewFood({...newFood, image: e.target.value})}
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Category" 
                                        value={newFood.category}
                                        onChange={(e) => setNewFood({...newFood, category: e.target.value})}
                                    />
                                    <textarea 
                                        placeholder="Description" 
                                        value={newFood.description}
                                        onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                                    ></textarea>
                                    <button type="submit" className="btn btn-primary w-full">
                                        <Plus size={18} /> Add Item
                                    </button>
                                </form>
                            </div>

                            {/* Food List */}
                            <div className="admin-card glass food-list-card">
                                <h3>Current Items ({foods.length})</h3>
                                <div className="food-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {foods.map(food => (
                                                <tr key={food.id}>
                                                    <td><img src={food.image} alt="" className="table-img" /></td>
                                                    <td>{food.name}</td>
                                                    <td>₹{food.price}</td>
                                                    <td>
                                                        <button 
                                                            className="delete-btn" 
                                                            onClick={() => handleDeleteFood(food.id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="admin-section">
                        <div className="section-header">
                            <h1>All Orders</h1>
                        </div>
                        <div className="admin-card glass order-list-card">
                            <div className="food-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Address</th>
                                            <th>Date & Time</th>
                                            <th>Items</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>
                                                    <div className="customer-info">
                                                        <strong>{order.name}</strong>
                                                        <span className="email-sub">{order.user_email}</span>
                                                    </div>
                                                </td>
                                                <td>{order.address}</td>
                                                <td>{new Date(order.created_at).toLocaleString()}</td>
                                                <td>
                                                    <div className="order-items-summary">
                                                        {order.items?.map((item, i) => (
                                                            <div key={i} className="mini-item">
                                                                {item.food_name} (x{item.quantity})
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>₹{order.total_price}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status?.toLowerCase().replace(' ', '-')}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
