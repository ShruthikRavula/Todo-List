import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../Common/ErrorMessage';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const TodoForm = ({ initialData = {}, onSubmit, submitButtonText = "Submit", isEditing = false, onDelete }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [currentNote, setCurrentNote] = useState(isEditing && initialData.notes && initialData.notes.length > 0 ? initialData.notes[0].content : '');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [priority, setPriority] = useState(initialData.priority || 'medium');
    const [tags, setTags] = useState(initialData.tags ? initialData.tags.join(', ') : '');
    const [mentionedUsernamesCsv, setMentionedUsernamesCsv] = useState(
        initialData.mentionedUsers ? initialData.mentionedUsers.map(u => u.username).join(', ') : ''
    );
    const [status, setStatus] = useState(initialData.status || 'todo');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const userTimeZone = 'Asia/Kolkata';

    useEffect(() => {
        if (initialData.dueDate) {
            const localDate = utcToZonedTime(parseISO(initialData.dueDate), userTimeZone);
            setDueDate(format(localDate, 'yyyy-MM-dd'));
            setDueTime(format(localDate, 'HH:mm'));
        }
        if (initialData.notes && initialData.notes.length > 0) {
            setCurrentNote(initialData.notes.map(n => n.content).join('\n---\n'));
        }
    }, [initialData, userTimeZone]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        let combinedDateTime = null;
        if (dueDate && dueTime) {
            try {
                const localDateTimeString = `${dueDate}T${dueTime}:00`;
                const localDate = parseISO(localDateTimeString);
                combinedDateTime = zonedTimeToUtc(localDate, userTimeZone).toISOString();
            } catch (dateError) {
                setError("Invalid date or time format.");
                setIsSubmitting(false);
                return;
            }
        } else if (dueDate && !dueTime) {
            try {
                const localDateTimeString = `${dueDate}T00:00:00`;
                const localDate = parseISO(localDateTimeString);
                combinedDateTime = zonedTimeToUtc(localDate, userTimeZone).toISOString();
            } catch (dateError) {
                setError("Invalid date format.");
                setIsSubmitting(false);
                return;
            }
        }

        const todoData = {
            title,
            description,
            priority,
            tags,
            mentionedUsernamesCsv,
            dueDate: combinedDateTime,
        };

        if (isEditing) {
            let updatedNotes = initialData.notes || [];
            if (currentNote.trim() !== (initialData.notes ? initialData.notes.map(n => n.content).join('\n---\n') : "")) {
                updatedNotes = currentNote.split('\n---\n').map(content => ({ content: content.trim() })).filter(n => n.content);
            }
            todoData.notes = updatedNotes;
            todoData.status = status;
        } else {
            if (currentNote.trim()) {
                todoData.notes = currentNote;
            }
        }

        try {
            await onSubmit(todoData);
        } catch (err) {
            setError(err.message || "Failed to save todo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <ErrorMessage message={error} />
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-medium">Title <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border rounded px-3 py-2"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-medium">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border rounded px-3 py-2"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="notes" className="font-medium">
                    Notes {isEditing ? "(Edit existing or add new, separated by '---')" : "(Initial note)"}
                </label>
                <textarea
                    id="notes"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder={isEditing ? "Content of note 1\n---\nContent of note 2" : "Add an initial note here..."}
                    className="border rounded px-3 py-2"
                />
            </div>
            <div className="flex gap-6 mb-4">
                <div className="flex flex-col gap-2 flex-1">
                    <label htmlFor="dueDate" className="font-medium">Due Date (IST)</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label htmlFor="dueTime" className="font-medium">Due Time (IST)</label>
                    <input
                        type="time"
                        id="dueTime"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="priority" className="font-medium">Priority</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="border rounded px-3 py-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            {isEditing && (
                <div className="flex flex-col gap-2">
                    <label htmlFor="status" className="font-medium">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
                        <option value="todo">To Do</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            )}
            <div className="flex flex-col gap-2">
                <label htmlFor="tags" className="font-medium">Tags (comma-separated)</label>
                <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., work, personal, urgent"
                    className="border rounded px-3 py-2"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="mentionedUsernamesCsv" className="font-medium">Mention Users (comma-separated usernames)</label>
                <input
                    type="text"
                    id="mentionedUsernamesCsv"
                    value={mentionedUsernamesCsv}
                    onChange={(e) => setMentionedUsernamesCsv(e.target.value)}
                    placeholder="e.g., user1,another_user"
                    className="border rounded px-3 py-2"
                />
            </div>
            <div className="flex justify-between items-center mt-8">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : submitButtonText}
                </button>
                {isEditing && onDelete && (
                    <button type="button" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition" onClick={onDelete} disabled={isSubmitting}>
                        Delete Todo
                    </button>
                )}
            </div>
        </form>
    );
};

export default TodoForm;