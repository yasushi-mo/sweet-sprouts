import prisma from "@/lib/prisma";

const main = async () => {
  try {
    console.log("Create a user...");
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "hashed_password_for_test",
        name: "Test User",
      },
    });
    console.log("a user has been created:", user);

    const fetchedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    console.log("ユーザーが見つかりました:", fetchedUser);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("データベース接続を切断しました。");
  }
};

main();
