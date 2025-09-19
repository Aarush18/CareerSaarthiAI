
import { agentsRouter } from '@/modules/agents/server/procedures';
import { quizRouter } from './quiz';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  quiz: quizRouter,
});

export type AppRouter = typeof appRouter;