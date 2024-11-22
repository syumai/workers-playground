export default {
  async fetch(request, env): Promise<Response> {
    const paths = ['example1.txt', 'example2.txt'];
    const [example1, example2] = await Promise.all(
      paths.map(async (path) => {
        const url = new URL(request.url);
        url.pathname = path;
        return (await env.ASSETS.fetch(url)).text();
      })
    );
    return Response.json({ example1, example2 });
  },
} satisfies ExportedHandler<Env>;
