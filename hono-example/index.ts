import { Hono } from "hono";

interface Env {
  COUNTER: KVNamespace;
}

const app = new Hono<Env>();
app.get("/", async (c) => {
  const count = Number(await c.env.COUNTER.get("count"));
  const newCount = (count + 1).toString();
  await c.env.COUNTER.put("count", newCount);
  return c.text(newCount);
});

export default app;
