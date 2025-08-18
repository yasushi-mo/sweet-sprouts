import supertest from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/libs/prisma";
import app from "@/index";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants";

const request = supertest(app);

describe("[Users] ユーザー情報管理", () => {
  let testUser: User;
  let accessToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "hashed_password",
        name: "Test User",
      },
    });

    // ログインをシミュレートし、テスト用のアクセストークンを生成
    accessToken = jwt.sign({ id: testUser.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("特定ユーザー情報取得API", () => {
    it("IDが存在する場合、200ステータスと対象のユーザー情報を返す", async () => {
      const response = await request
        .get(`/users/${testUser.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // ユーザーが見つかることを期待
      expect(response.status).toBe(200);
      // レスポンスのJSONボディが正しいことを期待
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
    });

    it("対象のIDが存在しない場合、404を返す", async () => {
      const nonExistentId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"; // 存在しないUUID
      const response = await request
        .get(`/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // ユーザーが見つからないため404エラーを期待
      expect(response.status).toBe(404);
    });
  });
});
