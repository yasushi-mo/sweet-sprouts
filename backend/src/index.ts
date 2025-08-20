import express, { Request, Response } from "express";
import prisma from "@/libs/prisma";
import authRouter from "@/routers/auth";
import { User } from "@prisma/client";
import { ErrorResponse } from "@/types";
import { GetUserRequestParams, GetUserResponse } from "@/types/users";
import { authMiddleware } from "@/middlewares/authMiddleware";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 各ルーターを読み込む
app.use("/auth", authRouter);

// [Users] ユーザー情報管理
// 特定ユーザー情報取得API
app.get(
  "/users/:id",
  authMiddleware,
  async (
    req: Request<GetUserRequestParams>,
    res: Response<GetUserResponse | ErrorResponse>
  ) => {
    const { id: requestedId } = req.params;

    try {
      /** リクエストされたユーザーの情報 */
      const requestedUser: User | null = await prisma.user.findUnique({
        where: { id: requestedId },
      });

      if (!requestedUser)
        return res.status(404).json({ message: "User not found" });

      /** ミドルウェアで付与された req.user.id （リクエストをしたユーザーのID） */
      const authenticatedUserId = req.user.id;
      const authenticatedUser: User | null = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
      });

      if (!authenticatedUser)
        return res.status(404).json({ message: "User not found" });

      // 認可チェック
      if (
        authenticatedUser.id !== requestedId &&
        authenticatedUser.role !== "ADMIN"
      )
        return res.status(403).json({
          message: "Access to this resource is denied",
        });

      // レスポンスからpasswordHashを除外
      const { passwordHash: _, ...userWithoutPasswordHash } = requestedUser;

      return res.status(200).json(userWithoutPasswordHash);
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
