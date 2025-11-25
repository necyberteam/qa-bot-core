import React, { useState, useRef } from 'react';
import useScreenshotCapture from '../hooks/useScreenshotCapture';
import UploadIcon from './icons/UploadIcon';
import { formatFileSize } from '../utils/file-utils';

export interface FileUploadComponentProps {
  /** Callback when files are selected/uploaded */
  onFileUpload: (files: File[]) => void;
  /** Maximum file size in MB (default: 10) */
  maxSizeMB?: number;
  /** Accepted file types (default: images, PDFs, text, docs) */
  acceptedTypes?: string;
  /** Enable screenshot capture button (default: false, opt-in) */
  enableScreenshot?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * File upload component with drag-and-drop, file preview, and optional screenshot capture
 */
const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileUpload,
  maxSizeMB = 10,
  acceptedTypes = 'image/*,application/pdf,text/*,.doc,.docx',
  enableScreenshot = false,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { captureScreenshot, isCapturing, isScreenCaptureAvailable } = useScreenshotCapture();

  // Helper function to announce messages to screen readers
  const announceToScreenReader = (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleFiles = (files: FileList | File[]): void => {
    // Defensive check: ensure files is valid and iterable
    if (!files || (files as FileList).length === 0) {
      console.warn('FileUploadComponent: No valid files provided to handleFiles');
      return;
    }

    let newFileArray: File[];
    try {
      newFileArray = Array.from(files);
    } catch (error) {
      console.error('FileUploadComponent: Error converting files to array:', error);
      announceToScreenReader('Error processing selected files. Please try again.');
      return;
    }

    const updatedFiles = [...selectedFiles, ...newFileArray];
    setSelectedFiles(updatedFiles);

    // Announce file selection to screen readers
    const fileCount = newFileArray.length;
    const fileNames = newFileArray.map(f => f.name).join(', ');
    announceToScreenReader(`${fileCount} file${fileCount > 1 ? 's' : ''} selected: ${fileNames}`);

    // Programmatically scroll chat to bottom after file selection to keep Continue button in view
    setTimeout(() => {
      const chatContent = document.querySelector('.rcb-chat-content');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }, 100);

    if (onFileUpload) {
      onFileUpload(updatedFiles);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    try {
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    } catch (error) {
      console.error('FileUploadComponent: Error in handleDrop:', error);
      announceToScreenReader('Error processing dropped files. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    try {
      if (e.target?.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    } catch (error) {
      console.error('FileUploadComponent: Error in handleFileSelect:', error);
      announceToScreenReader('Error processing selected files. Please try again.');
    }
  };

  const handleButtonClick = (): void => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('FileUploadComponent: Error in handleButtonClick:', error);
      announceToScreenReader('Error opening file selection dialog. Please try again.');
    }
  };

  const handleRemoveFile = (indexToRemove: number): void => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(newFiles);
    if (onFileUpload) {
      onFileUpload(newFiles);
    }
  };

  const handleScreenshotCapture = async (): Promise<void> => {
    try {
      const file = await captureScreenshot();
      handleFiles([file]);
      announceToScreenReader('Screenshot captured successfully');
    } catch {
      announceToScreenReader('Error capturing screenshot. Please try again.');
    }
  };

  const handleFilePreview = (file: File): void => {
    setPreviewFile(file);
  };

  const closePreview = (): void => {
    setPreviewFile(null);
  };

  const renderFilePreview = (): React.ReactNode => {
    if (!previewFile) return null;

    const isImage = previewFile.type.startsWith('image/');
    const isText = previewFile.type.startsWith('text/');
    const isPDF = previewFile.type === 'application/pdf';

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={closePreview}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={closePreview}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>

          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{previewFile.name}</h3>

          {isImage && (
            <img
              src={URL.createObjectURL(previewFile)}
              alt={previewFile.name}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          )}

          {isText && (
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              maxHeight: '70vh',
              overflow: 'auto',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}>
              {URL.createObjectURL(previewFile)}
            </pre>
          )}

          {isPDF && (
            <iframe
              src={URL.createObjectURL(previewFile)}
              style={{ width: '100%', height: '70vh', border: 'none' }}
              title={previewFile.name}
            />
          )}

          {!isImage && !isText && !isPDF && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Preview not available for this file type
            </div>
          )}
        </div>
      </div>
    );
  };

  const showScreenshotButton = enableScreenshot && isScreenCaptureAvailable;

  return (
    <div className={`file-upload-container ${className || ''}`} style={{ padding: '16px', margin: '8px 0' }}>
      {showScreenshotButton && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleScreenshotCapture();
            }}
            disabled={isCapturing}
            aria-describedby="screenshot-help"
            aria-label={isCapturing ? 'Taking screenshot, please wait' : 'Take a screenshot to attach'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#107180',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 12px',
              cursor: isCapturing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            {isCapturing ? 'Taking screenshot...' : 'Take screenshot...'}
          </button>
          <span id="screenshot-help" className="sr-only">
            Captures the current screen and adds it as an attachment
          </span>
        </div>
      )}

      <div
        className={`file-upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="File upload area. Click to select files or drag and drop files here."
        aria-describedby="upload-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleButtonClick();
          }
        }}
        style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleFileSelect}
          multiple
          style={{ display: 'none' }}
          aria-label="Select files to upload"
          accept={acceptedTypes}
        />
        <div
          className="upload-content"
          onClick={handleButtonClick}
          style={{
            cursor: 'pointer',
            flexDirection: 'column',
            alignItems: 'center',
            display: 'flex',
            textAlign: 'center',
            padding: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <UploadIcon />
              <p style={{ margin: 0, fontWeight: 'bold' }}>Upload Files</p>
            </div>
            <p id="upload-instructions" style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Drag and drop files here or click to select. (Max {maxSizeMB}MB each)
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <div
              className="selected-files"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px',
                alignItems: 'center'
              }}
            >
              <span style={{
                fontWeight: 400,
                color: '#888',
                fontSize: '13px',
                marginRight: '8px',
                alignSelf: 'center'
              }}>
                Selected files:
              </span>
              {selectedFiles.map((file, index) => (
                <span
                  key={index}
                  style={{
                    background: '#fff',
                    color: '#107180',
                    borderRadius: '5px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    marginRight: '4px',
                    marginBottom: '4px',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilePreview(file);
                  }}
                >
                  <span
                    onClick={e => { e.stopPropagation(); handleRemoveFile(index); }}
                    style={{
                      cursor: 'pointer',
                      color: '#888',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      marginRight: '4px',
                      userSelect: 'none',
                      lineHeight: 1,
                    }}
                    title="Remove file"
                    aria-label={`Remove ${file.name}`}
                  >
                    &times;
                  </span>
                  {file.name} ({formatFileSize(file.size)})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {renderFilePreview()}
    </div>
  );
};

export default FileUploadComponent;
export { FileUploadComponent };
