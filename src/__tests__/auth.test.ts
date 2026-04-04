import request from "supertest";
import app from "../app";

// Bypass the rate limiter so test requests don't get blocked
jest.mock("../middleware/rateLimiter", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
}));

const BASE = "/api/auth";

// ─── Register ────────────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("creates a new user and returns 201 with accessToken", async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: "Alice",
      email: "alice@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.user.name).toBe("Alice");
    expect(res.body.user.id).toBeDefined();
  });

  it("returns 400 when email is already registered", async () => {
    const user = { name: "Bob", email: "bob@example.com", password: "secret123" };
    await request(app).post(`${BASE}/register`).send(user);
    const res = await request(app).post(`${BASE}/register`).send(user);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post(`${BASE}/register`).send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("returns 400 when password is shorter than 6 characters", async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: "Carol",
      email: "carol@example.com",
      password: "abc",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when email format is invalid", async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      name: "Dave",
      email: "not-an-email",
      password: "secret123",
    });

    expect(res.status).toBe(400);
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send({
      name: "Eve",
      email: "eve@example.com",
      password: "secret123",
    });
  });

  it("returns 200 with accessToken and refreshToken on valid credentials", async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: "eve@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe("eve@example.com");
  });

  it("returns 404 when email does not exist", async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: "nobody@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when password is incorrect", async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: "eve@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for an invalid email format", async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: "not-an-email",
      password: "secret123",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
describe("POST /api/auth/refresh", () => {
  let refreshToken: string;

  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send({
      name: "Frank",
      email: "frank@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: "frank@example.com",
      password: "secret123",
    });
    refreshToken = loginRes.body.refreshToken;
  });

  it("returns a new accessToken with a valid refresh token", async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });

  it("returns 401 when no refresh token is provided", async () => {
    const res = await request(app).post(`${BASE}/refresh`).send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 403 for an invalid/malformed refresh token", async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: "invalid.token.value" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the refresh token", async () => {
    await request(app).post(`${BASE}/register`).send({
      name: "Grace",
      email: "grace@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: "grace@example.com",
      password: "secret123",
    });

    const res = await request(app)
      .post(`${BASE}/logout`)
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/logged out/i);
  });

  it("returns 200 even when no refresh token is provided", async () => {
    const res = await request(app).post(`${BASE}/logout`).send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("invalidates the refresh token so it cannot be reused", async () => {
    await request(app).post(`${BASE}/register`).send({
      name: "Hank",
      email: "hank@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: "hank@example.com",
      password: "secret123",
    });
    const { refreshToken } = loginRes.body;

    // Logout
    await request(app).post(`${BASE}/logout`).send({ refreshToken });

    // Attempt to use the same refresh token again
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken });

    expect(res.status).toBe(403);
  });
});
