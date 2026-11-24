import mongoose from 'mongoose';

/**
 * Emergency Contact Model
 * Represents verified guardians and caregivers.
 */

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    rawPhone: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
      default: 'Primary Guardian',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
    receiveSMS: {
      type: Boolean,
      default: true,
    },
    receiveCalls: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one contact can be marked as primary
contactSchema.pre('save', async function () {
  if (this.isPrimary) {
    await mongoose.model('Contact').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
});

export const Contact = mongoose.model('Contact', contactSchema);
