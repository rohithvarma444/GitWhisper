import {AssemblyAI} from 'assemblyai';

function msToTime(ms: number){
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${minutes}:${seconds}`;
}

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI_API_KEY!,
});


export const getTranscription = async (audioUrl: string) => {
    try {
        const transcript = await client.transcripts.transcribe({
            audio_url: audioUrl,
            auto_chapters: true,
        });

        const summaries = transcript.chapters?.map((chapter) => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            summary: chapter.summary,
            gist: chapter.gist,
            headline: chapter.headline,
        })) || [];

        if(!transcript || !transcript.text) {
            throw new Error('Transcription failed');
        }
         return {
            transcript,summaries
         }

    } catch (error) {
        console.error('Error creating transcription:', error);
        throw error;
    }
}