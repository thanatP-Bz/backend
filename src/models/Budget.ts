import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface IBudget extends Document {
  userId: ObjectId;
  month: number; // 1-12
  year: number; // 2026
  totalLimit: number; // optional overall limit
  categories: [
    {
      category: string; // "Food", "Transport" etc
      limit: number; // 500, 200 etc
    },
  ];
}

const BudgetSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalLimit: {
    type: Number,
  },
  categories: [
    {
      category: { type: String },
      limit: { type: Number },
    },
  ],
});

export default mongoose.model<IBudget>("Budget", BudgetSchema);
