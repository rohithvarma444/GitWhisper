import { z } from "zod";
import { getTranscription } from "@/lib/assembly";
import { db } from "@/server/db";

const bodyParser = z.object({
  projectId: z.string(),
  meetingUrl: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300; // 5 minutes

export const uploadMeetingAudio = async (
  file: File,
  projectId: string,
  meetingId: string,
  setProgress?: (progress: number) => void
): Promise<string> => {
  // logic to upload the audio file and resolve the URL
  const url = await uploadFile(file, setProgress); // assuming this function exists

  await fetch('/api/process-meeting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      meetingUrl: url,
      meetingId,
    }),
  });

  return url;
};

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