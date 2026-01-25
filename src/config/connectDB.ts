import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("connect to DB");
  } catch (error) {
    console.error("mongo DB connnect failed ", error);
    process.exit(1);
  }
};

export default connectDB;
