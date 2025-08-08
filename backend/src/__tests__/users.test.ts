import supertest from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/prisma";
import app from "@/index";

const request = supertest(app);

describe("User API", () => {
  let testUser: any; // NOTE: 型を厳密にするには、Prismaの型をインポートします

  // 全てのテストが実行される前に1回だけ実行
  beforeAll(async () => {
    // NOTE: テスト実行前にユーザーテーブルを確実に空にする
    await prisma.user.deleteMany();

    // テストユーザーを作成
    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "hashed_password",
        name: "Test User",
      },
    });
  });

  // 全てのテストが実行された後に1回だけ実行
  afterAll(async () => {
    // 作成したテストユーザーを削除してデータベースをクリーンに保つ
    await prisma.user.deleteMany();
  });

  it("GET /users/:id はIDが存在する場合にユーザーを返す", async () => {
    const response = await request.get(`/users/${testUser.id}`);

    // ユーザーが見つかることを期待
    expect(response.status).toBe(200);
    // レスポンスのJSONボディが正しいことを期待
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.name).toBe(testUser.name);
  });

  it("GET /users/:id はユーザーが見つからない場合に404を返す", async () => {
    const nonExistentId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"; // 存在しないUUID
    const response = await request.get(`/users/${nonExistentId}`);

    // ユーザーが見つからないため404エラーを期待
    expect(response.status).toBe(404);
  });
});
