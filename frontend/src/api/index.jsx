const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
        };
    }
    return { 'Content-Type': 'application/json' };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") { // No content
        return null;
    }
    return response.json();
};

// --- Auth ---
export const login = (loginIdentifier, password) => {
    return fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdentifier, password }),
    }).then(handleResponse);
};

export const signup = (email, username, password) => {
    return fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    }).then(handleResponse);
};

// --- Users ---
export const getUsers = (cursor = null) => {
    let url = `${API_URL}/users?`;
    if (cursor) {
        url += `cursor=${cursor}`;
    }
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
};

// --- Todos ---
export const getTodos = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/todos?${query}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const getTodoById = (id) => {
    return fetch(`${API_URL}/todos/${id}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const createTodo = (todoData) => {
    return fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(todoData),
    }).then(handleResponse);
};

export const updateTodo = (id, todoData) => {
    return fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(todoData),
    }).then(handleResponse);
};

export const deleteTodo = (id) => {
    return fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);
};

export const markTodosAsComplete = (todoIds) => {
    return fetch(`${API_URL}/todos/mark-complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ todoIds }),
    }).then(handleResponse);
};

export const exportTodos = async (type, params = {}) => { // type is 'csv' or 'json'
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/todos/export/${type}?${query}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to export ${type}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `todos.${type}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return { message: `Todos exported as ${type}` };
};