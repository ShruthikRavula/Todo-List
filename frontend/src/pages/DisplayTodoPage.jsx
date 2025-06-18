import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTodoById } from '../api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import useAuth from '../hooks/useAuth';

const DisplayTodoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userTimeZone = 'Asia/Kolkata';

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

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!todo) return <p>Todo not found.</p>;

    const isOwner = user && todo.user && user._id === todo.user._id;

    const displayDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const localDate = utcToZonedTime(new Date(dateString), userTimeZone);
            return format(localDate, 'Pp (zzz)'); // Format: 09/05/2023, 7:30 PM (IST)
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{todo.title}</h2>

            <div style={styles.detailGrid}>
                <DetailItem label="Status" value={todo.status} />
                <DetailItem label="Priority" value={todo.priority} />
                <DetailItem label="Owner" value={todo.user ? todo.user.username : 'Unknown'} />
                <DetailItem label="Due Date" value={displayDate(todo.dueDate)} />
                <DetailItem label="Created At" value={displayDate(todo.createdAt)} />
                <DetailItem label="Last Updated" value={displayDate(todo.updatedAt)} />
            </div>

            {todo.description && (
                <Section title="Description">
                    <p style={styles.descriptionText}>{todo.description}</p>
                </Section>
            )}

            {todo.tags && todo.tags.length > 0 && (
                <Section title="Tags">
                    <div style={styles.tagsContainer}>
                        {todo.tags.map((tag, index) => (
                            <span key={index} style={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </Section>
            )}

            {todo.mentionedUsers && todo.mentionedUsers.length > 0 && (
                <Section title="Mentioned Users">
                    <ul>
                        {todo.mentionedUsers.map(mu => (
                            <li key={mu._id}>{mu.username} ({mu.email})</li>
                        ))}
                    </ul>
                </Section>
            )}

            {todo.notes && todo.notes.length > 0 && (
                <Section title="Notes">
                    {todo.notes.map((note, index) => (
                        <div key={note._id || index} style={styles.noteItem}>
                            <p style={styles.noteContent}>{note.content}</p>
                            <small style={styles.noteMeta}>
                                By: {note.editor ? note.editor.username : 'Unknown'} on {displayDate(note.date)}
                            </small>
                        </div>
                    ))}
                </Section>
            )}

            {isOwner && (
                <Link to={`/edit/${todo._id}`} style={styles.editButton}>
                    <button className="primary">Edit Todo</button>
                </Link>
            )}
            <button className="secondary" onClick={() => navigate(-1)} style={{ marginTop: '20px', marginLeft: isOwner ? '10px' : '0' }}>
                Back
            </button>
        </div>
    );
};

// Helper components for styling
const DetailItem = ({ label, value }) => (
    <div style={styles.detailItem}>
        <strong style={styles.detailLabel}>{label}:</strong>
        <span style={styles.detailValue}>{value}</span>
    </div>
);

const Section = ({ title, children }) => (
    <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {children}
    </div>
);

// Basic styles (can be moved to a CSS file)
const styles = {
    container: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    title: { borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px', color: '#2c3e50' },
    detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' },
    detailItem: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' },
    detailLabel: { marginRight: '8px', color: '#555' },
    detailValue: { color: '#333' },
    section: { marginTop: '25px' },
    sectionTitle: { fontSize: '1.2em', color: '#3498db', marginBottom: '10px' },
    descriptionText: { lineHeight: '1.6', whiteSpace: 'pre-wrap' },
    tagsContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    tag: { backgroundColor: '#e0e0e0', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9em' },
    noteItem: { border: '1px solid #eee', padding: '10px', borderRadius: '4px', marginBottom: '10px', backgroundColor: '#fdfdfd' },
    noteContent: { margin: '0 0 5px 0', whiteSpace: 'pre-wrap' },
    noteMeta: { fontSize: '0.8em', color: '#777' },
    editButton: { textDecoration: 'none', marginTop: '20px', display: 'inline-block' }
};

export default DisplayTodoPage;