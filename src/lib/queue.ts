import { Queue, Worker } from 'bullmq';
import {redisConnection} from './redis';

export const fileIndexingQueue = new Queue('file-indexing', {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 20,
        attempts: 3,
        backoff:{
            type: 'exponential',
            delay: 2000,
        }
    },
});

