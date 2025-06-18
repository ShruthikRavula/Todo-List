const Todo = require('../models/Todo');
const User = require('../models/User');
const mongoose = require('mongoose');
const Papa = require('papaparse');

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Protected
const createTodo = async (req, res) => {
    const { title, description, notes: initialNoteContent, dueDate, priority, tags, mentionedUsernamesCsv } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        let mentionedUsersIds = [];
        if (mentionedUsernamesCsv) {
            const usernames = mentionedUsernamesCsv.split(',').map(u => u.trim()).filter(u => u);
            if (usernames.length > 0) {
                const users = await User.find({ username: { $in: usernames } }).select('_id');
                mentionedUsersIds = users.map(user => user._id);
            }
        }

        const notesArray = [];
        if (initialNoteContent && initialNoteContent.trim() !== "") {
            notesArray.push({
                content: initialNoteContent,
                editor: req.user._id,
                date: new Date()
            });
        }

        const todo = new Todo({
            user: req.user._id,
            title,
            description,
            notes: notesArray,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            mentionedUsers: mentionedUsersIds,
            status: 'todo',
        });

        const createdTodo = await todo.save();
        const populatedTodo = await Todo.findById(createdTodo._id)
            .populate('user', 'username email')
            .populate('mentionedUsers', 'username email')
            .populate('notes.editor', 'username email');
        res.status(201).json(populatedTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while creating todo' });
    }
};

// @desc    Get all todos for the current user (owned and mentioned)
// @route   GET /api/todos
// @access  Protected
const getTodos = async (req, res) => {
    const userId = req.user._id;
    const pageSize = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    const { status, priority: priorityFilter, tags: tagsFilter, dateFrom, dateTo, search } = req.query;

    let sortBy = req.query.sortBy || 'createdAt';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    try {
        let query = {
            $or: [
                { user: userId },
                { mentionedUsers: userId }
            ]
        };

        if (search) {
            query = {
                $and: [
                    { $or: [{ user: userId }, { mentionedUsers: userId }] },
                    {
                        $or: [
                            { title: { $regex: search, $options: 'i' } },
                            { description: { $regex: search, $options: 'i' } }
                        ]
                    }
                ]
            };
        }

        if (status) {
            query.status = status;
        }

        if (priorityFilter) {
            query.priority = priorityFilter;
        }

        if (tagsFilter) {
            const tagsArray = tagsFilter.split(',').map(tag => tag.trim()).filter(t => t);
            if (tagsArray.length > 0) {
                query.tags = { $in: tagsArray };
            }
        }

        if (dateFrom || dateTo) {
            query.dueDate = {};
            if (dateFrom) query.dueDate.$gte = new Date(dateFrom);
            if (dateTo) query.dueDate.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
        }

        if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
            if (sortOrder === 1) {
                query._id = { ...query._id, $gt: cursor };
            } else {
                query._id = { ...query._id, $lt: cursor };
            }
        }

        let sortOptions = {};
        if (sortBy === 'date') sortBy = 'dueDate';

        sortOptions[sortBy] = sortOrder;
        if (sortBy !== '_id') {
            sortOptions['_id'] = sortOrder;
        }

        const todos = await Todo.find(query)
            .populate('user', 'username email')
            .populate('mentionedUsers', 'username email')
            .populate('notes.editor', 'username email')
            .sort(sortOptions)
            .limit(pageSize);

        const ownedTodos = todos.filter(todo => todo.user._id.equals(userId));
        const mentionedTodos = todos.filter(todo => !todo.user._id.equals(userId) && todo.mentionedUsers.some(mu => mu._id.equals(userId)));

        const nextCursor = todos.length === pageSize ? todos[todos.length - 1]._id : null;

        res.json({
            ownedTodos,
            mentionedTodos,
            allSortedTodos: todos,
            nextCursor,
        });

    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Server error fetching todos' });
    }
};

// @desc    Get a specific todo by ID
// @route   GET /api/todos/:id
// @access  Protected
const getTodoById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Todo ID' });
        }
        const todo = await Todo.findById(req.params.id)
            .populate('user', 'username email')
            .populate('mentionedUsers', 'username email')
            .populate('notes.editor', 'username email');

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const isOwner = todo.user._id.equals(req.user._id);
        const isMentioned = todo.mentionedUsers.some(user => user._id.equals(req.user._id));

        if (!isOwner && !isMentioned) {
            return res.status(403).json({ message: 'User not authorized to view this todo' });
        }

        res.json(todo);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Todo not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an existing todo
