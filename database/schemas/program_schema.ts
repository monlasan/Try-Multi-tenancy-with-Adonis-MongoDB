import mongoose from 'mongoose'

export const ProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  active: Boolean,
  basic_program: {
    added_points: Number,
  },
  periodic_program: {
    from: Date,
    to: Date,
    added_points: Number,
  },
  weekend_program: {
    added_points: Number,
  },
  batch_program: {
    amount: Number,
    added_points: Number,
  },
})
