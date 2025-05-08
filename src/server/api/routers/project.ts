import {  createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { getTranscription } from "@/lib/assembly";

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
      try {
        console.log("Attempting to delete meeting:", input.meetingId);

        const meeting = await ctx.db.meeting.findUnique({
          where: {
            id: input.meetingId,
          },
        });

        if (!meeting) {
          throw new Error("Meeting not found");
        }

        console.log("Found meeting:", meeting.id);

        
        await ctx.db.issue.deleteMany({
          where: {
            meetingId: meeting.id,
          },
        });

        console.log("Deleting meeting from database...");
        await ctx.db.meeting.delete({
          where: {
            id: input.meetingId,
          },
        });

        console.log("Meeting deleted successfully.");
        return true;
      } catch (error) {
        console.error("Error deleting meeting:", error);
        throw new Error("Failed to delete meeting. Please try again.");
      }
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
  ),

  processMeetingTranscription: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        projectId: z.string(),
        meetingUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { meetingId, projectId, meetingUrl } = input;
      console.log("mid: " ,meetingId, "pid: ",projectId, "murl: ",meetingUrl)
      console.log('---------------------- log -----------------------');
      console.log('Processing meeting transcription:', { meetingId, projectId, meetingUrl });

      const { summaries } = await getTranscription(meetingUrl);

      console.log('---------------------- log -----------------------');
      console.log('Transcription summaries:', summaries);

      if (!summaries || !Array.isArray(summaries)) {
        throw new Error('Invalid transcription data');
      }

      console.log('---------------------- log -----------------------');
      console.log('Inserting summaries into DB:', summaries.length);

      await ctx.db.issue.createMany({
        data: summaries.map((summary) => ({
          projectId,
          meetingId,
          start: summary.start,
          end: summary.end,
          summary: summary.summary,
          gist: summary.gist,
          headline: summary.headline,
        })),
      });

      console.log('---------------------- log -----------------------');
      console.log('Updating meeting status to COMPLETED:', meetingId);

      await ctx.db.meeting.update({
        where: { id: meetingId },
        data: {
          status: "COMPLETED",
          name: summaries.length > 0 ? summaries[0]?.headline : "Meeting",
        },
      });

      return { success: true };
    }),

    getIssues: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        projectId: z.string(),
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      console.log('Fetching issues for meeting:', input.meetingId, 'Project:', input.projectId, 'User:', input.userId);
      const isValid = await ctx.db.userToProject.findFirst({
        where:{
          projectId: input.projectId,
          userId: input.userId,
        }
      })

      if (!isValid) {
        console.warn("Access denied: User is not part of the project", input.userId, input.projectId);
        throw new Error("Unauthorized: You are not a member of this project");
      }

      const issues = await ctx.db.issue.findMany({
        where:{
          meetingId: input.meetingId
        }
      });

      console.log('Fetched issues:', issues.length);
      return issues;
    }),
    refreshCommits: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await pollCommits(input.projectId);
          return { 
            success: true, 
            newCommitsCount: result.added,
            message: result.added > 0 
              ? `Successfully added ${result.added} new commits` 
              : "No new commits found"
          };
        } catch (error) {
          console.error("Failed to refresh commits:", error);
          throw new Error("Failed to refresh commits: " + error);
        }
      }),
});