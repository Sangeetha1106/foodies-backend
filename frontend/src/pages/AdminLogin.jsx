import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import './Auth.css'; // Reusing existing Auth styles

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminService.adminLogin({ email, password });
            toast.success('Admin Login Successful');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-overlay"></div>
            <div className="auth-container glass fade-in">
                <div className="auth-header">
                    <Lock size={40} className="auth-icon" />
                    <h1>Admin Portal</h1>
                    <p>Secure access to the management dashboard</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label><Mail size={16} /> Admin Email</label>
                        <input
                            type="email"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>
                        Switch to <span style={{color: 'var(--primary-color, #ff4757)', fontWeight: '700'}}>User Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
