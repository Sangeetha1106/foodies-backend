import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page fade-in">
            <header className="hero container">
                <div className="hero-content">
                    <h1>Fastest <span>Food Delivery</span> <br /> In Your City</h1>
                    <p>Craving something delicious? Order from the best restaurants around you and get it delivered in minutes.</p>
                    <div className="hero-btns">
                        <Link to="/menu" className="btn btn-primary btn-lg">
                            Order Now <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Delicious Food" />
                </div>
            </header>

            <section className="features container">
                <div className="feature-card glass">
                    <Star className="feature-icon" color="#ff7675" />
                    <h3>Top Rated</h3>
                    <p>Only the best restaurants with high ratings.</p>
                </div>
                <div className="feature-card glass">
                    <Clock className="feature-icon" color="#00b894" />
                    <h3>Fast Delivery</h3>
                    <p>Your food is delivered hot and fresh.</p>
                </div>
                <div className="feature-card glass">
                    <ShieldCheck className="feature-icon" color="#0984e3" />
                    <h3>Secure Payment</h3>
                    <p>Safe and seamless checkout experience.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
