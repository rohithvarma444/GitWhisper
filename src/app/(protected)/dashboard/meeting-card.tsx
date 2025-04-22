'use client'

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadMeetingAudio } from '@/lib/cloudinary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Presentation, Upload } from 'lucide-react'
import { Circles } from 'react-loader-spinner'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import useProjects from '@/hooks/use-projects'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function MeetingCard() {
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUploaded, setAudioUploaded] = useState(false);
  const refetch = useRefetch();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const processMeeting = api.project.processMeetingTranscription.useMutation(); // Use the new tRPC mutation
  const { projectId } = useProjects();
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, 
    onDrop: async (acceptedFiles) => {
      setError(null);
      if (!acceptedFiles.length) {
        setError('No file was selected');
        return;
      }

      const file = acceptedFiles[0] as File
      setIsUploading(true);
      try {
        const uploadUrl = await uploadMeetingAudio(file, setProgress);
        if (!uploadUrl) {
          throw new Error('Failed to upload file');
        }
        console.log("Upload URL:", uploadUrl);
        console.log('---------------------- log -----------------------');
        console.log('Sending audio URL to AssemblyAI:', uploadUrl);
        uploadMeeting.mutate({
            projectId: projectId,
            meetingUrl: uploadUrl,
            name: file.name
        },
        {
          onSuccess: async () => {
            setAudioUploaded(true);
            console.log(uploadMeeting);
            if (uploadMeeting?.data?.id) {
              console.log("yo reached here");
              try {
                console.log('reached here');
                await processMeeting.mutateAsync({
                  meetingId: uploadMeeting.data.id,
                  projectId: projectId,
                  meetingUrl: uploadUrl
                });
                console.log("Meeting processed successfully");
                toast.success("Meeting successfully processed!");
              } catch (error) {
                console.error("Error during transcription process:", error);
                toast.error("Error processing meeting.");
              }
            }
            refetch();
          },
          onError: () => {
            toast.error("Meeting upload failed");
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file');
      } finally {
        setIsUploading(false);
        setProgress(undefined);
      }
    },
  });

  return (
    <>
      {audioUploaded && (
        <div className="mb-6 text-sm text-green-600 animate-pulse text-center">
          ✅ Audio uploaded! Sit back and relax while we process your meeting. This may take a few minutes...
        </div>
      )}
      <Card className='col-span-2 flex flex-col items-center justify-center p-10'>
        {!isUploading ? (
          <div className='flex flex-col items-center'>
            <Presentation className='h-10 w-10 animate-bounce' />
            <h3 className='mt-2 text-sm font-semibold text-gray-700'>
              Create a New Meeting
            </h3>
            <p className='mt-1 text-center text-sm text-gray-500'>
              Analysing your meeting with GitWhisper
            </p>
            <div className='mt-6' {...getRootProps()}>
              <Button>
                <Upload className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
                Upload Meeting
                <input className='hidden' {...getInputProps()} />
              </Button>
            </div>
            {error && (
              <p className='mt-4 text-sm text-red-500'>
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <Circles
              height='60'
              width='60'
              color='#2563eb'
              ariaLabel='uploading-indicator'
            />
            <p className='mt-4 text-sm text-gray-700'>
              Uploading... {progress?.toFixed(0)}%
            </p>
          </div>
        )}
      </Card>
    </>
  )
}

export default MeetingCard;