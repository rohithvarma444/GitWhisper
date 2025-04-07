'use client';

const CLOUDINARY_BASE_URL = 'https://api.cloudinary.com/v1_1';
const UPLOAD_PRESET = 'audio files';

export const uploadMeetingAudio = async (
  file: File,
  setProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        reject(new Error('Cloudinary cloud name is not configured'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'auto');

      

      const xhr = new XMLHttpRequest();

      // Initialize progress
      if (setProgress) {
        setProgress(0);
      }

      // Event handlers
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && setProgress) {
          setTimeout(() => {
            const progress = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.min(progress, 95));
          }, 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (setProgress) {
              setProgress(100);
            }
            const url =  data.secure_url;
            resolve(data.secure_url);
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          console.error('Upload failed:', {
            status: xhr.status,
            response: xhr.responseText,
          });
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload'));
      });

      // Send request
      xhr.open('POST', `${CLOUDINARY_BASE_URL}/${cloudName}/auto/upload`);
      xhr.send(formData);
      
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Upload initialization failed'));
    }
  });
};

export const deleteMeetingAudio = async (publicId: string): Promise<void> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);

    const response = await fetch(
      `${CLOUDINARY_BASE_URL}/${cloudName}/auto/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          signature,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          timestamp,
          resource_type: 'auto',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete audio file');
    }
  } catch (error) {
    console.error('Error deleting audio:', error);
    throw error instanceof Error ? error : new Error('Failed to delete audio file');
  }
};

async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  try {
    const response = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate signature');
    }

    const data = await response.json();
    return data.signature;
  } catch (error) {
    throw new Error('Failed to generate signature');
  }
}
