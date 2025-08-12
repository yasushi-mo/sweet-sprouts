// [Authentication] ユーザー認証とセッション管理

import { User } from "@prisma/client";

/**
 * @description 新規ユーザー登録APIのリクエストボディの型
 * @property {string} email - ユーザーのメールアドレス
 * @property {string} password - ユーザーのパスワード
 * @property {string} name - ユーザーの名前
 */
export type PostAuthRegisterRequest = {
  email: string;
  password: string;
  name: string;
};

/** @description 新規ユーザー登録APIの成功レスポンスの型 */
export type PostAuthRegisterResponse = Omit<User, "passwordHash">;

/** @description ユーザーログインAPIのリクエストボディの型 */
export type PostAuthLoginRequest = Omit<PostAuthRegisterRequest, "name">;

/** @description ユーザーログインAPIの成功レスポンスの型 */
export type PostAuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: PostAuthRegisterResponse;
};
