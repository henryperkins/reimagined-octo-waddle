import React from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';

interface ModalProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  trigger,
  title,
  description,
  children,
  footer,
  isOpen,
  onOpenChange,
  showCloseButton = true,
  closeOnClickOutside = true,
}) => {
  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} onClick={() => onOpenChange && onOpenChange(false)}>
      {trigger && <div className="modal-trigger">{trigger}</div>}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          {showCloseButton && (
            <button className="close-button" onClick={() => onOpenChange && onOpenChange(false)}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// Preset modal types
export const ConfirmModal: React.FC<{
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}> = ({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      trigger={trigger}
      title={title}
      description={description}
      children={<></>}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    />
  );
};

export { Modal, type ModalProps };
