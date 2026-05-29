import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Added useAuth
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, fetchCart } = useCart();
    const { user } = useAuth(); // Destructure user
    const [showPopup, setShowPopup] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    
    // Helper for images
    const getFoodImage = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150";
        if (imagePath.startsWith('http')) return imagePath;
        return `https://foodies-backend-lich.onrender.com/images/${imagePath}`;
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = cartItems.length > 0 ? 40 : 0;
    const total = subtotal + deliveryFee;

    const handleOrder = async (e) => {
        e.preventDefault();
        
        if (!name || !phone || !address) {
            toast.error("Please fill in all details");
            return;
        }

        if (!user) {
            toast.error("Please login to place an order");
            return;
        }

        try {
            const orderData = {
                user_id: user.id || 1, // Use user.id or fallback to 1 for testing
                name,
                phone,
                address,
                total_price: total,
                items: cartItems // Include cart items for order_items table
            };

            console.log("[Cart] Placing order with data:", orderData);
            
            const response = await API.post('/orders', orderData);
            
            if (response.data) {
                toast.success("Order placed successfully");
                setShowPopup(false);
                fetchCart(); // This will clear the cart in the UI
                // Reset form
                setName("");
                setPhone("");
                setAddress("");
            }
            
        } catch (error) {
            console.error("[Cart] Order placement failed:", error);
            toast.error(error.response?.data?.error || "Order failed");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page container fade-in centered">
                <div className="empty-cart">
                    <ShoppingBag size={80} color="#dfe6e9" />
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items from the menu!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page container fade-in">
            <h2 className="page-title">Shopping Cart</h2>
            
            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item glass card">
                            <img src={getFoodImage(item.image)} alt={item.name} className="cart-item-img" />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p className="unit-price">₹{item.price}</p>
                            </div>
                            
                            <div className="quantity-controls">
                                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <Minus size={14} />
                                </button>
                                <span>{item.quantity}</span>
                                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            
                            <p className="item-total">₹{item.price * item.quantity}</p>
                            
                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary glass card">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>
                    
                    <button className="btn btn-primary buy-btn w-full" onClick={() => setShowPopup(true)}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in card">
                        <div className="modal-header">
                            <h2>Delivery Details</h2>
                            <button onClick={() => setShowPopup(false)}><X size={24} /></button>
                        </div>
                        <form className="modal-form" onSubmit={handleOrder}>
                            <input 
                                placeholder="Full Name" 
                                className="modal-input" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input 
                                placeholder="Phone Number" 
                                className="modal-input" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <textarea 
                                placeholder="Delivery Address" 
                                className="modal-textarea" 
                                rows="4"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            ></textarea>
                            <button type="submit" className="btn btn-primary">
                                Place Order (₹{total})
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
