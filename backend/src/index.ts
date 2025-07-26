import express from "express";

const app = express();
const port = process.env.PORT || 300;

app.use(express.json()); // Enable JSON body parsing

app.get("/", (req, res) => {
  res.send("Hello from Sweet Sprouts Backend!");
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
