import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Caregiver User Model
 * Secures caregiver dashboard access and sensitive guardian contact data.
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['CAREGIVER', 'ADMIN', 'GUARDIAN'],
      default: 'CAREGIVER',
    },
    assignedDeviceId: {
      type: String,
      default: 'BLINDSTICK001',
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing pre-save hook
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
