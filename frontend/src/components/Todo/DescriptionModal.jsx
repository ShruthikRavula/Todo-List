import React from 'react';
import Modal from '../Common/Modal';

const DescriptionModal = ({ isOpen, onClose, description }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Todo Description">
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{description || "No description provided."}</p>
            <button onClick={onClose} className="secondary" style={{ marginTop: '15px' }}>Close</button>
        </Modal>
    );
};

export default DescriptionModal;