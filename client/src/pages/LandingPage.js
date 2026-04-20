import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, PieChart, IndianRupee, Wallet } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const servicesRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            { threshold: 0.1 } // Trigger slightly earlier
        );

        const currentRef = servicesRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Top Navigation */}
            <nav className="landing-nav">
                <Link to="/" className="nav-logo">
                    <span className="logo-by">by</span> <span className="logo-name">Avanish</span><div className="logo-dot"></div>
                </Link>
                <div className="nav-links">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-button">Start now</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                {/* Center Glow for Depth */}
                <div className="hero-glow"></div>

                <div className="hero-content">
                    <h1 className="hero-title">The Modern Way<br />To Track Investments</h1>
                    <p className="hero-subtitle">Real-time insights, portfolio tracking, and smarter decisions for your financial future.</p>
                </div>

                {/* Floating Finance Icons with Parallax/Depth */}
                <div className="floating-icon icon-1">
                    <LineChart size={36} />
                </div>
                <div className="floating-icon icon-2">
                    <IndianRupee size={48} />
                </div>
                <div className="floating-icon icon-3">
                    <Wallet size={32} />
                </div>
                <div className="floating-icon icon-4">
                    <PieChart size={42} />
                </div>

                {/* Floating 3D Widgets / Cards */}
                <div className="floating-widget widget-left">
                    <div className="widget-header">
                        <div className="widget-icon-bg"><Wallet size={16} color="#fff" /></div>
                        <span className="widget-title">Total Balance</span>
                    </div>
                    <div className="widget-value">₹34,809.50</div>
                    <div className="widget-chart-mini">
                        <div className="mini-bar" style={{height: '30%'}}></div>
                        <div className="mini-bar" style={{height: '50%'}}></div>
                        <div className="mini-bar" style={{height: '40%'}}></div>
                        <div className="mini-bar" style={{height: '80%'}}></div>
                        <div className="mini-bar" style={{height: '60%'}}></div>
                        <div className="mini-bar active" style={{height: '90%'}}></div>
                    </div>
                </div>

                <div className="floating-widget widget-right">
                    <div className="promo-card">
                        <div className="promo-image-placeholder">
                            {/* Simple illustration block for the city view in the video */}
                            <div className="promo-building" style={{ height: '60%', left: '10%' }}></div>
                            <div className="promo-building" style={{ height: '80%', left: '30%' }}></div>
                            <div className="promo-building" style={{ height: '50%', left: '50%' }}></div>
                            <div className="promo-building" style={{ height: '70%', left: '70%' }}></div>
                        </div>
                        <div className="promo-text">
                            Discover how your assets are performing!
                        </div>
                        <div className="promo-button">Register now</div>
                    </div>
                </div>

                {/* 3D Dashboard Placeholder */}
                <div className="dashboard-centerpiece-wrapper">
                    <div className="dashboard-mockup">
                        <div className="mockup-header">
                            <div className="mockup-dot" style={{ background: '#ef4444' }}></div>
                            <div className="mockup-dot" style={{ background: '#eab308' }}></div>
                            <div className="mockup-dot" style={{ background: '#22c55e' }}></div>
                        </div>
                        <div className="mockup-content">
                            <div className="mockup-sidebar"></div>
                            <div className="mockup-main">
                                <div className="mockup-cards">
                                    <div className="mockup-card"></div>
                                    <div className="mockup-card"></div>
                                    <div className="mockup-card"></div>
                                </div>
                                <div className="mockup-chart"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tilted Yellow Ribbon Marquee */}
            <div className="ribbon-wrapper">
                <div className="ribbon-container">
                    <div className="ribbon-content">
                        {/* Sequence 1 */}
                        <div className="ribbon-item">STOCKS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">ETFs <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">MUTUAL FUNDS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">INDEX FUNDS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">TRACK <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">ANALYZE <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">GROW <div className="ribbon-dot"></div></div>

                        {/* Sequence 2 (Duplicated for infinite scroll illusion) */}
                        <div className="ribbon-item">STOCKS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">ETFs <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">MUTUAL FUNDS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">INDEX FUNDS <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">TRACK <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">ANALYZE <div className="ribbon-dot"></div></div>
                        <div className="ribbon-item">GROW <div className="ribbon-dot"></div></div>
                    </div>
                </div>
            </div>

            {/* Scroll Reveal Section */}
            <section className="services-section reveal-section" ref={servicesRef}>
                <h2 className="services-title">ALL SERVICES YOU<br />NEED IN ONE PLACE</h2>
                <p className="services-subtitle">Everything you need to make your money work smarter. Track, analyze,<br />and grow your portfolio effortlessly.</p>
                <Link to="/register" className="services-button">Start now</Link>
            </section>

        </div>
    );
};

export default LandingPage;
