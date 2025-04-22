"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle, Tag, Users } from "lucide-react";
import useProjects from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



function IssuePage() {
  const { userId } = useAuth();
  const params = useParams();
  const meetingId = params?.meetingId as string;
  const { projectId } = useProjects();
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: issues, isLoading, refetch } = api.project.getIssues.useQuery(
    { meetingId, projectId, userId: userId || "" },
    { enabled: !!meetingId && !!projectId && !!userId }
  );

  useEffect(() => {
    refetch();
  }, [meetingId, refetch]);

  // Filter issues based on search
  const filteredIssues = issues?.filter((issue) => {
    const matchesSearch = searchTerm === "" || 
      issue.headline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Meeting Minutes</h1>
          <p className="text-muted-foreground mt-1">
            Extracted {issues?.length || 0} key discussion points from your uploaded meeting
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search issues..."
              className="w-full rounded-md border border-input px-4 py-2 pl-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-3 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredIssues?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-muted/10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No issues found</h3>
          <p className="text-center text-muted-foreground max-w-md">
            {searchTerm ? "No issues match your search criteria." : "There are no issues for this meeting yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues?.map((issue: any, i) => (
            <Dialog key={issue.id}>
              <DialogTrigger asChild>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {issue.headline}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {issue.summary}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {issue.start} → {issue.end}
                        </span>
                      </div>
                      
                      {issue.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={issue.assignee.imageUrl} />
                          <AvatarFallback>{issue.assignee.initials}</AvatarFallback>
                        </Avatar>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedIssue?.headline}</DialogTitle>
                </DialogHeader>
                
                <div className="flex items-center mb-4">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Discussion Time</div>
                    <div>{selectedIssue?.start} → {selectedIssue?.end}</div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-muted/10">
                  <h3 className="text-sm font-medium mb-2">Summary</h3>
                  <p className="whitespace-pre-wrap text-sm">{selectedIssue?.summary}</p>
                </div>
                
                {selectedIssue?.assignee && (
                  <div className="flex items-center mt-4">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="text-sm">
                      <div className="text-muted-foreground">Assignee</div>
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage src={selectedIssue?.assignee.imageUrl} />
                          <AvatarFallback>{selectedIssue?.assignee.initials}</AvatarFallback>
                        </Avatar>
                        {selectedIssue?.assignee.name}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedIssue?.tags && selectedIssue.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {selectedIssue.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuePage;