"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { projectRouter } from '@/server/api/routers/project';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const refetch = useRefetch();

  const createProject = api.project.createProject.useMutation();

  const onSubmit = (data: FormInput) => {
    createProject.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken ? data.githubToken : "",
    }, {
        onSuccess: () => {
            toast.success('Project created successfully')
            refetch()
        },

        onError: () => {
            toast.error('Error in creating project')
        }
    })
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