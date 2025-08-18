import supertest from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import prisma from "@/libs/prisma";
import app from "@/index";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants";
import { NextFunction, Request, Response } from "express";

const request = supertest(app);

// authMiddlewareをモック化
vi.mock("@/middlewares/authMiddleware", () => ({
  authMiddleware: (req: Request, _: Response, next: NextFunction) => {
    // req.userにテスト用のユーザー情報を付与
    console.log("req.params.id:", req.params.id);
    req.user = { id: req.params.id };
    next();
  },
}));

describe("[Users] ユーザー情報管理", () => {
  let testUser: User;
  let accessToken: string;

  beforeEach(async () => {
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

  afterEach(async () => {
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
      const response = await request
        .get("/users/no-existent-id")
        .set("Authorization", `Bearer ${accessToken}`);

      // ユーザーが見つからないため404エラーを期待
      expect(response.status).toBe(404);
    });
  });
});
