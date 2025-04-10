async function initialize() {
  try {
    const registration = await navigator.serviceWorker.register("sw.mjs", {
      scope: "./",
      type: "module",
    });

    const serviceWorker =
      registration.installing || registration.waiting || registration.active;
    if (serviceWorker === null) {
      throw new Error("Service worker is not supported on this browser.");
    }

    if (serviceWorker.state !== "activated") {
      await new Promise((resolve) => {
        serviceWorker.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") {
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error(error);
  }

  const url = "./query";
  const subscriptionUrl = "./query";
  const fetcherHeaders = undefined;
  const uiHeaders = undefined;

  const fetcher = GraphiQL.createFetcher({
    url,
    subscriptionUrl,
    headers: fetcherHeaders,
  });

  ReactDOM.render(
    React.createElement(GraphiQL, {
      fetcher: fetcher,
      isHeadersEditorEnabled: true,
      shouldPersistHeaders: true,
      headers: JSON.stringify(uiHeaders, null, 2),
    }),
    document.getElementById("graphiql")
  );
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  initialize();
});
