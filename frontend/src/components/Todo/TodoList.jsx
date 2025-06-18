import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({
    todos,
    currentUserId,
    onSelectTodo,
    selectedTodos,
    onOpenDescriptionModal,
    onOpenNotesModal,
    onEditTodo,
    sortConfig,
    requestSort
}) => {

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
        }
        return '';
    };

    if (!todos || todos.length === 0) {
        return <p>No todos to display.</p>;
    }

    return (
        <table className="min-w-full table-auto border-collapse">
            <thead>
                <tr>
                    <th>Select</th>
                    <th>Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th onClick={() => requestSort('date')} className="sortable px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date {getSortIndicator('date')}
                    </th>
                    <th>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                {todos.map(todo => (
                    <tr key={todo._id} className="hover:bg-gray-50">
                        <TodoItem
                            todo={todo}
                            currentUserId={currentUserId}
                            isSelected={selectedTodos.includes(todo._id)}
                            onSelect={onSelectTodo}
                            onOpenDescription={onOpenDescriptionModal}
                            onOpenNotes={onOpenNotesModal}
                            onEdit={onEditTodo}
                        />
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TodoList;