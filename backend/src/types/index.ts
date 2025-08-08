import { User } from "@prisma/client";

/** レスポンスでエラーを返す際の共通型 */
export type ErrorResponse = {
  error: string;
};

// Users ユーザー情報管理
/** 特定ユーザー情報取得 のリクエストパラメータの型 */
export type GetUserRequestParams = {
  id: string;
};

/* 特定ユーザー情報取得 の成功レスポンスの型 */
export type GetUserResponse = User | ErrorResponse;
