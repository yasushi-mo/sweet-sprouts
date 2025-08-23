// [Users] ユーザー情報管理
import prisma from "@/libs/prisma";
import {
  jwtAuthenticationMiddleware,
  userAuthorizationMiddleware,
} from "@/middlewares/auth";
import { getUserByIdMiddleware } from "@/middlewares/users";
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
  getUserByIdMiddleware,
  userAuthorizationMiddleware,
  async (
    req: Request<GetUserRequestParams>,
    res: Response<GetUserResponse | ErrorResponse>
  ) => {
    try {
      /** getUserByIdMiddleware で取得したユーザー情報 */
      const requestedUser = req.requestedUser;

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
  getUserByIdMiddleware,
  userAuthorizationMiddleware,
  async (
    req: Request<GetUserRequestParams, {}, PutUserRequestBody>,
    res: Response<PutUserResponse | ErrorResponse>
  ) => {
    const updateData = req.body;

    try {
      /** getUserByIdMiddleware で取得したユーザー情報 */
      const requestedUser = req.requestedUser;

      // Prismaの更新操作
      const updatedUser = await prisma.user.update({
        where: { id: requestedUser.id },
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
