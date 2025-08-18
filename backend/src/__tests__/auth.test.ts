import supertest from "supertest";
import app from "@/index";
import prisma from "@/libs/prisma";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@/constants";

const request = supertest(app);

describe("[Authentication] ユーザー認証とセッション管理", () => {
  let loginTestUser: User;
  const password = "password123";

  beforeEach(async () => {
    await prisma.user.deleteMany();

    // ログインテストユーザーをデータベースに作成
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    loginTestUser = await prisma.user.create({
      data: {
        email: "login-test@example.com",
        passwordHash,
        name: "Login Test User",
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("新規ユーザー登録API", () => {
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
  describe("ユーザーログインAPI", () => {
    it("正しいメールアドレス、パスワードの場合、200ステータス、トークン、ユーザー情報を返す", async () => {
      const response = await request.post("/auth/login").send({
        email: loginTestUser.email,
        password,
      });

      expect(response.status).toBe(200);
      // トークンの確認
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.accessToken.length).toBeGreaterThan(0);
      expect(typeof response.body.refreshToken).toBe("string");
      expect(response.body.refreshToken.length).toBeGreaterThan(0);
      // ユーザー情報の確認
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id", loginTestUser.id);
      expect(response.body.user).toHaveProperty("email", loginTestUser.email);
      expect(response.body.user).toHaveProperty("name", loginTestUser.name);
      // レスポンスにパスワードハッシュが含まれていないことを確認
      expect(response.body.user).not.toHaveProperty("passwordHash");
    });

    it("パスワードが不正な場合、401ステータスを返す", async () => {
      const response = await request.post("/auth/login").send({
        email: loginTestUser.email,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("ユーザーが存在しない場合、401ステータスを返す", async () => {
      const response = await request.post("/auth/login").send({
        email: "no-existent@example.com",
        password,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });
});
