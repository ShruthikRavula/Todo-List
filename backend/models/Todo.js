const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    editor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const TodoSchema = new mongoose.Schema({
    user: { // Owner of the todo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['todo', 'pending', 'completed'],
        default: 'todo',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    mentionedUsers: [{ // Users mentioned in this todo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    notes: [NoteSchema],
    dueDate: { // Stores date and time
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);