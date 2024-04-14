import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  { timestamps: true }
)

export const Organization = mongoose.model('Organization', schema)
