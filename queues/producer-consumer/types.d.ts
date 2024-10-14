type CounterMessage =
  | {
      type: "increment";
    }
  | {
      type: "decrement";
    };

interface Env {
  KV: KVNamespace;
  QUEUE: Queue<CounterMessage>;
}
