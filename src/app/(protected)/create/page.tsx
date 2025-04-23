"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { projectRouter } from '@/server/api/routers/project';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Loader2 } from "lucide-react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const refetch = useRefetch();

  const createProject = api.project.createProject.useMutation();

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: FormInput) => {
    setIsLoading(true);
    createProject.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken ? data.githubToken : "",
    }, {
        onSuccess: () => {
            toast.success('Project created successfully');
            refetch();
            setIsLoading(false);
        },

        onError: () => {
            toast.error('Indexing failed. We are on a free tier, please try again later. Meanwhile, explore our indexed repos.');
            setIsLoading(false);
        }
    });
    reset()
  };

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      {/* Image Section */}
      <img src="/create.svg" alt="create" className="h-60 w-auto" />

      {/* Form Section */}
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold">Link to your Github Repository</h1>
        <p className="mb-4 text-gray-600">
          Enter the URL for your repository to link it to GitWhisper.
        </p>

        {isLoading && (
          <div className="mb-4 flex flex-col items-center text-blue-500 text-sm">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
            Indexing your repository... This may take a moment. We’re running on a free tier. If it fails, please try again later. You can still explore already indexed repositories!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Repo URL */}
          <div>
            <label className="block text-sm font-medium">Repository URL</label>
            <input
              type="url"
              {...register("repoUrl", { required: "Repository URL is required" })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/your-repo"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium">Project Name</label>
            <input
              type="text"
              {...register("projectName", { required: "Project Name is required" })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* GitHub Token (Optional) */}
          <div>
            <label className="block text-sm font-medium">GitHub Token (Optional)</label>
            <input
              type="password"
              {...register("githubToken")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter GitHub token"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createProject.isPending}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary:100 transition"
          >
            Link Repository
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;