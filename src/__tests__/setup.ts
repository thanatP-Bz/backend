import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set JWT secrets before any module uses them
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key-for-testing";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
