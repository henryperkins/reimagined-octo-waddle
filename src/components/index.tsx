import ChatInterface from './ChatInterface';
import ChatMessage from './ChatMessage';
import FileUpload, { FileUploadWithLoading } from './FileUpload';
import { Button } from '../components/Button';
import { Modal, ConfirmModal } from '../components/Modal';
import { TextArea } from '../components/TextArea';
import SettingsBox from './SettingsBox'; // Updated to default import
import { Input } from './Input';
import { Card, CardHeader, CardContent } from './Card';

export {
  ChatInterface,
  ChatMessage,
  FileUpload,
  FileUploadWithLoading,
  Button,
  Modal,
  ConfirmModal,
  TextArea,
  SettingsBox,
  Input,
  Card,
  CardHeader,
  CardContent,
};

// Re-export types
export type { ChatInterfaceProps } from './ChatInterface';
export type { ChatMessageProps } from './ChatMessage';
export type { FileUploadProps } from './FileUpload';
export type { ButtonProps } from '../components/Button';
export type { ModalProps } from '../components/Modal';
export type { TextAreaProps } from '../components/TextArea';
export type { SettingsBoxProps } from '../types'; // Corrected import path
