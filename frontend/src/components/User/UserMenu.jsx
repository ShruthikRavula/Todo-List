import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import defaultUserIcon from './default-user-icon.png'; 

const UserMenu = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) return null;

    const handleSwitchUser = () => {
        setIsOpen(false);
        navigate('/users');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div style={styles.userMenuContainer} ref={menuRef}>
            <img
                src={defaultUserIcon}
                alt="User"
                style={styles.userIcon}
                onClick={toggleMenu}
            />
            {isOpen && (
                <div style={styles.dropdownMenu}>
                    <div style={styles.userInfo}>
                        <strong>{user.username}</strong><br />
                        <small>{user.email}</small>
                    </div>
                    <button onClick={handleSwitchUser} style={styles.menuButton}>Switch User</button>
                    <button onClick={() => { setIsOpen(false); logout(); }} style={styles.menuButton}>Logout</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    userMenuContainer: {
        position: 'relative',
        cursor: 'pointer',
    },
    userIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover', 
        border: '2px solid #ddd'
    },
    dropdownMenu: {
        position: 'absolute',
        top: '50px', // Below the icon
        right: '0',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: '100',
        width: '200px',
        padding: '10px',
    },
    userInfo: {
        paddingBottom: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        wordBreak: 'break-word',
    },
    menuButton: {
        display: 'block',
        width: '100%',
        padding: '8px 10px',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
};

export default UserMenu;