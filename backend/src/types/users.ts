// [Users] ユーザー情報管理
import { User } from "@prisma/client";

/**
 * @description 特定ユーザー情報取得APIのリクエストパラメータの型
 * @property {string} id - ユーザーID
 */
export type GetUserRequestParams = {
  id: string;
};

/* @description 特定ユーザー情報取得APIの成功レスポンスの型 */
export type GetUserResponse = Omit<User, "passwordHash">;
