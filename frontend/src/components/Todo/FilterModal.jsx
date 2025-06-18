import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { FaSyncAlt, FaTimes, FaCheck } from 'react-icons/fa';

const FilterModal = ({ isOpen, onClose, currentFilters, onApplyFilters }) => {
    const [status, setStatus] = useState(currentFilters.status || '');
    const [priority, setPriority] = useState(currentFilters.priority || '');
    const [tags, setTags] = useState(currentFilters.tags || '');
    const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || '');
    const [dateTo, setDateTo] = useState(currentFilters.dateTo || '');

    useEffect(() => {
        setStatus(currentFilters.status || '');
        setPriority(currentFilters.priority || '');
        setTags(currentFilters.tags || '');
        setDateFrom(currentFilters.dateFrom || '');
        setDateTo(currentFilters.dateTo || '');
    }, [currentFilters, isOpen]);

    const handleApply = () => {
        onApplyFilters({
            status: status || undefined,
            priority: priority || undefined,
            tags: tags.trim() || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        });
        onClose();
    };

    const handleReset = () => {
        setStatus('');
        setPriority('');
        setTags('');
        setDateFrom('');
        setDateTo('');
        onApplyFilters({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Filter Todos">
            <div className="space-y-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="filter-status" className="font-medium">Status</label>
                    <select
                        id="filter-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All</option>
                        <option value="todo">To Do</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="filter-priority" className="font-medium">Priority</label>
                    <select
                        id="filter-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="filter-tags" className="font-medium">Tags (comma-separated)</label>
                    <input
                        type="text"
                        id="filter-tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g., work, important"
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="filter-dateFrom" className="font-medium">Due Date From</label>
                        <input
                            type="date"
                            id="filter-dateFrom"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="filter-dateTo" className="font-medium">Due Date To</label>
                        <input
                            type="date"
                            id="filter-dateTo"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        <FaSyncAlt /> Reset Filters
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            <FaTimes /> Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            <FaCheck /> Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default FilterModal;