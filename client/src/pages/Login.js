import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop page refresh
        // now handle login ourselves
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            login(response.data.token); // save token to context + localStorage
            navigate('/dashboard'); // redirect to dashboard
        } catch (err) {
            setError('Invalid email or password'); // show error on screen
        }

    };

    return (
        // form goes here
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p>{error}</p>}
            <button>Submit</button>
        </form>
    );
};

export default Login;