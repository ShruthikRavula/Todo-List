import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { FiEdit2 } from 'react-icons/fi';
import { FaRegStickyNote } from 'react-icons/fa';

const TodoItem = ({ todo, onSelect, isSelected, currentUserId, onOpenDescription, onOpenNotes, onEdit }) => {
    const userTimeZone = 'Asia/Kolkata';

    const displayDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const localDate = utcToZonedTime(new Date(dateString), userTimeZone);
            return format(localDate, 'MMM d, yyyy HH:mm');
        } catch {
            return 'Invalid Date';
        }
    };

    const isOwner = todo.user && todo.user._id === currentUserId;
    const descriptionSnippet = todo.description
        ? (todo.description.length > 20 ? todo.description.substring(0, 20) + "..." : todo.description)
        : "N/A";

    return (
        <>
            <td className="px-6 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(todo._id)}
                    disabled={todo.status === 'completed' || !isOwner}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
            </td>
            <td className="px-6 py-3 text-sm text-gray-800">
                {isOwner ? <strong>You</strong> : (todo.user ? todo.user.username : 'Unknown')}
            </td>
            <td className="px-6 py-3 text-sm font-medium text-blue-600 hover:underline">
                <Link to={`/display-todo/${todo._id}`}>
                    {todo.title}
                </Link>
            </td>
            <td className="px-6 py-3 text-sm text-gray-700">
                {displayDate(todo.dueDate) || displayDate(todo.createdAt)}
            </td>
            <td className="px-6 py-3 text-sm capitalize text-gray-700">
                {todo.status}
            </td>
            <td className="px-6 py-3 text-sm text-blue-600 hover:underline cursor-pointer">
                <span onClick={() => onOpenDescription(todo.description)}>
                    {descriptionSnippet}
                </span>
            </td>
            <td className="px-6 py-3 text-center">
                <button
                    onClick={() => onOpenNotes(todo)}
                    className="text-blue-500 hover:text-blue-700 text-lg"
                    title="View/Edit Notes"
                >
                    <FaRegStickyNote />
                </button>
            </td>
            <td className="px-6 py-3 text-center">
                {isOwner && (
                    <button
                        onClick={() => onEdit(todo._id)}
                        className="text-green-600 hover:text-green-800 text-lg"
                        title="Edit Todo"
                    >
                        <FiEdit2 />
                    </button>
                )}
            </td>
        </>
    );
};

export default TodoItem;
