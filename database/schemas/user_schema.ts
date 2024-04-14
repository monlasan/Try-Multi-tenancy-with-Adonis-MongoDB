import mongoose from 'mongoose'

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  { timestamps: true }
)
