import mongoose from 'mongoose'
import { ProgramSchema } from './program_schema.js'

export const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    database_name: {
      type: String,
      required: true,
    },
    preferences: {
      logo_url: { type: String, default: '' },
      color_theme: { type: String, default: 'base' },
      currency: { type: String, default: 'XOF' },
      timezone: { type: String, default: 'UTC' },
      language: { type: String, default: 'fr' },
      base_points: { type: Number, default: 10 },
    },
    programs: {
      type: [ProgramSchema],
      validate: {
        validator: function (v: any[]) {
          return v && v.length > 0
        },
        message: 'An organization must have at least one program.',
      },
    },
    subscription_plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  { timestamps: true }
)
