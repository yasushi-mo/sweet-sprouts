import { User } from "@prisma/client";

// [Common] 共通の型
/**
 * @description レスポンスでエラーを返す際の共通型
 * @property {string} message - エラーメッセージ
 */
export type ErrorResponse = {
  message: string;
};

// [Authentication] ユーザー認証とセッション管理

/**
 * @description 新規ユーザー登録のリクエストボディの型
 * @property {string} email - ユーザーのメールアドレス
 * @property {string} password - ユーザーのパスワード
 * @property {string} name - ユーザーの名前
 */
export interface PostUserRequest {
  email: string;
  password: string;
  name: string;
}

/** @description 新規ユーザー登録の成功レスポンスの型 */
export type PostUserResponse = Omit<User, "passwordHash">;

// [Users] ユーザー情報管理
/**
 * @description 特定ユーザー情報取得のリクエストパラメータの型
 * @property {string} id - ユーザーID
 */
export interface GetUserRequestParams {
  id: string;
}

/* @description 特定ユーザー情報取得の成功レスポンスの型 */
export type GetUserResponse = User;
