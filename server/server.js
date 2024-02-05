import express from "express";
import cors from "cors";

import taskRoutes from "./routes/tasks.js";

const app = express();

app.use(express.json());

const CLIENT_URL =
  process.env.NODE_ENV === "production"
    ? "https://to-do-client-8t9m.onrender.com"
    : "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("./public"));
app.use("/scripts", express.static("./public/scripts"));

app.get("/", (req, res) => {
  res.redirect(CLIENT_URL);
});

app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
