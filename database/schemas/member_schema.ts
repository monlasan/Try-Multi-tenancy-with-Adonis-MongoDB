import mongoose from 'mongoose'

export const MemberSchema = new mongoose.Schema(
  {
    full_name: {
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
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
    },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'CASHIER'], default: 'CASHIER' },
    avatar_url: { type: String, default: 'https://via.placeholder.com/200x200.png' },
    login_type: { type: String, default: 'EMAIL_PASSWORD' },
    // --
    organization_name: String,
    tenant_id: String,
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    // --
    is_email_verified: { type: Boolean, default: false },
    refresh_token: { type: String },
    forgot_password_token: { type: String },
    forgot_password_expiry: { type: String },
    email_verification_token: { type: String },
    email_verification_expiry: { type: String },
  },
  { timestamps: true }
)
