import { z } from "zod";
import { getTranscription } from "@/lib/assembly";
import { db } from "@/server/db";

const bodyParser = z.object({
  projectId: z.string(),
  meetingUrl: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, meetingUrl, meetingId } = bodyParser.parse(body);

    const { summaries } = await getTranscription(meetingUrl);

    await db.issue.createMany({
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

    await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: summaries[0]?.headline,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error processing meeting:", error);
    // Handle error
  }
}