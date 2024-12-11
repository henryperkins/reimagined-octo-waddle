import React, { useRef } from 'react';
import { Button } from '../components/Button';
import { Upload } from 'lucide-react';
// import { useObsidian } from '../ui';

export interface FileUploadProps { // Exported the interface
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.txt,.md,.pdf,.png,.jpg,.jpeg',
  maxSize = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const app = { showNotice: (message: string) => alert(message) }; // Temporary replacement for useObsidian

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      app.showNotice(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      await onFileSelect(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      app.showNotice('Error uploading file');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        title="Upload file"
      />
      <Button
        variant="outline"
        onClick={handleClick}
        icon={<Upload className="w-4 h-4" />}
        title="Upload file"
      />
    </>
  );
};

// Loading state wrapper
export const FileUploadWithLoading: React.FC<FileUploadProps> = (props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      await props.onFileSelect(file);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FileUpload
      {...props}
      onFileSelect={handleFileSelect}
    />
  );
};

export default FileUploadWithLoading;
