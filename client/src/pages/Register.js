import {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Register = () =>{
    const {login} = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) =>{
        e.preventDefault();

        try{
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password
            });
            login(response.data.token);
            navigate('/dashboard');
        }catch (err){
            setError('Invalid details');
        }
    };

    return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400 mb-8">Start tracking your portfolio</p>

            {error && (
                <p className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="text-gray-400 text-sm mb-2 block">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition"
                >
                    Create Account
                </button>
            </form>
            <p className="text-gray-400 text-center mt-4">
                Already have an account?{' '}
                <a href="/" className="text-blue-500 hover:underline">Sign In</a>
            </p>
        </div>
    </div>
);
}

export default Register;