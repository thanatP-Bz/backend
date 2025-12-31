import jwt from "jsonwebtoken";

// Generate Access Token
export const generateAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined! Check your .env file");
  }

  return jwt.sign({ _id: userId }, secret, {
    expiresIn: "10m",
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
  console.log("🔍 VERIFY REFRESH TOKEN:");
  console.log("Token to verify:", token.substring(0, 30) + "...");
  console.log("Secret exists:", !!process.env.JWT_REFRESH_SECRET);
  console.log(
    "Secret value:",
    process.env.JWT_REFRESH_SECRET?.substring(0, 20) + "..."
  );

  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      console.log("❌ No secret found!");
      return null;
    }

    const decoded = jwt.verify(token, secret);
    console.log("✅ Token verified successfully:", decoded);
    return decoded;
  } catch (error: any) {
    console.log("❌ Token verification failed:", error.message);
    return null;
  }
};
