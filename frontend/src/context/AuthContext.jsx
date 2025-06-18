import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup } from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (loginIdentifier, password) => {
        setError(null);
        try {
            const data = await apiLogin(loginIdentifier, password);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signup = async (email, username, password) => {
        setError(null);
        try {
            const data = await apiSignup(email, username, password);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    // This "switchUser" is for the scenario where log out and log in as another user
    // (e.g., from /users page)
    const prepareSwitchUser = (username) => {
        logout(); // Log out current user
        // Navigate to login, potentially passing username in state
        navigate('/login', { state: { prefillUsername: username } });
    };


    return (
        <AuthContext.Provider value={{ user, setUser, loading, error, login, signup, logout, prepareSwitchUser, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;