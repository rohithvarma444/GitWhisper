"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Loader2, Github, AlertCircle, ArrowRight, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>();
  const refetch = useRefetch();

  const createProject = api.project.createProject.useMutation();

  const [isLoading, setIsLoading] = React.useState(false);
  const [indexingStage, setIndexingStage] = React.useState<string | null>(null);

  const onSubmit = (data: FormInput) => {
    setIsLoading(true);
    setIndexingStage("initializing");
    
    // Simulate different indexing stages
    const stages = ["initializing", "fetching", "processing", "finalizing"];
    let currentStage = 0;
    
    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        // Fix: Add nullish coalescing operator to handle potential undefined
        setIndexingStage(stages[currentStage] ?? null);
      } else {
        clearInterval(interval);
      }
    }, 2000);
    
    createProject.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken ? data.githubToken : "",
    }, {
        onSuccess: () => {
            clearInterval(interval);
            toast.success('Project created successfully');
            refetch();
            setIsLoading(false);
            setIndexingStage(null);
        },
        onError: () => {
            clearInterval(interval);
            toast.error('Indexing failed. Please try again later.');
            setIsLoading(false);
            setIndexingStage(null);
        }
    });
    reset();
  };

  const getStageMessage = () => {
    switch(indexingStage) {
      case "initializing": return "Initializing repository indexing...";
      case "fetching": return "Fetching repository data...";
      case "processing": return "Processing code structure...";
      case "finalizing": return "Finalizing project setup...";
      default: return "Preparing to index repository...";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Left Section - Illustration and Info */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              GitWhisper Free Tier
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Connect Your Repository</h1>
            <p className="text-muted-foreground text-lg">
              Link your GitHub repository to GitWhisper and start exploring your codebase with AI assistance.
            </p>
          </div>
          
          <div className="relative aspect-video w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg -z-10"></div>
            <img src="/create.svg" alt="Repository connection" className="w-full h-full object-contain p-8" />
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Free Tier Limitations</AlertTitle>
            <AlertDescription>
              GitWhisper is currently running on a free API tier. Indexing may occasionally fail due to rate limits.
              If indexing fails, please wait a few minutes and try again.
            </AlertDescription>
          </Alert>
        </div>
        
        {/* Right Section - Form */}
        <Card className="w-full lg:w-1/2 shadow-lg border-border/60">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Enter your repository details to get started with GitWhisper
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading && (
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <h3 className="font-medium text-primary">{getStageMessage()}</h3>
                </div>
                <div className="w-full bg-background rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: indexingStage === "initializing" ? "25%" : 
                             indexingStage === "fetching" ? "50%" : 
                             indexingStage === "processing" ? "75%" : 
                             indexingStage === "finalizing" ? "90%" : "10%" 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This process may take a few minutes. Please don't close this window.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    className="pl-10"
                    {...register("repoUrl", { required: "Repository URL is required" })}
                  />
                </div>
                {errors.repoUrl && (
                  <p className="text-destructive text-xs mt-1">{errors.repoUrl.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name <span className="text-destructive">*</span></Label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="My Awesome Project"
                  {...register("projectName", { required: "Project name is required" })}
                />
                {errors.projectName && (
                  <p className="text-destructive text-xs mt-1">{errors.projectName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="githubToken">GitHub Token</Label>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </div>
                <Input
                  id="githubToken"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  {...register("githubToken")}
                />
                <p className="text-xs text-muted-foreground">
                  For private repositories, provide a GitHub token with repo access.
                </p>
              </div>
            
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Project
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 border-t pt-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                If indexing fails, you can still explore previously indexed repositories. 
                We're continuously improving our infrastructure to provide better service.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CreatePage;
// Line 138 and 215: Replace ' with &apos;
// Example:
// Change: Don't worry
// To: Don&apos;t worry