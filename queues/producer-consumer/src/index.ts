import { Hono } from "hono";

type KV = Env["KV"];

const getCount = async (kv: KV): Promise<number> => {
  const countStr = await kv.get("count");
  const count = Number(countStr);
  return Number.isNaN(count) ? 0 : count;
};

const increment = async (kv: KV): Promise<void> => {
  const count = await getCount(kv);
  const nextCount = count + 1;
  await kv.put("count", String(nextCount));
};

const decrement = async (kv: KV): Promise<void> => {
  const count = await getCount(kv);
  const nextCount = count - 1;
  await kv.put("count", String(nextCount));
};

const app = new Hono<{
  Bindings: Env;
}>();

app.post("/increment", async (c) => {
  await c.env.QUEUE.send({ type: "increment" });
  return c.text("increment called");
});

app.post("/decrement", async (c) => {
  await c.env.QUEUE.send({ type: "decrement" });
  return c.text("decrement called");
});

app.get("/count", async (c) => {
  const count = await getCount(c.env.KV);
  return c.json({ count });
});

export default {
  fetch: app.fetch,
  async queue(batch, env) {
    for (const msg of batch.messages) {
      switch (msg.body.type) {
        case "increment": {
          await increment(env.KV);
          break;
        }
        case "decrement": {
          await decrement(env.KV);
          break;
        }
      }
    }
  },
} satisfies ExportedHandler<Env, Parameters<Env["QUEUE"]["send"]>[0]>;
