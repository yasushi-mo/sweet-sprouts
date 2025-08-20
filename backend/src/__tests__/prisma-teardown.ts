import { afterAll } from "vitest";
import prisma from "@/libs/prisma";

// Vitestのグローバルな afterAll フックを定義
afterAll(async () => {
  // すべてのテストが完了したら、データベース接続を切断
  await prisma.$disconnect();
});
