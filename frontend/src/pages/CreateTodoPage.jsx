import React from 'react';
import { useNavigate } from 'react-router-dom';
import TodoForm from '../components/Todo/TodoForm';
import { createTodo } from '../api';

const CreateTodoPage = () => {
    const navigate = useNavigate();

    const handleSubmit = async (todoData) => {
        await createTodo(todoData);
        navigate('/');
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-lg shadow space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Create New Todo</h2>
            <TodoForm onSubmit={handleSubmit} submitButtonText="Create Todo" />
        </div>
    );
};

export default CreateTodoPage;
