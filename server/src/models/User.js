import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // Filled when you move from guest sessions to Auth0 (the `sub` claim).
    authSub: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
