import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    database_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export const Tenant = mongoose.model('Tenant', schema)
