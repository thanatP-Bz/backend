import request from "supertest";
import app from "../app";

jest.mock("../middleware/rateLimiter", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
}));

const AUTH = "/api/auth";
const TXN = "/api/transactions";

let accessToken: string;

const validTxn = {
  type: "income",
  amount: 1000,
  category: "Salary",
  description: "Monthly salary",
  date: "2024-01-15",
};

async function getToken(): Promise<string> {
  await request(app).post(`${AUTH}/register`).send({
    name: "Tester",
    email: "tester@example.com",
    password: "secret123",
  });
  const res = await request(app).post(`${AUTH}/login`).send({
    email: "tester@example.com",
    password: "secret123",
  });
  return res.body.accessToken;
}

beforeEach(async () => {
  accessToken = await getToken();
});

// ─── Create Transaction ───────────────────────────────────────────────────────
describe("POST /api/transactions", () => {
  it("creates a transaction and returns 201", async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validTxn);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.amount).toBe(1000);
    expect(res.body.transaction.type).toBe("income");
    expect(res.body.transaction.category).toBe("Salary");
    expect(res.body.transaction._id).toBeDefined();
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).post(TXN).send(validTxn);

    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "income" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 for an invalid category", async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...validTxn, category: "Invalid" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid type", async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...validTxn, type: "transfer" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is zero or negative", async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...validTxn, amount: 0 });

    expect(res.status).toBe(400);
  });
});

// ─── Get All Transactions ─────────────────────────────────────────────────────
describe("GET /api/transactions", () => {
  beforeEach(async () => {
    await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validTxn);
    await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "expense", amount: 50, category: "Food", date: "2024-01-20" });
  });

  it("returns all transactions for the authenticated user", async () => {
    const res = await request(app)
      .get(TXN)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.transactions).toHaveLength(2);
  });

  it("filters transactions by type", async () => {
    const res = await request(app)
      .get(`${TXN}?type=income`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.transactions[0].type).toBe("income");
  });

  it("filters transactions by category", async () => {
    const res = await request(app)
      .get(`${TXN}?category=Food`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.transactions[0].category).toBe("Food");
  });

  it("filters transactions by date range", async () => {
    const res = await request(app)
      .get(`${TXN}?startDate=2024-01-18&endDate=2024-01-31`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.transactions[0].category).toBe("Food");
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).get(TXN);

    expect(res.status).toBe(401);
  });

  it("returns empty list when no transactions exist", async () => {
    // Register a different user with no transactions
    await request(app).post(`${AUTH}/register`).send({
      name: "Empty",
      email: "empty@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${AUTH}/login`).send({
      email: "empty@example.com",
      password: "secret123",
    });
    const otherToken = loginRes.body.accessToken;

    const res = await request(app)
      .get(TXN)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });
});

// ─── Get Transaction by ID ────────────────────────────────────────────────────
describe("GET /api/transactions/:id", () => {
  let txnId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validTxn);
    txnId = res.body.transaction._id;
  });

  it("returns the transaction by ID", async () => {
    const res = await request(app)
      .get(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction._id).toBe(txnId);
    expect(res.body.transaction.amount).toBe(1000);
  });

  it("returns 404 for a non-existent transaction ID", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .get(`${TXN}/${fakeId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("cannot access another user's transaction", async () => {
    // Create another user
    await request(app).post(`${AUTH}/register`).send({
      name: "Other",
      email: "other@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${AUTH}/login`).send({
      email: "other@example.com",
      password: "secret123",
    });
    const otherToken = loginRes.body.accessToken;

    const res = await request(app)
      .get(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── Update Transaction ───────────────────────────────────────────────────────
describe("PATCH /api/transactions/:id", () => {
  let txnId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validTxn);
    txnId = res.body.transaction._id;
  });

  it("updates the amount successfully", async () => {
    const res = await request(app)
      .patch(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 2000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.amount).toBe(2000);
  });

  it("updates multiple fields at once", async () => {
    const res = await request(app)
      .patch(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 500, category: "Food", type: "expense" });

    expect(res.status).toBe(200);
    expect(res.body.transaction.amount).toBe(500);
    expect(res.body.transaction.category).toBe("Food");
    expect(res.body.transaction.type).toBe("expense");
  });

  it("returns 404 for a non-existent transaction", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .patch(`${TXN}/${fakeId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 100 });

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .patch(`${TXN}/${txnId}`)
      .send({ amount: 100 });

    expect(res.status).toBe(401);
  });
});

// ─── Delete Transaction ───────────────────────────────────────────────────────
describe("DELETE /api/transactions/:id", () => {
  let txnId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post(TXN)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validTxn);
    txnId = res.body.transaction._id;
  });

  it("deletes the transaction and returns 200", async () => {
    const res = await request(app)
      .delete(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 404 after the transaction has been deleted", async () => {
    await request(app)
      .delete(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .delete(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-existent transaction ID", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .delete(`${TXN}/${fakeId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).delete(`${TXN}/${txnId}`);

    expect(res.status).toBe(401);
  });

  it("cannot delete another user's transaction", async () => {
    await request(app).post(`${AUTH}/register`).send({
      name: "Other",
      email: "other2@example.com",
      password: "secret123",
    });
    const loginRes = await request(app).post(`${AUTH}/login`).send({
      email: "other2@example.com",
      password: "secret123",
    });
    const otherToken = loginRes.body.accessToken;

    const res = await request(app)
      .delete(`${TXN}/${txnId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});
