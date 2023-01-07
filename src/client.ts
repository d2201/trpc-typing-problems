import {
  createTRPCProxyClient,
  httpBatchLink,
  TRPCClientError,
} from "@trpc/client";
import AbortController from "abort-controller";
import fetch from "node-fetch";
import type { AppRouter } from "./server";

// polyfill
const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch as any;

async function main() {
  const url = `http://localhost:2021/trpc`;

  const trpc = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url })],
  });

  // Query typing problem with errors
  try {
    await trpc.post.listPosts.query();
  } catch (err) {
    if (err instanceof TRPCClientError) {
      console.log(err.data.someAdditionalErrorInfo); // this is any in VS Code
    }
  }

  await trpc.post.createPost.mutate({ title: "x", content: "x" });

  console.log("👌 should be a clean exit if everything is working right");
}

main();
