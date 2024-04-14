import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Transaction = mongoose.model('Transaction', schema)
