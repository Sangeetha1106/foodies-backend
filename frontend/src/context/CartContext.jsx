import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, isAuthenticated } = useAuth();

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            return;
        }
        try {
            const { data } = await API.get(`/cart?user_id=${user.id}`);
            setCartItems(data);
        } catch (error) {
            console.error('[CartContext] Error fetching cart:', error);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (item, quantity = 1) => {
        console.log("[CartContext] addToCart:", item.name);
        if (!user) {
            toast.error("Please login to add to cart");
            return;
        }
        try {
            const body = { 
                user_id: user.id,
                food_id: item.id, 
                quantity: quantity 
            };
            console.log("[CartContext] POST /api/cart body:", body);
            const response = await API.post('/cart', body);
            console.log("[CartContext] API Response:", response.data);
            
            await fetchCart();
            toast.success("Added to cart");
        } catch (error) {
            console.error('[CartContext] Error in addToCart:', error);
            toast.error(error.response?.data?.message || "Failed to add to cart");
        }
    };

    const updateQuantity = async (id, quantity) => {
        try {
            if (quantity <= 0) {
                await removeFromCart(id);
                return;
            }
            await API.put(`/cart/${id}`, { quantity });
            await fetchCart();
        } catch (error) {
            console.error('[CartContext] Error updating quantity:', error);
            toast.error('Could not update quantity');
        }
    };

    const removeFromCart = async (id) => {
        try {
            await API.delete(`/cart/${id}`);
            await fetchCart();
            toast.success('Item removed');
        } catch (error) {
            console.error('[CartContext] Error removing from cart:', error);
            toast.error('Could not remove item');
        }
    };

    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
