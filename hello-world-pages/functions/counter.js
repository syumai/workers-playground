export async function onRequest(context) {
  // KVの "count" キーの値を取得する
  const value = await context.env.KV.get("count");
  // "count" キーの値を数値に変換する。数値に変換できなければ、値を0とする
  const currentCount = Number.isNaN(Number(value)) ? 0 : Number(value);
  // カウントを1加算する
  const count = currentCount + 1;
  // カウントの加算結果をKVに保存する
  await context.env.KV.put("count", count);
  // カウントの加算結果を "count" キーに設定したJSONレスポンスを返す
  return Response.json({ count: count });
}
