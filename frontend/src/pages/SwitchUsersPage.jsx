import React, { useState, useEffect, useCallback } from 'react';
import { getUsers as apiGetUsers } from '../api';
import useAuth from '../hooks/useAuth';
import UserItem from '../components/User/UserItem';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { FaExchangeAlt } from 'react-icons/fa';

const SwitchUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { prepareSwitchUser, user: currentUser } = useAuth();

    const fetchUsers = useCallback(async (cursor = null, append = false) => {
        if (!append) setLoading(true);
        else setIsLoadingMore(true);
        setError(null);

        try {
            const data = await apiGetUsers(cursor);
            if (append) {
                setUsers(prev => {
                    const existingIds = new Set(prev.map(u => u._id));
                    const uniqueNewUsers = data.users.filter(u => !existingIds.has(u._id));
                    return [...prev, ...uniqueNewUsers];
                });
            } else {
                setUsers(data.users || []);
            }
            setNextCursor(data.nextCursor || null);
        } catch (err) {
            setError(err.message);
            if (!append) setUsers([]);
        } finally {
            if (!append) setLoading(false);
            else setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(null, false); // Initial fetch
    }, [fetchUsers]);

    const handleSwitch = (username) => {
        if (currentUser && currentUser.username === username) {
            alert("You are already logged in as this user.");
            return;
        }
        prepareSwitchUser(username);
    };

    const handleLoadMore = () => {
        if (nextCursor && !isLoadingMore) {
            fetchUsers(nextCursor, true);
        }
    };

    if (loading && users.length === 0) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-lg shadow space-y-6">
            <h2 className="text-2xl font-bold mb-2 text-center">Switch User</h2>
            <p className="text-gray-600 mb-4 text-center">Select a user to log in as. You will be asked for their password.</p>
            <ErrorMessage message={error} />
            {users.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <UserItem key={user._id} user={user} onSwitchUser={handleSwitch} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p className="text-gray-500 text-center">No other users found or unable to load users.</p>
            )}

            {nextCursor && (
                <div className="text-center my-6">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-60"
                    >
                        {isLoadingMore ? 'Loading...' : <>Load More Users</>}
                    </button>
                </div>
            )}
            {!nextCursor && !loading && users.length > 0 && (
                <p className="text-center my-6 text-gray-400">All users loaded.</p>
            )}
        </div>
    );
};

export default SwitchUsersPage;