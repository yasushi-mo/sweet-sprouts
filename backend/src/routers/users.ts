// [Users] ユーザー情報管理
import prisma from "@/libs/prisma";
import { jwtAuthenticationMiddleware } from "@/middlewares/auth";
import { ErrorResponse } from "@/types";
import {
  GetUserRequestParams,
  GetUserResponse,
  PutUserRequestBody,
  PutUserResponse,
} from "@/types/users";
import { Prisma, User } from "@prisma/client";
import express, { Request, Response } from "express";

const router = express.Router();

// 特定ユーザー情報取得API
router.get(
  "/:id",
  jwtAuthenticationMiddleware,
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

// 特定ユーザー情報更新API
router.put(
  "/:id",
  jwtAuthenticationMiddleware,
  async (
    req: Request<GetUserRequestParams, {}, PutUserRequestBody>,
    res: Response<PutUserResponse | ErrorResponse>
  ) => {
    const { id: requestedId } = req.params;
    const updateData = req.body;

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
      // ADMINロールを持つユーザーのみが、他のユーザーの情報を更新できる
      // また、ユーザーは自身の情報のみ更新できる
      if (
        authenticatedUser.id !== requestedId &&
        authenticatedUser.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message: "Access to this resource is denied",
        });
      }

      // Prismaの更新操作
      const updatedUser = await prisma.user.update({
        where: { id: requestedId },
        data: updateData,
      });

      // レスポンスからpasswordHashを除外
      const { passwordHash: _, ...userWithoutPasswordHash } = updatedUser;

      return res.status(200).json(userWithoutPasswordHash);
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
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

export default router;
