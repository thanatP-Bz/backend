import jwt from "jsonwebtoken";

// Generate Access Token
export const generateAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined! Check your .env file");
  }

  return jwt.sign({ _id: userId }, secret, {
    expiresIn: "15m",
  });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined! Check your .env file");
  }

  return jwt.sign({ _id: userId }, secret, {
    expiresIn: "7d",
  });
};

// Verify Access Token
export const verifyAccessToken = (token: string) => {
  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
