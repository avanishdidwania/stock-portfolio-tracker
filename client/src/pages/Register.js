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
        // form goes here
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
}

export default Register;