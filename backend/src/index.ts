import express from "express";
import authRouter from "@/routers/auth";
import usersRouter from "@/routers/users";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 各ルーターを読み込む
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

export default app;
