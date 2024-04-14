import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  { timestamps: true }
)

export const Customer = mongoose.model('Customer', schema)
