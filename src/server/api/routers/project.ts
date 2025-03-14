import { db } from "@/server/db";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

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

      if(!ctx.user.userId){
        throw new Error('User not found');
      }
      await ctx.db.userToProject.create({
        data: {
          userId: ctx.user.userId,
          projectId: project.id, // ✅ Ensure project exists before linking
        },
      });

      return project;
    }),


    getProjects : protectedProcedure.query(async({ctx}) => {
      return ctx.db.project.findMany({
        where: {
          UserToProject:{
            some:{
              userId: ctx.user.userId!
            }
          },
          deletedAt: null
        }
      })
    })
});