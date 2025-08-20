// [Authentication] ユーザー認証とセッション管理
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express, { Request, Response } from "express";
import { SALT_ROUNDS, JWT_SECRET, JWT_REFRESH_SECRET } from "@/constants";
import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types";
import {
  PostAuthRegisterRequest,
  PostAuthRegisterResponse,
  PostAuthLoginRequest,
  PostAuthLoginResponse,
} from "@/types/auth";

const router = express.Router();

// 新規ユーザー登録API
router.post(
  "/register",
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
router.post(
  "/login",
  async (
    req: Request<{}, {}, PostAuthLoginRequest>,
    res: Response<PostAuthLoginResponse | ErrorResponse>
  ) => {
    const { email, password } = req.body;

    try {
      // ユーザーの検索
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user)
        return res.status(401).json({ message: "Invalid email or password" });

      // パスワードの確認
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Invalid email or password" });

      // JWTトークンの生成
      const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
      });

      // レスポンスからpasswordHashを除外
      const { passwordHash: _, ...userWithoutPasswordHash } = user;

      res.status(200).json({
        accessToken,
        refreshToken,
        user: userWithoutPasswordHash,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
