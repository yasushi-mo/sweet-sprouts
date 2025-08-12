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
 * @description 新規ユーザー登録APIのリクエストボディの型
 * @property {string} email - ユーザーのメールアドレス
 * @property {string} password - ユーザーのパスワード
 * @property {string} name - ユーザーの名前
 */
export type PostUserRequest = {
  email: string;
  password: string;
  name: string;
};

/** @description 新規ユーザー登録APIの成功レスポンスの型 */
export type PostUserResponse = Omit<User, "passwordHash">;

/** @description ユーザーログインAPIのリクエストボディの型 */
export type PostAuthLoginRequest = Omit<PostUserRequest, "name">;

/** @description ユーザーログインAPIの成功レスポンスの型 */
export type PostAuthLoginResponse = {
  accessToken: string;
  refreshToke: string;
} & PostUserResponse;

// [Users] ユーザー情報管理
/**
 * @description 特定ユーザー情報取得APIのリクエストパラメータの型
 * @property {string} id - ユーザーID
 */
export interface GetUserRequestParams {
  id: string;
}

/* @description 特定ユーザー情報取得APIの成功レスポンスの型 */
export type GetUserResponse = User;
