'use client';

import { log } from "./logger";

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
        log.error("Cloudinary cloud name is not configured");
        reject(new Error('Cloudinary cloud name is not configured'));
        return;
      }

      log.debug("Preparing audio upload to Cloudinary...");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'auto');

      const xhr = new XMLHttpRequest();

      if (setProgress) {
        setProgress(0);
      }

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && setProgress) {
          setTimeout(() => {
            const progress = Math.round((event.loaded / event.total) * 100);
            log.debug(`Upload progress: ${progress}%`);
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
            const url = data.secure_url;
            log.debug("Cloudinary upload completed:", url);
            resolve(url);
          } catch (error) {
            log.error("Failed to parse Cloudinary upload response", error);
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          log.error("Cloudinary upload failed", {
            status: xhr.status,
            response: xhr.responseText,
          });
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        log.error("Network error during Cloudinary upload");
        reject(new Error('Network error occurred during upload'));
      });

      log.debug("Initiating upload request...");
      xhr.open('POST', `${CLOUDINARY_BASE_URL}/${cloudName}/auto/upload`);
      xhr.send(formData);
    } catch (error) {
      log.error("Unexpected error during upload setup", error);
      reject(error instanceof Error ? error : new Error('Upload initialization failed'));
    }
  });
};

export const deleteMeetingAudio = async (publicId: string): Promise<void> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      log.error("Cloudinary cloud name is not configured");
      throw new Error('Cloudinary cloud name is not configured');
    }

    log.debug(`Deleting Cloudinary file: ${publicId}`);

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
      log.error("Failed to delete Cloudinary file", await response.text());
      throw new Error('Failed to delete audio file');
    }

    log.debug("Cloudinary file deleted successfully");
  } catch (error) {
    log.error("Error deleting Cloudinary file", error);
    throw error instanceof Error ? error : new Error('Failed to delete audio file');
  }
};

async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  try {
    log.debug("Generating Cloudinary signature...");
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
      log.error("Failed to get Cloudinary signature", await response.text());
      throw new Error('Failed to generate signature');
    }

    const data = await response.json();
    log.debug("Cloudinary signature received:", data.signature);
    return data.signature;
  } catch (error) {
    log.error("Error generating Cloudinary signature", error);
    throw new Error('Failed to generate signature');
  }
}
