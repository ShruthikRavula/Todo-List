import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, error: authError, setError: setAuthError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.prefillUsername) {
            setLoginIdentifier(location.state.prefillUsername);
        }
        setAuthError(null);
    }, [location.state, setAuthError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError(null);
        try {
            await login(loginIdentifier, password);
        } catch (err) {
            console.error("Login failed:", err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <ErrorMessage message={authError} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="loginIdentifier" className="font-medium">Username or Email:</label>
                    <input
                        type="text"
                        id="loginIdentifier"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-medium">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border rounded px-3 py-2"
                    />
                </div>
                <button type="submit" className="flex items-center gap-2 justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
                    <FaSignInAlt />
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center">
                Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default LoginPage;