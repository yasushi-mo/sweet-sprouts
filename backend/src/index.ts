import express, { Request, Response } from "express";
import prisma from "@/libs/prisma";
import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  ErrorResponse,
  GetUserRequestParams,
  GetUserResponse,
  PostAuthRegisterRequest,
  PostAuthRegisterResponse,
} from "@/types";
import { SALT_ROUNDS } from "@/constants";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// [Authentication] ユーザー認証とセッション管理
// 新規ユーザー登録API
app.post(
  "/auth/register",
  async (
    req: Request<{}, {}, PostAuthRegisterRequest>,
    res: Response<PostAuthRegisterResponse | ErrorResponse>
  ) => {
    const { email, password, name } = req.body;

    try {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      const { passwordHash: _, ...userWithoutPasswordHash } = newUser;
      res.status(201).json(userWithoutPasswordHash);
    } catch (error) {
      // Prismaの一意制約違反エラーコードをチェック
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // 重複したメールアドレスの場合は409 Conflictを返す
        return res.status(409).json({ message: "Email already exists" });
      }
      console.error(error);
      // その他のエラーの場合は500 Internal Server Errorを返す
      res.status(500).json({ message: "Failed to create user" });
    }
  }
);

// ユーザーログインAPI

// [Users] ユーザー情報管理
// 特定ユーザー情報取得API
app.get(
  "/users/:id",
  async (
    req: Request<GetUserRequestParams>,
    res: Response<GetUserResponse | ErrorResponse>
  ) => {
    const { id } = req.params;

    try {
      const user: User | null = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }
);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

export default app;
