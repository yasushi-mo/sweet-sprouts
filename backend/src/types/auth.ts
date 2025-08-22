// [Authentication] ユーザー認証とセッション管理

import { User } from "@prisma/client";

// [新規ユーザー登録API]
/**
 * @description 新規ユーザー登録APIのリクエストボディの型
 * @property {string} email - ユーザーのメールアドレス
 * @property {string} password - ユーザーのパスワード
 * @property {string} name - ユーザーの名前
 */
export type PostAuthRegisterRequestBody = {
  email: string;
  password: string;
  name: string;
};

/** @description 新規ユーザー登録APIの成功レスポンスの型 */
export type PostAuthRegisterResponse = Omit<User, "passwordHash">;

// [ユーザーログインAPI]
/** @description ユーザーログインAPIのリクエストボディの型 */
export type PostAuthLoginRequestBody = Omit<
  PostAuthRegisterRequestBody,
  "name"
>;

/** @description ユーザーログインAPIの成功レスポンスの型 */
export type PostAuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: PostAuthRegisterResponse;
};
