// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { documentsRouter } from "./documents";
import { suggestionsRouter } from "./suggestions";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("documents.", documentsRouter)
  .merge("suggestions.", suggestionsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
