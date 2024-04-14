import mongoose from 'mongoose'

const schema = new mongoose.Schema(
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

export const User = mongoose.model('User', schema)
