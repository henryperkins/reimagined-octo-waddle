import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    {title && <h2 className="modal-title">{title}</h2>}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="modal-close"
                        aria-label="Close"
                    >
                        ×
                    </Button>
                </div>
                <div className="modal-content">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <div className="modal-footer-buttons">
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? 'primary' : 'default'}
                        onClick={handleConfirm}
                        className={isDestructive ? 'destructive' : ''}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <p>{message}</p>
        </Modal>
    );
};
