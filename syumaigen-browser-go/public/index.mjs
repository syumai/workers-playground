import handlers from "./build/worker.mjs";

const appForm = document.getElementById("app");
const avatar = document.getElementById("avatar");

appForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const req = new Request("/generate");
  const res = await handlers.fetch(req);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  avatar.src = url;
});
