import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TodoForm from '../components/Todo/TodoForm';
import { getTodoById, updateTodo, deleteTodo as apiDeleteTodo } from '../api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';

const EditTodoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTodo = async () => {
            try {
                setLoading(true);
                const data = await getTodoById(id);
                setTodo(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setTodo(null);
            } finally {
                setLoading(false);
            }
        };
        fetchTodo();
    }, [id]);

    const handleSubmit = async (todoData) => {
        await updateTodo(id, todoData);
        navigate(`/display-todo/${id}`); 
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this todo?")) {
            try {
                await apiDeleteTodo(id);
                navigate('/');
            } catch (err) {
                setError(err.message || "Failed to delete todo.");
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={`Error loading todo: ${error}`} />;
    if (!todo) return <p>Todo not found.</p>;

    const initialDataForForm = {
        ...todo,
        tags: todo.tags || [], 
        mentionedUsers: todo.mentionedUsers || [], 
    };


    return (
        <div>
            <h2>Edit Todo</h2>
            <TodoForm
                initialData={initialDataForForm}
                onSubmit={handleSubmit}
                submitButtonText="Save Changes"
                isEditing={true}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default EditTodoPage;