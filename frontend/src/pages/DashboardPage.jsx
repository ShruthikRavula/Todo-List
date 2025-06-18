import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getTodos, markTodosAsComplete, updateTodo, exportTodos as apiExportTodos } from '../api';
import TodoList from '../components/Todo/TodoList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import UserMenu from '../components/User/UserMenu';
import DescriptionModal from '../components/Todo/DescriptionModal';
import NotesModal from '../components/Todo/NotesModal';
import FilterModal from '../components/Todo/FilterModal';
import { FaPlus, FaFilter, FaFileCsv, FaFileExport } from 'react-icons/fa';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [allTodos, setAllTodos] = useState([]);
    const [ownedTodos, setOwnedTodos] = useState([]);
    const [mentionedTodos, setMentionedTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTodos, setSelectedTodos] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [descriptionModal, setDescriptionModal] = useState({ isOpen: false, content: '' });
    const [notesModal, setNotesModal] = useState({ isOpen: false, todo: null });
    const [currentExportType, setCurrentExportType] = useState(null);

    const constructApiParams = useCallback((cursor = null) => {
        const params = { ...filters };
        if (searchTerm) params.search = searchTerm;
        if (cursor) params.cursor = cursor;
        params.limit = 10;

        if (sortConfig.key === 'date') params.sortBy = 'dueDate';
        else if (sortConfig.key === 'priority') params.sortBy = 'priority';
        else params.sortBy = 'createdAt';

        params.sortOrder = sortConfig.direction === 'ascending' ? 'asc' : 'desc';

        for (const key in params) {
            if (params[key] === undefined || params[key] === null || params[key] === '') {
                delete params[key];
            }
        }
        return params;
    }, [filters, searchTerm, sortConfig]);

    const fetchTodos = useCallback(async (cursor = null, append = false) => {
        if (!append) setLoading(true);
        else setIsLoadingMore(true);

        setError(null);
        try {
            const params = constructApiParams(cursor);
            const data = await getTodos(params);
            const newTodos = data.allSortedTodos || [];

            if (append) {
                setAllTodos(prev => {
                    const existingIds = new Set(prev.map(t => t._id));
                    const uniqueNewTodos = newTodos.filter(t => !existingIds.has(t._id));
                    return [...prev, ...uniqueNewTodos];
                });
            } else {
                setAllTodos(newTodos);
            }
            setNextCursor(data.nextCursor || null);
        } catch (err) {
            setError(err.message);
            if (!append) setAllTodos([]);
        } finally {
            if (!append) setLoading(false);
            else setIsLoadingMore(false);
        }
    }, [constructApiParams]);

    useEffect(() => {
        if (user && user._id) {
            const owned = allTodos.filter(todo => todo.user && todo.user._id === user._id);
            const mentioned = allTodos.filter(todo =>
                todo.user && todo.user._id !== user._id &&
                todo.mentionedUsers && todo.mentionedUsers.some(mu => mu._id === user._id)
            );
            setOwnedTodos(owned);
            setMentionedTodos(mentioned);
        }
    }, [allTodos, user]);

    useEffect(() => {
        if (user) {
            fetchTodos(null, false);
        }
    }, [user, fetchTodos]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (user) {
                fetchTodos(null, false);
                setSelectedTodos([]);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, user, fetchTodos]);

    useEffect(() => {
        if (user) {
            fetchTodos(null, false);
            setSelectedTodos([]);
        }
    }, [filters, user, fetchTodos]);

    useEffect(() => {
        if (user) {
            fetchTodos(null, false);
            setSelectedTodos([]);
        }
    }, [sortConfig, user, fetchTodos]);

    const handleSelectTodo = (todoId) => {
        setSelectedTodos(prev =>
            prev.includes(todoId) ? prev.filter(id => id !== todoId) : [...prev, todoId]
        );
    };

    const handleSelectAllChange = (event, todosToSelectFrom) => {
        if (event.target.checked) {
            const idsToSelect = todosToSelectFrom
                .filter(todo => todo.status !== 'completed' && todo.user._id === user._id)
                .map(todo => todo._id);
            setSelectedTodos(prev => [...new Set([...prev, ...idsToSelect])]);
        } else {
            const idsToRemove = todosToSelectFrom.map(todo => todo._id);
            setSelectedTodos(prev => prev.filter(id => !idsToRemove.includes(id)));
        }
    };

    const handleMarkSelectedComplete = async () => {
        if (selectedTodos.length === 0) return;
        try {
            const result = await markTodosAsComplete(selectedTodos);
            alert(result.message || `${result.modifiedCount} todos marked complete.`);
            fetchTodos(null, false);
            setSelectedTodos([]);
        } catch (err) {
            setError(err.message || "Failed to mark todos as complete.");
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const openDescriptionModal = (description) => setDescriptionModal({ isOpen: true, content: description });
    const closeDescriptionModal = () => setDescriptionModal({ isOpen: false, content: '' });
    const openNotesModal = (todo) => setNotesModal({ isOpen: true, todo: todo });
    const closeNotesModal = () => setNotesModal({ isOpen: false, todo: null });

    const handleSaveNotes = async (updatedNotesArray) => {
        if (!notesModal.todo) return;
        try {
            const todoToUpdate = { notes: updatedNotesArray };
            await updateTodo(notesModal.todo._id, todoToUpdate);
            fetchTodos(null, false);
        } catch (err) {
            setError(err.message || "Failed to save notes.");
        }
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setIsFilterModalOpen(false);
    };

    const handleEditTodo = (todoId) => {
        navigate(`/edit/${todoId}`);
    };

    const handleLoadMore = () => {
        if (nextCursor && !isLoadingMore) {
            fetchTodos(nextCursor, true);
        }
    };

    const handleExport = async (type) => {
        if (currentExportType) return;
        setCurrentExportType(type);
        setError(null);
        try {
            const params = constructApiParams();
            delete params.cursor;
            delete params.limit;
            await apiExportTodos(type, params);
        } catch (err) {
            setError(err.message || `Failed to export ${type}.`);
        } finally {
            setCurrentExportType(null);
        }
    };

    if (loading && allTodos.length === 0) return <LoadingSpinner />;

    return (
        <div className="pb-20 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4 px-2 pt-8">
                <div className="flex items-center gap-4 flex-wrap flex-grow">
                    <input
                        type="text"
                        placeholder="Search todos (title/description)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg min-w-[220px] flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button onClick={() => setIsFilterModalOpen(true)} className="p-3 flex items-center gap-2 bg-gray-200 rounded-lg hover:bg-gray-300 shadow" title="Filter Todos">
                        <FaFilter /> <span className="font-medium">Filters</span>
                    </button>
                    <button onClick={() => handleExport('csv')} className="p-3 flex items-center gap-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 shadow" disabled={!!currentExportType} title="Export as CSV">
                        {currentExportType === 'csv' ? 'Exporting...' : <><FaFileCsv /> <span className="font-medium">CSV</span></>}
                    </button>
                    <button onClick={() => handleExport('json')} className="p-3 flex items-center gap-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 shadow" disabled={!!currentExportType} title="Export as JSON">
                        {currentExportType === 'json' ? 'Exporting...' : <><FaFileExport /> <span className="font-medium">JSON</span></>}
                    </button>
                </div>
                <UserMenu />
            </div>

            <ErrorMessage message={error} />

            {selectedTodos.length > 0 && (
                <div className="p-4 bg-indigo-100 border border-indigo-300 rounded-lg mb-6 flex justify-between items-center shadow">
                    <span className="font-medium">{selectedTodos.length} todo(s) selected.</span>
                    <button onClick={handleMarkSelectedComplete} className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 shadow">
                        Mark as Complete
                    </button>
                </div>
            )}

            <h3 className="text-2xl font-semibold mb-4 mt-6 px-2">Owned Todos</h3>
            {loading && ownedTodos.length === 0 && <LoadingSpinner />}
            {ownedTodos.length > 0 ? (
                <>
                    <div className="mb-4 px-2">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-indigo-600"
                                onChange={(e) => handleSelectAllChange(e, ownedTodos)}
                                checked={ownedTodos.length > 0 && ownedTodos.filter(t => t.status !== 'completed').every(t => selectedTodos.includes(t._id))}
                                disabled={ownedTodos.filter(t => t.status !== 'completed').length === 0}
                            />
                            <span className="ml-2 text-gray-700">Select All Owned (Pending/Todo)</span>
                        </label>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 mb-8 mx-2">
                        <TodoList
                            todos={ownedTodos}
                            currentUserId={user?._id}
                            selectedTodos={selectedTodos}
                            onSelectTodo={handleSelectTodo}
                            onOpenDescriptionModal={openDescriptionModal}
                            onOpenNotesModal={openNotesModal}
                            onEditTodo={handleEditTodo}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                        />
                    </div>
                </>
            ) : (
                !loading && <p className="text-gray-500 px-2">You don't own any todos matching the current filters.</p>
            )}

            <h3 className="text-2xl font-semibold mt-10 mb-4 px-2">Mentioned Todos</h3>
            {loading && mentionedTodos.length === 0 && <LoadingSpinner />}
            {mentionedTodos.length > 0 ? (
                <div className="bg-white rounded-lg shadow p-4 mb-8 mx-2">
                    <TodoList
                        todos={mentionedTodos}
                        currentUserId={user?._id}
                        selectedTodos={selectedTodos}
                        onSelectTodo={() => { }}
                        onOpenDescriptionModal={openDescriptionModal}
                        onOpenNotesModal={openNotesModal}
                        onEditTodo={handleEditTodo}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                    />
                </div>
            ) : (
                !loading && <p className="text-gray-500 px-2">No todos mentioning you match the current filters.</p>
            )}

            {nextCursor && (
                <div className="text-center my-8">
                    <button onClick={handleLoadMore} disabled={isLoadingMore} className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 shadow">
                        {isLoadingMore ? 'Loading...' : 'Load More Todos'}
                    </button>
                </div>
            )}
            {!nextCursor && !loading && allTodos.length > 0 && (
                <p className="text-center my-8 text-gray-400">All todos loaded.</p>
            )}

            <button onClick={() => navigate('/create')} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center cursor-pointer text-3xl hover:bg-blue-700 transition-transform transform hover:scale-110 z-50" title="Create New Todo">
                <FaPlus />
            </button>

            <DescriptionModal
                isOpen={descriptionModal.isOpen}
                onClose={closeDescriptionModal}
                description={descriptionModal.content}
            />
            <NotesModal
                isOpen={notesModal.isOpen}
                onClose={closeNotesModal}
                todo={notesModal.todo}
                onSaveNotes={handleSaveNotes}
            />
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
};

export default DashboardPage;