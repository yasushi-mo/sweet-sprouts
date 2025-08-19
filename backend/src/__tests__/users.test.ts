import supertest from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import prisma from "@/libs/prisma";
import app from "@/index";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants";
import { NextFunction, Request, Response } from "express";

const request = supertest(app);

describe("[Users] ユーザー情報管理", () => {
  let testUser: User;
  let anotherUser: User;
  let adminUser: User;

  let testUserAccessToken: string;
  let anotherUserAccessToken: string;
  let adminUserAccessToken: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "hashed_password",
        name: "Test User",
      },
    });

    // 別の一般ユーザーを作成
    anotherUser = await prisma.user.create({
      data: {
        email: "another@example.com",
        passwordHash: "hashed_password",
        name: "Another User",
      },
    });

    // 管理者ユーザーを作成
    adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash: "hashed_password",
        name: "Admin User",
        role: "ADMIN", // ロールをADMINに設定
      },
    });

    // 各ユーザーのアクセストークンを生成
    testUserAccessToken = jwt.sign({ id: testUser.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    anotherUserAccessToken = jwt.sign({ id: anotherUser.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    adminUserAccessToken = jwt.sign({ id: adminUser.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("特定ユーザー情報取得API", () => {
    it("認証済みユーザーが自分の情報を取得する場合、200ステータスと対象のユーザー情報を返す", async () => {
      const response = await request
        .get(`/users/${testUser.id}`)
        .set("Authorization", `Bearer ${testUserAccessToken}`);

      // ユーザーが見つかることを期待
      expect(response.status).toBe(200);
      // レスポンスのJSONボディが正しいことを期待
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
    });

    it("対象のIDが存在しない場合、404を返す", async () => {
      const response = await request
        .get("/users/no-existent-id")
        .set("Authorization", `Bearer ${testUserAccessToken}`);

      // ユーザーが見つからないため404エラーを期待
      expect(response.status).toBe(404);
    });

    it("認証済みユーザーが他のユーザーの情報を取得しようとした場合、403を返す", async () => {
      // 認証はtestUserで行い、anotherUserの情報をリクエストする
      const response = await request
        .get(`/users/${anotherUser.id}`)
        .set("Authorization", `Bearer ${testUserAccessToken}`);

      // 認可チェックで失敗し、403エラーを期待
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access to this resource is denied");
    });
  });
});
