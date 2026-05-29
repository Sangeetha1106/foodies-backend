import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, MapPin, Phone, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, Home } from 'lucide-react';
import './Orders.jsx.css';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Helper for images
    const getFoodImage = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150";
        if (imagePath.startsWith('http')) return imagePath;
        return `https://foodies-backend-lich.onrender.com/images/${imagePath}`;
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 3000);

        return () => clearInterval(interval);
    }, [user]);

    const fetchOrders = async () => {
        try {
            if (!user) return;
            const { data } = await API.get(`/orders/${user.id}`);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    const statusSteps = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
    
    const getStatusIndex = (status) => {
        const index = statusSteps.indexOf(status);
        return index !== -1 ? index : 0;
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-order-placed';
        return `status-${status.toLowerCase().replace(/ /g, '-')}`;
    };

    const getStatusEmoji = (status) => {
        switch(status) {
            case 'Order Placed': return '✅';
            case 'Preparing': return '👨‍🍳';
            case 'Out for Delivery': return '🛵';
            case 'Delivered': return '🏠';
            default: return '📍';
        }
    };

    // Simulation logic to update status automatically
    useEffect(() => {
        const interval = setInterval(() => {
            setOrders(prevOrders => {
                let changed = false;
                const newOrders = prevOrders.map(order => {
                    const currentIndex = statusSteps.indexOf(order.status || 'Order Placed');
                    if (currentIndex !== -1 && currentIndex < statusSteps.length - 1) {
                        changed = true;
                        return { ...order, status: statusSteps[currentIndex + 1] };
                    }
                    return order;
                });
                return changed ? newOrders : prevOrders;
            });
        }, 10000); // Check and update every 10 seconds

        return () => clearInterval(interval);
    }, [orders]);

    if (loading) return <div className="container centered"><h2>Loading your orders...</h2></div>;

    if (orders.length === 0) {
        return (
            <div className="container centered fade-in">
                <div className="no-orders">
                    <Package size={80} color="#dfe6e9" />
                    <h2>No orders yet</h2>
                    <p>When you place an order, it will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page container fade-in">
            <h2 className="page-title">Order History</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div className="order-item card" key={order.id}>
                        <div className="order-summary-header" onClick={() => toggleExpand(order.id)}>
                            <div className="order-id-date">
                                <span className="order-id">Order #FS-{order.id}</span>
                                <div className="order-date">
                                    <Calendar size={14} />
                                    {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                             <div className="order-total-status">
                                <span className="order-total">₹{order.total_price}</span>
                                <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                                    {getStatusEmoji(order.status)} {order.status || 'Order Placed'}
                                </span>
                                {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                         {expandedOrder === order.id && (
                            <div className="order-details-expanded fade-in">
                                {/* Visual Status Timeline */}
                                <div className="status-timeline">
                                    {statusSteps.map((step, index) => {
                                        const currentIndex = getStatusIndex(order.status);
                                        const isCompleted = index < currentIndex;
                                        const isActive = index === currentIndex;
                                        const Icon = [CheckCircle, Clock, Truck, Home][index];

                                        return (
                                            <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                                <div className="step-icon-wrapper">
                                                    <Icon size={20} />
                                                    {index < statusSteps.length - 1 && <div className="step-line" />}
                                                </div>
                                                <span className="step-label">{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="delivery-info">
                                    <div className="info-block">
                                        <h4><MapPin size={16} /> Delivery Address</h4>
                                        <p>{order.name}<br />{order.address}</p>
                                    </div>
                                    <div className="info-block">
                                        <h4><Phone size={16} /> Contact Number</h4>
                                        <p>{order.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="order-items-detail">
                                    <h4>Ordered Items</h4>
                                    {order.items.map((item, idx) => (
                                        <div className="detail-item" key={idx}>
                                            <img src={getFoodImage(item.image)} alt={item.food_name} />
                                            <div className="detail-item-info">
                                                <span>{item.food_name}</span>
                                                <span className="qty">x{item.quantity}</span>
                                            </div>
                                            <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
