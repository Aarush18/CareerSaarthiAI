
import { agentsRouter } from '@/modules/agents/server/procedures';
import { quizRouter } from './quiz';
import { createTRPCRouter } from '../init';
import { meetingsRouter } from '@/modules/meetings/server/procedures';

export const appRouter = createTRPCRouter({
    
  agents : agentsRouter,
  meetings: meetingsRouter,
  quiz : quizRouter

});

export type AppRouter = typeof appRouter;