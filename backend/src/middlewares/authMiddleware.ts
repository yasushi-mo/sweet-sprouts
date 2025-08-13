import { JWT_SECRET } from "@/constants";
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

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  /**
   * Authorizationヘッダーから取得したトークン
   * ※ authHeader は "Bearer TOKEN" の形式を想定（authHeader の2番目の要素にトークンが含まれる）
   **/
  const token = authHeader && authHeader.split("")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication token is missing" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isDecodedToken(decoded)) throw new Error("Invalid token payload");

    // 認証が成功したら、次のミドルウェアまたはルートハンドラへ
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