// @route   PUT /api/todos/:id
// @access  Protected
const updateTodo = async (req, res) => {
    const { title, description, priority, status, tags, mentionedUsernamesCsv, dueDate, notes } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Todo ID' });
        }
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (!todo.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'User not authorized to update this todo' });
        }

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (priority !== undefined) todo.priority = priority;
        if (status !== undefined) todo.status = status;
        if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : todo.dueDate;

        if (tags !== undefined) {
            if (typeof tags === 'string') {
                todo.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            } else if (Array.isArray(tags)) {
                todo.tags = tags.map(tag => String(tag).trim()).filter(tag => tag);
            }
        }

        if (mentionedUsernamesCsv !== undefined) {
            const usernames = mentionedUsernamesCsv.split(',').map(u => u.trim()).filter(u => u);
            const users = await User.find({ username: { $in: usernames } }).select('_id');
            todo.mentionedUsers = users.map(user => user._id);
        }

        if (notes !== undefined && Array.isArray(notes)) {
            const processedNotes = notes.map(n => {
                const newNote = {
                    content: n.content,
                    editor: n.editor ? n.editor : req.user._id,
                    date: n.date ? new Date(n.date) : new Date(),
                    _id: n._id ? n._id : undefined
                };
                if (!newNote._id) delete newNote._id;
                return newNote;
            });
            todo.notes = processedNotes;
        }

        const updatedTodo = await todo.save();
        const populatedTodo = await Todo.findById(updatedTodo._id)
            .populate('user', 'username email')
            .populate('mentionedUsers', 'username email')
            .populate('notes.editor', 'username email');
        res.json(populatedTodo);

    } catch (error) {
        console.error('Error updating todo:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating todo' });
    }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Protected
const deleteTodo = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Todo ID' });
        }
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (!todo.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'User not authorized to delete this todo' });
        }

        await todo.deleteOne();
        res.json({ message: 'Todo removed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Export todos
// @route   GET /api/todos/export/:type
// @access  Protected
const exportTodos = async (req, res) => {
    const userId = req.user._id;
    const { type } = req.params;

    const { status, priority: priorityFilter, tags: tagsFilter, dateFrom, dateTo, search } = req.query;
    let sortBy = req.query.sortBy || 'createdAt';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {
        $and: [
            { $or: [{ user: userId }, { mentionedUsers: userId }] },
            ...(search ? [{
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            }] : [])
        ]
    };
    if (status) query.$and.push({ status });
    if (priorityFilter) query.$and.push({ priority: priorityFilter });
    if (tagsFilter) {
        const tagsArray = tagsFilter.split(',').map(tag => tag.trim()).filter(t => t);
        if (tagsArray.length > 0) query.$and.push({ tags: { $in: tagsArray } });
    }
    if (dateFrom || dateTo) {
        const dueDateQuery = {};
        if (dateFrom) dueDateQuery.$gte = new Date(dateFrom);
        if (dateTo) dueDateQuery.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
        query.$and.push({ dueDate: dueDateQuery });
    }

    let sortOptions = {};
    if (sortBy === 'date') sortBy = 'dueDate';
    sortOptions[sortBy] = sortOrder;
    if (sortBy !== '_id') sortOptions['_id'] = sortOrder;

    try {
        const todos = await Todo.find(query)
            .sort(sortOptions)
            .select('title tags dueDate priority status')
            .lean();

        if (!todos || todos.length === 0) {
            return res.status(404).json({ message: 'No todos found for export with current filters.' });
        }

        const exportData = todos.map(todo => ({
            Title: todo.title,
            Tags: todo.tags.join('; '),
            Time: todo.dueDate ? new Date(todo.dueDate).toISOString() : '',
            Priority: todo.priority,
            Status: todo.status,
        }));

        if (type.toLowerCase() === 'json') {
            res.setHeader('Content-Disposition', 'attachment; filename=todos.json');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(exportData);
        } else if (type.toLowerCase() === 'csv') {
            const csv = Papa.unparse(exportData);
            res.setHeader('Content-Disposition', 'attachment; filename=todos.csv');
            res.setHeader('Content-Type', 'text/csv');
            res.status(200).send(csv);
        } else {
            res.status(400).json({ message: 'Invalid export type. Use "csv" or "json".' });
        }
    } catch (error) {
        console.error('Error exporting todos:', error);
        res.status(500).json({ message: 'Server error during export' });
    }
};

// @desc    Mark multiple todos as complete
// @route   PUT /api/todos/mark-complete
// @access  Protected
const markTodosComplete = async (req, res) => {
    const { todoIds } = req.body;

    if (!Array.isArray(todoIds) || todoIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: 'Invalid todo IDs provided.' });
    }

    try {
        const updateResult = await Todo.updateMany(
            { _id: { $in: todoIds }, user: req.user._id },
            { $set: { status: 'completed', updatedAt: new Date() } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'No matching todos found for user or todos already updated.' });
        }
        if (updateResult.modifiedCount === 0 && updateResult.matchedCount > 0) {
            return res.status(200).json({ message: 'Todos were already marked as complete or no changes made.', modifiedCount: updateResult.modifiedCount, matchedCount: updateResult.matchedCount });
        }

        res.status(200).json({ message: `${updateResult.modifiedCount} todos marked as complete.`, modifiedCount: updateResult.modifiedCount });
    } catch (error) {
        console.error('Error marking todos complete:', error);
        res.status(500).json({ message: 'Server error marking todos complete.' });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    exportTodos,
    markTodosComplete
};
