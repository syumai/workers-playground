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

  const cache = caches.default;
  const cachedRes = await cache.match(req.url);
  if (cachedRes) {
    const etag = req.headers.get("If-None-Match");
    if (etag !== null && etag === cachedRes.headers.get("ETag")) {
      return new Response(null, {
        status: 304,
        headers: cachedRes.headers,
      });
    }
    return cachedRes;
  }

  const url = new URL(req.url);
  const imgPath = url.pathname.slice(1);
  const imgObj = await BUCKET.get(imgPath);

  if (imgObj === null) {
    return new Response("Not found", {
      status: 404,
    });
  }
  const res = new Response(imgObj.body, {
    headers: {
      "Cache-Control": "public, max-age=14400",
      ETag: `W/${imgObj.httpEtag}`,
      "Content-Type":
        imgObj.httpMetadata.contentType ?? "application/octet-stream",
    },
  });
  event.waitUntil(cache.put(req.url, res.clone()));

  return res;
}

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
