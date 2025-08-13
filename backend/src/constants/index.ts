export const SALT_ROUNDS = 10;

export const JWT_SECRET = process.env.JWT_SECRET || "your-very-secret-key";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-very-secret-refresh-key";
