import { JWT_SECRET } from "@/constants";
import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type DecodedToken = {
  id: string;
  iat: number;
  exp: number;
};

/** デコードされたオブジェクトが DecodedToken 型であるかをチェックする型ガード関数 */
const isDecodedToken = (payload: unknown): payload is DecodedToken => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    typeof payload.id === "string" &&
    "iat" in payload &&
    typeof payload.iat === "number" &&
    "exp" in payload &&
    typeof payload.exp === "number"
  );
};

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

/**
 * [認証]リクエストヘッダーのJWT（JSON Web Token）を検証し、ユーザーが「誰であるか」をチェック
 * 成功した場合、認証済みユーザーのIDをリクエストオブジェクトに追加する
 **/
export const jwtAuthenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  /**
   * Authorizationヘッダーから取得したトークン
   * ※ authHeader は "Bearer TOKEN" の形式を想定（authHeader の2番目の要素にトークンが含まれる）
   **/
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken)
    return res.status(401).json({ message: "Authentication token is missing" });

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    if (!isDecodedToken(decoded)) throw new Error("Invalid token payload");

    req.user = { id: decoded.id };

    // 認証が成功したら、次のミドルウェアまたはルートハンドラへ
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * [認可]認証済みユーザーが、リクエストされたリソースにアクセスする「権限を持っているか」チェック
 * 以下のいずれかの条件を満たす場合にアクセスを許可
 * 1. リクエストされたリソースのIDが、認証済みユーザーのIDと一致
 * 2. 認証済みユーザーのロールが「ADMIN」
 */
export const userAuthorizationMiddleware = async (
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  try {
    // jwtAuthMiddlewareによって付与されたユーザーIDを使用して、認証済みユーザーの情報を取得
    const user: User | null = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      // 認証済みユーザーが見つからない場合、認証ミドルウェアが正しく機能していない可能性
      // このエラーは発生しにくいが、念のためチェック
      return res.status(404).json({ message: "User not found" });
    }

    // 認可チェック:
    // - リクエストされたIDと認証済みユーザーIDが異なる AND
    // - 認証済みユーザーのロールがADMINでない場合、アクセス拒否
    if (req.requestedUser.id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access to this resource is denied",
      });
    }

    // すべてのチェックが完了したら、次のハンドラーへ
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
