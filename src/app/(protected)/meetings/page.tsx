'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Ensure this import is correct
import { Trash2 } from 'lucide-react'; // Ensure this import is correct
import MeetingCard from '../dashboard/meeting-card';
import useProjects from '@/hooks/use-projects';
import { api } from '@/trpc/react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

function MeetingPage() {
  const { projectId } = useProjects();
  const router = useRouter();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    { refetchInterval: 4000 }
  );
  
  const refetch = useRefetch();

  useEffect(() => {
    if (!projectId) {
      router.push('/create');
    }
  }, [projectId, router]);

  useEffect(() => {
    refetch();
  }, []);

  const deleteMeeting = api.project.deleteMeeting.useMutation({
    onSuccess: () => {
      toast.success("Meeting deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Meeting deletion failed");
    },
  });

  const handleDelete = (meetingId: string) => {
    deleteMeeting.mutate({ meetingId });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <MeetingCard />

      <h1 className="text-2xl font-bold mt-10 mb-4">Meetings</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : meetings?.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No meetings found for this project.</div>
      ) : (
        <ul className="space-y-4">
          {meetings?.map((meeting) => (
            <li key={meeting.id}>
              <div className="flex justify-between items-center bg-white dark:bg-zinc-800 rounded-xl shadow-sm border p-4 hover:shadow-md transition">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                    {meeting.name}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {new Date(meeting.createdAt).toLocaleDateString()} — {new Date(meeting.createdAt).toLocaleTimeString()}
                  </p>
                  {meeting.status === 'PROCESSING' && (
                    <Badge className="text-xs mt-1 bg-yellow-200 text-yellow-800 animate-pulse">
                      Processing
                    </Badge>
                  )}
                  {meeting.status === 'COMPLETED' && (
                    <Badge className="text-xs mt-1 bg-green-200 text-green-800 animate-bounce">
                      Completed
                    </Badge>
                  )}
                  {meeting.status !== 'PROCESSING' && meeting.status !== 'COMPLETED' && (
                    <Badge className="text-xs mt-1 bg-red-200 text-red-800">
                      {meeting.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button variant="outline">
                      View Meeting
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={() => handleDelete(meeting.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MeetingPage;