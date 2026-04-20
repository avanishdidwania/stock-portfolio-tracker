import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';

function App() {
    return (
        <AuthProvider>
            <Router>
                <CustomCursor />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;