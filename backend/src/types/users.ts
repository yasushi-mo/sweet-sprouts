// [Users] ユーザー情報管理
import { User } from "@prisma/client";
import { PostAuthRegisterRequestBody } from "./auth";

// [特定ユーザー情報取得API]
/**
 * @description 特定ユーザー情報取得APIのリクエストパラメータの型
 * @property {string} id - ユーザーID
 */
export type GetUserRequestParams = {
  id: string;
};

/* @description 特定ユーザー情報取得APIの成功レスポンスの型 */
export type GetUserResponse = Omit<User, "passwordHash">;

// [特定ユーザー情報更新API]
/** @description 特定ユーザー情報更新APIのリクエストボディの型 */
export type PutUserRequestBody = Partial<
  PostAuthRegisterRequestBody & Pick<User, "role">
>;

/** @description 特定ユーザー情報更新APIの成功レスポンスの型 */
export type PutUserResponse = Omit<User, "passwordHash">;

// [特定ユーザー情報削除API]
/** @description 特定ユーザー情報削除APIの成功レスポンスの型 */
export type DeleteUserResponse = {
  message: string;
};
