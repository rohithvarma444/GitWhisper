import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { deleteMeetingAudio } from "@/lib/cloudinary";

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
      if (!ctx.user.userId) {
        throw new Error("User not found");
      }

      const project = await ctx.db.$transaction(async (tx) => {
        const createdProject = await tx.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
          },
        });

        await tx.userToProject.create({
          data: {
            userId: ctx.user.userId,
            projectId: createdProject.id,
          },
        });

        return createdProject;
      });

      try {
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id);
        return project;
      } catch (error) {
        await ctx.db.userToProject.deleteMany({
          where: {
            projectId: project.id,
          },
        });

        await ctx.db.project.delete({
          where: {
            id: project.id,
          },
        });

        throw new Error("Failed to index or poll commits: " + error);
      }
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

    saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileReferences: z.any(),
        answer: z.string(),
        question: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.question.findFirst({
        where: {
          question: input.question,
          projectId: input.projectId,
          userId: ctx.user.userId!,
        },
      });
  
      if (existing) {
        throw new Error("Question already saved.");
      }
  
      return ctx.db.question.create({
        data: {
          answer: input.answer,
          fileReferences: input.fileReferences,
          question: input.question,
          projectId: input.projectId,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQuestions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          projectId: input.projectId,
          name: input.name,
          status: "PROCESSING",
        },
      });
    }),

  getMeetings: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),

  deleteMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meetingUrl = await ctx.db.meeting.findUnique({
        where: {
          id: input.meetingId,
        },
      });

      if (meetingUrl?.meetingUrl) {
        await deleteMeetingAudio(meetingUrl.meetingUrl);
      }

      await ctx.db.meeting.delete({
        where: {
          id: input.meetingId,
        },
      });

      return true;
    }),

  deleteProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return true;
    }),

  getTeamMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),
    getMyCredits: protectedProcedure.input(z.object({ userId: z.string()})).query(async ({ ctx, input }) => {
      return await ctx.db.user.findFirst({
        where:{
          id: input.userId
        },
        select:{
          credits: true
        }
      })
    }),
    getTransactions: protectedProcedure.input(z.object({ userId: z.string()})).query(async ({ ctx, input }) => {
      return await ctx.db.billing.findMany({
        where:{
          userId: input.userId
        },
        orderBy:{
          createdAt: 'desc'
        }
      })
    }),
    addCredits: protectedProcedure.input(z.object({ userId: z.string(), credits: z.number()})).mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where:{
          id: input.userId
        },
        data:{
          credits: {
            increment: input.credits
          }
        }
      })
    }),
    deductCredits: protectedProcedure.input(z.object({ userId: z.string(), credits: z.number()})).mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where:{
          id: input.userId
        },
        data:{
          credits: {
            decrement: input.credits
          }
        }
      })
    }
  )

});