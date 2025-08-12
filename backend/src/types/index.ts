import { User } from "@prisma/client";

// [Common] 共通の型
/**
 * @description レスポンスでエラーを返す際の共通型
 * @property {string} message - エラーメッセージ
 */
export type ErrorResponse = {
  message: string;
};
