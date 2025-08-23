import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types";
import { GetUserRequestParams } from "@/types/users";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    export interface Request {
      requestedUser: User;
    }
  }
}

/** リクエストされたユーザーIDに対応するユーザーを取得し、リクエストオブジェクトに格納するミドルウェア */
export const getUserByIdMiddleware = async (
  req: Request<GetUserRequestParams>,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  const { id: requestedId } = req.params;

  try {
    // リクエストされたユーザー情報を取得
    const requestedUser: User | null = await prisma.user.findUnique({
      where: { id: requestedId },
    });

    if (!requestedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ユーザー情報をreqオブジェクトに付与
    req.requestedUser = requestedUser;

    // ユーザー取得が完了したら、次のハンドラーへ
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
