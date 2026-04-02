import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: [true, "Transaction type is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, "Amount must be greater than 0"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Food", "Transport", "Housing", "Entertainment", "Salary", "Other"],
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
