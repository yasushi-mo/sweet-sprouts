import express from "express";
import prisma from "@/lib/prisma";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/users", async (req, res) => {
  const { email, passwordHash, name } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
