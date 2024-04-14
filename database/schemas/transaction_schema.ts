import mongoose from 'mongoose'

export const TransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)
