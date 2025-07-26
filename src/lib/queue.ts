import { Queue } from 'bullmq';
import { redisConnection } from './redis';

// QUEUE 1: GitHub Repository File Loading
// Purpose: Fetch all files from GitHub repository
export const githubFileQueue = new Queue('github-files', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,  // Keep last 10 completed jobs
    removeOnFail: 20,      // Keep last 20 failed jobs for debugging
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay, then 4s, 8s, etc.
    },
  },
});

// QUEUE 2: Commit Polling and Summary Generation
// Purpose: Poll latest commits and generate AI summaries
export const commitPollingQueue = new Queue('commit-polling', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 10,
    attempts: 2,           // Fewer retries for commit polling
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// QUEUE 3: Gemini Summary Processing
// Purpose: Generate AI summaries for code files (Rate Limited)
export const geminiSummaryQueue = new Queue('gemini-summary', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,         // 5 second delay for Gemini rate limits
    },
  },
});

// QUEUE 4: Gemini Embedding Processing
// Purpose: Generate embeddings for code summaries
export const geminiEmbeddingQueue = new Queue('gemini-embedding', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// QUEUE 5: Job Completion Monitoring
// Purpose: Monitor when indexing jobs are complete and trigger emails
export const completionMonitorQueue = new Queue('completion-monitor', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// QUEUE 6: Email Processing
// Purpose: Send queued email notifications
export const emailProcessingQueue = new Queue('email-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

githubFileQueue.on('error', (error) => {
  console.error('❌ GitHub file queue error:', error);
});

commitPollingQueue.on('error', (error) => {
  console.error('❌ Commit polling queue error:', error);
});

geminiSummaryQueue.on('error', (error) => {
  console.error('❌ Gemini summary queue error:', error);
});

geminiEmbeddingQueue.on('error', (error) => {
  console.error('❌ Gemini embedding queue error:', error);
});

setInterval(async () => {
  await emailProcessingQueue.add('process-emails', {}, {
    delay: 0,
  });
}, 2 * 60 * 1000);

export default {
  githubFileQueue,
  commitPollingQueue,
  geminiSummaryQueue,
  geminiEmbeddingQueue,
  completionMonitorQueue,
  emailProcessingQueue,
};
