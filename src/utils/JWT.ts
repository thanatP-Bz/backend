import jwt from "jsonwebtoken";
// Helper function to generate tokens
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "1m" }, // ← 15 minutes
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string, // ← Different secret!
    { expiresIn: "7d" }, // ← 7 days
  );

  return { accessToken, refreshToken };
};

// Helper to generate ONLY access token
export const generateNewAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "1m",
  });
};
