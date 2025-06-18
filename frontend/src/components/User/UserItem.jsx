import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

const UserItem = ({ user, onSwitchUser }) => {
    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                    onClick={() => onSwitchUser(user.username)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    <FaExchangeAlt />
                    Switch
                </button>
            </td>
        </tr>
    );
};

export default UserItem;