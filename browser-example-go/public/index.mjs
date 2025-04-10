import handlers from "./build/worker.mjs";

const appForm = document.getElementById("app");
const resultContainer = document.getElementById("result");

const paths = {
  hello: "/hello",
  echo: "/echo",
};

const methods = {
  hello: "GET",
  echo: "POST",
};

appForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const path = formData.get("path");
  const message = formData.get("message");
  const name = formData.get("name");

  let url = paths[path];
  if (path === "hello") {
    url = `${url}?name=${encodeURIComponent(name)}`;
  }

  const req = new Request(url, {
    method: methods[path],
    body: path === "echo" ? message : undefined,
  });
  const res = await handlers.fetch(req);
  const text = await res.text();

  resultContainer.textContent = text;
});
