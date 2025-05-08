'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; 
import { Trash2, FileAudio, Clock, Calendar, ArrowUpRight, Plus, Search, Filter, SortAsc } from 'lucide-react'; 
import MeetingCard from '../dashboard/meeting-card';
import useProjects from '@/hooks/use-projects';
import { api } from '@/trpc/react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Line 37: Add refetch to the dependency array
  useEffect(() => {
    refetch();
  }, [refetch]); // Add refetch here

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-10 space-y-2">
        <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
          GitWhisper Meeting Minutes
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Meetings</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Upload meeting recordings and get AI-generated summaries and action items.
        </p>
      </div>
      
      {/* Upload Meeting Card */}
      <Card className="shadow-md border-border/60 mb-10 overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-primary" />
            Upload Meeting Recording
          </CardTitle>
          <CardDescription>
            Upload an audio file to generate meeting minutes and action items
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <MeetingCard />
        </CardContent>
      </Card>

      {/* Meetings List Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meeting History</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search meetings..." 
              className="pl-9 w-[200px] h-9"
            />
          </div>
          
          <Tabs defaultValue="all" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border-border/60">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : meetings?.length === 0 ? (
        <Card className="shadow-md border-border/60 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/30 p-3 mb-4">
              <FileAudio className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No meetings found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Upload your first meeting recording to generate AI-powered meeting minutes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings?.map((meeting) => {
            const meetingDate = new Date(meeting.createdAt);
            return (
              <Card 
                key={meeting.id} 
                className="shadow-md border-border/60 hover:shadow-lg transition-all overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{meeting.name}</h3>
                        {meeting.status === 'PROCESSING' && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 animate-pulse">
                            Processing
                          </Badge>
                        )}
                        {meeting.status === 'COMPLETED' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Completed
                          </Badge>
                        )}
                        {meeting.status !== 'PROCESSING' && meeting.status !== 'COMPLETED' && (
                          <Badge variant="destructive">
                            {meeting.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(meetingDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(meetingDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link href={`/meetings/${meeting.id}`}>
                        <Button variant="outline" className="gap-1">
                          View Minutes
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(meeting.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Info Alert */}
      <Alert className="mt-10 bg-muted/30 border-primary/20">
        <div className="flex items-start gap-2">
          <FileAudio className="h-4 w-4 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">About Meeting Minutes</h4>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              GitWhisper automatically processes your meeting recordings to extract key discussion points, 
              decisions, and action items. Processing typically takes 5-10 minutes depending on the length 
              of your recording. Currently supports MP3, WAV, and M4A formats up to 100MB.
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}

export default MeetingPage;