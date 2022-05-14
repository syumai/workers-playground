export {};

async function handleRequest(event: FetchEvent): Promise<Response> {
  const req = event.request;
  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        Allow: "GET",
      },
    });
  }

  const url = new URL(req.url);
  const imgPath = url.pathname.slice(1);

  const cache = caches.default;
  const cachedRes = await cache.match(req.url);
  if (cachedRes) {
    return cachedRes;
  }
  const imgObj = await BUCKET.get(imgPath);

  let res: Response;
  if (imgObj === null) {
    res = new Response("Not found", {
      status: 404,
    });
  } else {
    res = new Response(imgObj.body, {
      headers: {
        "Cache-Control": "public, max-age=14400",
        Expires: "",
        "Content-Type":
          imgObj.httpMetadata.contentType ?? "application/octet-stream",
      },
    });
  }
  event.waitUntil(cache.put(req.url, res.clone()));

  return res;
}

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
