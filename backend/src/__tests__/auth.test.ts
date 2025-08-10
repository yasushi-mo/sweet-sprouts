import supertest from "supertest";
import app from "@/index";
import prisma from "@/libs/prisma";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const request = supertest(app);

describe("[Authentication] ユーザー認証とセッション管理", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("新規ユーザー登録", () => {
    it("新しいユーザーを作成し、201ステータスを返す", async () => {
      const response = await request.post("/auth/register").send({
        email: "testuser@example.com",
        password: "password123",
        name: "test",
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("testuser@example.com");
      // レスポンスにパスワードハッシュが含まれていないことを確認
      expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("メールアドレスがすでに存在する場合、409ステータスを返す", async () => {
      // 事前にユーザーを作成
      await request.post("/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        name: "test",
      });

      const response = await request.post("/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        name: "test",
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Email already exists");
    });
  });
});
