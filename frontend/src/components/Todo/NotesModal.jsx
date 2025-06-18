import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import useAuth from '../../hooks/useAuth';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const NotesModal = ({ isOpen, onClose, todo, onSaveNotes }) => {
    const [notesContent, setNotesContent] = useState('');
    const [isEditing, setIsEditing] = useState(false); // To enable editing mode
    const { user } = useAuth();
    const userTimeZone = 'Asia/Kolkata';

    useEffect(() => {
        if (todo && todo.notes) {
            // For editing, present notes in a way they can be modified.
            // A simple approach is to join them with a separator.
            setNotesContent(todo.notes.map(note => note.content).join('\n---\n'));
        } else {
            setNotesContent('');
        }
        setIsEditing(false); // Reset editing state when modal reopens or todo changes
    }, [todo, isOpen]);

    const handleSave = () => {
        // Split the content back into an array of note objects
        // This assumes the user edits the text area and '---' separates notes.
        const newNotesArray = notesContent
            .split('\n---\n')
            .map(content => content.trim())
            .filter(content => content) // Remove empty notes
            .map(content => ({ content })); // Backend will add editor/date for new notes
        // Or for existing, we'd need to send their _ids
        // This is a simplification. The backend `updateTodo` for `notes`
        // replaces the whole array.
        onSaveNotes(newNotesArray);
        onClose();
    };

    const isOwner = user && todo && todo.user && user._id === todo.user._id;

    const displayDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const localDate = utcToZonedTime(new Date(dateString), userTimeZone);
            return format(localDate, 'Pp');
        } catch { return 'Invalid Date'; }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Notes for: ${todo?.title || ''}`}>
            {todo && todo.notes && todo.notes.length > 0 && !isEditing && (
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                    {todo.notes.map((note, index) => (
                        <div key={note._id || index} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 5px 0' }}>{note.content}</p>
                            <small style={{ color: '#777' }}>
                                By: {note.editor?.username || 'Unknown'} on {displayDate(note.date)}
                            </small>
                        </div>
                    ))}
                </div>
            )}

            {(!todo || !todo.notes || todo.notes.length === 0) && !isEditing && (
                <p>No notes for this todo yet.</p>
            )}

            {isOwner && (isEditing || (!todo.notes || todo.notes.length === 0)) && (
                <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    placeholder={isEditing ? "Edit notes here, separated by '---'" : "Add new notes, separated by '---'"}
                    rows="5"
                    style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                />
            )}

            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {isOwner && !isEditing && todo && todo.notes && todo.notes.length > 0 && (
                    <button onClick={() => setIsEditing(true)} className="secondary">Edit Notes</button>
                )}
                {isOwner && (isEditing || (!todo.notes || todo.notes.length === 0)) && (
                    <button onClick={handleSave} className="primary">Save Notes</button>
                )}
                <button onClick={() => { setIsEditing(false); onClose(); }} className="secondary">
                    {isOwner && (isEditing || (!todo.notes || todo.notes.length === 0)) ? 'Cancel' : 'Close'}
                </button>
            </div>
        </Modal>
    );
};

export default NotesModal;