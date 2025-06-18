import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateTodoPage from './pages/CreateTodoPage';
import EditTodoPage from './pages/EditTodoPage';
import DisplayTodoPage from './pages/DisplayTodoPage';
import SwitchUsersPage from './pages/SwitchUsersPage';
import useAuth from './hooks/useAuth';

function AppContent() {
    const { user, logout } = useAuth(); 

    return (
        <>
            <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
                    {user && <Link to="/users" style={{ marginRight: '10px' }}>Switch Users</Link>}
                </div>
                <div>
                    {!user ? (
                        <>
                            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    ) : (
                        <button onClick={logout} className="secondary">Logout ({user.username})</button>
                    )}
                </div>
            </nav>
            <div className="container">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/create" element={<CreateTodoPage />} />
                        <Route path="/edit/:id" element={<EditTodoPage />} />
                        <Route path="/display-todo/:id" element={<DisplayTodoPage />} />
                        <Route path="/users" element={<SwitchUsersPage />} />
                    </Route>

                    <Route path="*" element={<p>Page Not Found</p>} /> {/* Catch-all for 404 */}
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
                <AppContent />
        </AuthProvider>
    );
}

export default App;