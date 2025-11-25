import { useState } from 'react';

interface ScreenshotCaptureResult {
  captureScreenshot: () => Promise<File>;
  isCapturing: boolean;
  isScreenCaptureAvailable: boolean;
}

/**
 * Custom hook for capturing screenshots using the Screen Capture API
 * @returns Object containing capture function, capturing state, and availability check
 */
const useScreenshotCapture = (): ScreenshotCaptureResult => {
  const [isCapturing, setIsCapturing] = useState(false);

  // Check if screen capture is available
  const checkScreenCaptureAvailable = (): boolean => {
    return (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices !== undefined &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function'
    );
  };

  const captureScreenshot = async (): Promise<File> => {
    if (!checkScreenCaptureAvailable()) {
      throw new Error('Screen capture is not available in this environment');
    }

    try {
      setIsCapturing(true);

      // Request screen capture with specific options for better UX
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser', // Prefer capturing browser tabs
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      } as MediaStreamConstraints);

      // Create video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;

      // Wait for video metadata to load
      await new Promise<void>(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        throw new Error('Could not create image blob');
      }

      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `screenshot-${timestamp}.png`, { type: 'image/png' });

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      setIsCapturing(false);
      return file;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setIsCapturing(false);
      throw error;
    }
  };

  return {
    captureScreenshot,
    isCapturing,
    isScreenCaptureAvailable: checkScreenCaptureAvailable()
  };
};

export default useScreenshotCapture;
export { useScreenshotCapture };
export type { ScreenshotCaptureResult };
