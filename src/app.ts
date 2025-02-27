import express from "express";

const app = express();

//Routes
//HTTP methods: get post patch delete put
app.get("/", (req, res, next) => {
  res.json({ message: "welcome to api" });
});

export default app;
