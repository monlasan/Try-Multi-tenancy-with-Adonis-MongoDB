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
      basic_program: {
        active: true,
        added_points: 10,
      },
      specific_program: {
        active: false,
        dates: [],
      },
      referral_program: {
        active: false,
        added_points: 0,
      },
      batch_program: {
        active: false,
        amount: 0,
        added_points: 0,
      },
      weekend_program: {
        active: false,
        added_points: 0,
      },
      periodic_program: {
        active: false,
        from: Date,
        to: Date,
        added_points: 0,
      },
    },
    // programs: {
    //   type: [ProgramSchema],
    //   validate: {
    //     validator: function (v: any[]) {
    //       return v && v.length > 0
    //     },
    //     message: 'An organization must have at least one program.',
    //   },
    // },
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
