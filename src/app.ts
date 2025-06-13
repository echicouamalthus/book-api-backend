import { Hono } from "hono";
import { cors } from "hono/cors";
import env from "./env";

const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "http://localhost:9999/api", // Replace with your frontend's origin
    allowMethods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
    allowHeaders: ["Content-Type", "Authorization", "Cookie"], // Allow specific headers
  })
);

app.get("/", (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" });
});

export default app;
