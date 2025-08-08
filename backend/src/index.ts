import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { GetUserRequestParams, GetUserResponse } from "./types";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Users ユーザー情報管理
app.post("/users", async (req, res) => {
  const { email, passwordHash, name } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// 特定ユーザー情報取得
app.get(
  "/users/:id",
  async (
    req: Request<GetUserRequestParams>,
    res: Response<GetUserResponse>
  ) => {
    const { id } = req.params;

    try {
      const user: User | null = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

export default app;
