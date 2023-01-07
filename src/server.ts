import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { z } from "zod";

const t = initTRPC.context().create({
  errorFormatter: ({ shape }) => {
    return {
      ...shape,
      data: { ...shape.data, someAdditionalErrorInfo: "hello world" },
    };
  },
});

const router = t.router;
const publicProcedure = t.procedure;

// --------- create procedures etc

let id = 0;

const db = {
  posts: [
    {
      id: ++id,
      title: "hello",
    },
  ],
};

const postRouter = router({
  createPost: t.procedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ input }) => {
      const post = {
        id: ++id,
        ...input,
      };
      db.posts.push(post);
      return post;
    }),
  listPosts: publicProcedure.query(() => db.posts),
});

// root router to call
const appRouter = router({
  // merge predefined routers
  post: postRouter,
});

export type AppRouter = typeof appRouter;

async function main() {
  // express implementation
  const app = express();

  app.use((req, _res, next) => {
    // request logger
    console.log("⬅️ ", req.method, req.path, req.body ?? req.query);

    next();
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    })
  );
  app.get("/", (_req, res) => res.send("hello"));
  app.listen(2021, () => {
    console.log("listening on port 2021");
  });
}

main();
