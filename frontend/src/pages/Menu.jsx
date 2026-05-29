import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Menu.css';

const Menu = ({ searchTerm: propSearchTerm }) => {
    const context = useOutletContext();
    const searchTerm = propSearchTerm || context?.searchTerm || '';
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState(null); // Added missing state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const { user } = useAuth();
    const { cartItems, fetchCart, addToCart: cartAddToCart } = useCart(); // Destructure addToCart

    const handleAddToCart = (item) => {
        axios.post("https://foodies-backend-lich.onrender.com/api/cart", {
            user_id: 1, // TEMP HARDCODE AS REQUESTED
            food_id: item.id,
            quantity: 1
        })
        .then(res => {
            alert("Added to cart");
            fetchCart();
        })
        .catch(err => {
            console.log(err);
            toast.error("Failed to add to cart");
        });
    };


    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const { data } = await API.get('/foods');
            setMenuItems(data);
        } catch (error) {
            console.error('[Menu] Error fetching menu:', error);
            toast.error("Could not load menu items");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBuyNow = (item) => {
        console.log("[Menu] Buy Now clicked for:", item.name);
        setBuyNowItem(item);
        setShowPopup(true);
    };

    const handleOrder = async () => {
        if (!name || !phone || !address) {
            alert("Please fill all details");
            return;
        }

        if (phone.length !== 10) {
            alert("Enter valid phone number");
            return;
        }

        const total = buyNowItem ? Number(buyNowItem.price) + 40 : 0;

        axios.post("https://foodies-backend-lich.onrender.com/api/orders", {
            user_id: 1,
            total_price: total,
            address: address,
            name: name,
            phone: phone,
            items: [{
                food_id: buyNowItem.id,
                quantity: 1,
                price: buyNowItem.price
            }]
        })
        .then(res => {
            alert("Order placed successfully");
            setShowPopup(false);
            setBuyNowItem(null);
            // Reset form
            setName("");
            setPhone("");
            setAddress("");
        })
        .catch(err => {
            console.log(err.response?.data || err);
            alert("Order failed");
        });
    };

    if (loading) return <div className="container centered"><h2>Loading delicious food...</h2></div>;

    return (
        <div className="menu-page container fade-in">
            <div className="menu-header">
                <h2>Our Delicious Menu</h2>
                <p>Browse and order your favorite dishes instantly</p>
            </div>

            <div className="menu-grid">
                {filteredItems.map((item) => {
                    // Debugging image URL
                    console.log('Food Item:', item.name, 'Image URL:', item.image);

                    return (
                        <div className="food-card card" key={item.id}>
                            <div className="food-image">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                                <div className="food-category">{item.category || 'General'}</div>
                            </div>
                            <div className="food-details">
                                <div className="food-info">
                                    <h3>{item.name}</h3>
                                    <div className="rating">
                                        <Star size={16} fill="#f1c40f" color="#f1c40f" />
                                        <span>4.5</span>
                                    </div>
                                </div>
                                <p className="food-desc">{item.description || 'Tasty and fresh food prepared with love.'}</p>
                                <div className="food-footer">
                                    <span className="price">₹{item.price}</span>
                                    <div className="action-btns">
                                        <button
                                            className="btn btn-secondary icon-btn"
                                            title="Add to Cart"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <ShoppingCart size={18} />
                                        </button>
                                        <button
                                            className="btn btn-primary buy-btn"
                                            onClick={() => handleBuyNow(item)}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in popup">
                        <h2>Enter Details</h2>
                        <input
                            placeholder="Name"
                            className="modal-input"
                            style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '8px' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            placeholder="Phone"
                            className="modal-input"
                            style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '8px' }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <textarea
                            placeholder="Address"
                            className="modal-textarea"
                            style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '8px' }}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                        <button className="btn btn-primary w-full" style={{ marginBottom: '10px' }} onClick={handleOrder}>
                            Place Order (₹{buyNowItem ? buyNowItem.price + 40 : cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + 40})
                        </button>
                        <button className="btn btn-secondary w-full" onClick={() => { setShowPopup(false); setBuyNowItem(null); }}>Close</button>
                    </div>
                </div>
            )}

            {filteredItems.length === 0 && (
                <div className="no-results">
                    <h3>No items found matching "{searchTerm}"</h3>
                </div>
            )}
        </div>
    );
};

export default Menu;
