import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
        },
      });

      if (!ctx.user.userId) {
        throw new Error("User not found");
      }

      await ctx.db.userToProject.create({
        data: {
          userId: ctx.user.userId,
          projectId: project.id,
        },
      });

      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      
      await pollCommits(project.id);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
        select: {
          id: true,
          commitHash: true,
          commitMessage: true,
          commitAuthor: true,
          commitAuthorAvatarUrl: true,
          commitDate: true,
          summary: true,
        },
        orderBy: {
          commitDate: "desc",
        },
      });
    }),
});