import supertest from "supertest";
import app from "@/index";
import prisma from "@/libs/prisma";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const request = supertest(app);

describe("[Authentication] ユーザー認証とセッション管理", () => {
  // 全てのテストが実行される前に1回だけ実行
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  // 全てのテストが実行された後に1回だけ実行
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("新規ユーザー登録", () => {
    it("should create a new user and return 201 status", async () => {
      const response = await request.post("/auth/register").send({
        email: "testuser@example.com",
        password: "password123",
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("testuser@example.com");
      // レスポンスにパスワードハッシュが含まれていないことを確認
      expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("should return 409 status if email already exists", async () => {
      // 事前にユーザーを作成
      await request.post("/auth/register").send({
        email: "existing@example.com",
        password: "password123",
      });

      const response = await request.post("/auth/register").send({
        email: "existing@example.com",
        password: "password123",
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Email already exists");
    });
  });
});
