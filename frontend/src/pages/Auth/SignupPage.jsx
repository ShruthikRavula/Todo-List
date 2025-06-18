import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaUserPlus } from 'react-icons/fa';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signup, error: authError, setError: setAuthError } = useAuth();

    useEffect(() => {
        setAuthError(null);
    }, [setAuthError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError(null);
        if (username.includes(' ')) {
            setAuthError("Username cannot contain spaces.");
            setIsSubmitting(false);
            return;
        }
        try {
            await signup(email, username, password);
        } catch (err) {
            console.error("Signup failed:", err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
            <ErrorMessage message={authError} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-medium">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="font-medium">Username (no spaces):</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        pattern="^\S+$"
                        title="Username cannot contain spaces."
                        required
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-medium">Password (min 6 characters):</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength="6"
                        required
                        className="border rounded px-3 py-2"
                    />
                </div>
                <button type="submit" className="flex items-center gap-2 justify-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full" disabled={isSubmitting}>
                    <FaUserPlus />
                    {isSubmitting ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
            <p className="text-center">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
        </div>
    );
};

export default SignupPage;