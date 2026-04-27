import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await API.post('/contact', formData);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Contact error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page container fade-in">
            <div className="contact-header">
                <h2>Get in Touch</h2>
                <p>Have questions? We're here to help.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="info-card card">
                        <Mail className="icon" />
                        <div>
                            <h4>Email Us</h4>
                            <p>support@foodies.com</p>
                        </div>
                    </div>
                    <div className="info-card card">
                        <Phone className="icon" />
                        <div>
                            <h4>Call Us</h4>
                            <p>+91 86672  12672</p>
                        </div>
                    </div>
                    <div className="info-card card">
                        <MapPin className="icon" />
                        <div>
                            <h4>Visit Us</h4>
                            <p>123 Foodie Street, Gourmet City, GC 10101</p>
                        </div>
                    </div>
                </div>

                <form className="contact-form card glass" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input 
                            type="text" 
                            name="name"
                            placeholder="John Doe" 
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="john@example.com" 
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea 
                            name="message"
                            rows="5" 
                            placeholder="How can we help you?"
                            required
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
