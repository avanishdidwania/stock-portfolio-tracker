import API_URL from '../config';
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Login.css';
import { Mail, Lock, TrendingUp, BarChart2, ShieldCheck, IndianRupee } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="login-container">

            {/* Left Panel — Form */}
            <div className="login-left">
                <div className="login-content-wrapper">

                    {/* Logo */}
                    <Link to="/" className="login-logo-link">
                        <span className="login-logo-by">by</span>
                        <span className="login-logo-name">Avanish</span>
                        <div className="login-logo-dot"></div>
                    </Link>

                    <div className="login-header">
                        <h1>Welcome back</h1>
                        <p>Sign in to your portfolio dashboard</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    className="login-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="login-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <div className="remember-me" onClick={() => setRememberMe(!rememberMe)}>
                                <div className={`toggle-switch ${rememberMe ? 'active' : ''}`}>
                                    <div className="toggle-knob"></div>
                                </div>
                                <span>Remember me</span>
                            </div>
                            <a href="/forgot-password" onClick={(e) => e.preventDefault()} className="forgot-password">Forgot Password?</a>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="login-button">Sign in</button>

                        <div className="login-divider">
                            <span>or</span>
                        </div>

                        <button type="button" className="google-login-button" onClick={() => console.log('Google login clicked')}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    <div className="login-footer">
                        <span>Don't have an account? <Link to="/register" className="login-register-link">Create one</Link></span>
                    </div>
                </div>
            </div>

            {/* Right Panel — Visual */}
            <div className="login-right">
                <div className="login-right-bg"></div>
                <div className="login-right-dots"></div>

                <div className="right-content-wrapper">
                    {/* Floating 3D Visual Mockup */}
                    <div className="login-visual-mockup">
                        <div className="mockup-glass-card main-card">
                            <div className="mockup-header">
                                <div className="mockup-circle"></div>
                                <div className="mockup-line short"></div>
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-chart">
                                    <div className="mockup-bar" style={{height: '30%'}}></div>
                                    <div className="mockup-bar" style={{height: '50%'}}></div>
                                    <div className="mockup-bar" style={{height: '40%'}}></div>
                                    <div className="mockup-bar active" style={{height: '85%'}}></div>
                                    <div className="mockup-bar" style={{height: '60%'}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mockup-glass-card floating-card front">
                            <IndianRupee size={20} color="#ffc107" />
                            <div className="mockup-line"></div>
                        </div>
                        <div className="mockup-glass-card floating-card back">
                            <TrendingUp size={20} color="#10b981" />
                            <div className="mockup-line"></div>
                        </div>
                    </div>

                    <div className="right-titles">
                        <div className="right-badge">Smart Portfolio Tracking</div>
                        <h1>Track. Analyze.<br />Grow.</h1>
                        <p>Real-time insights and smarter decisions for your financial future.</p>
                    </div>

                    <div className="feature-cards">
                        <div className="feature-card">
                            <div className="card-icon"><BarChart2 size={28} color="#ffc107" /></div>
                            <h3 className="card-title">Real-Time Analytics</h3>
                            <p className="card-text">Up-to-date data and market trends at a glance</p>
                        </div>
                        <div className="feature-card">
                            <div className="card-icon"><TrendingUp size={28} color="#3b82f6" /></div>
                            <h3 className="card-title">Portfolio Tracking</h3>
                            <p className="card-text">Monitor all your investments in one place</p>
                        </div>
                        <div className="feature-card">
                            <div className="card-icon"><ShieldCheck size={28} color="#10b981" /></div>
                            <h3 className="card-title">Secure & Private</h3>
                            <p className="card-text">Advanced security to protect your account</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;