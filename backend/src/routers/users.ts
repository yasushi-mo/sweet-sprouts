// [Users] ユーザー情報管理
import prisma from "@/libs/prisma";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { ErrorResponse } from "@/types";
import { GetUserRequestParams, GetUserResponse } from "@/types/users";
import { User } from "@prisma/client";
import express, { Request, Response } from "express";

const router = express.Router();

// 特定ユーザー情報取得API
router.get(
  "/:id",
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

export default router;
