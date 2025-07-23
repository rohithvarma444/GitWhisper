import {Redis} from 'ioredis'
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const url = process.env.NEXT_PUBLIC_REDIS_URL;

if (!url) {
    console.error("Error: REDIS_URL environment variable not found");
    console.log("Current REDIS_URL value:", url);
}


export const redisConnection = new Redis(url || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    lazyConnect: true,
    tls: url?.startsWith('rediss://') ? {} : undefined,
});


redisConnection.on('connect', ()=> {
    console.log("Redis Connected Successfully");
})

redisConnection.on('error', (err)=> {
    console.log("Redis connection error",err);
})

redisConnection.on('ready', () => {
    console.log('Redis is ready');
  });

export default redisConnection;

  