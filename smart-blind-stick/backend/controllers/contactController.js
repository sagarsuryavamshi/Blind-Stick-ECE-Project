import { z } from 'zod';
import { Contact } from '../models/Contact.js';
import { isDbConnected } from '../config/database.js';
import { inMemoryContacts } from '../services/emergencyService.js';

// Strict Indian Mobile Number Validation (+91 followed by 10 digits, or 10 digits starting 6-9)
const indianPhoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').max(100),
  phone: z.string().refine((val) => indianPhoneRegex.test(val.trim()), {
    message: 'Must be a valid 10-digit Indian mobile number (e.g., +919876543210 or 9876543210)',
  }),
  relationship: z.string().optional().default('Primary Guardian'),
  isPrimary: z.boolean().optional().default(false),
  receiveSMS: z.boolean().optional().default(true),
  receiveCalls: z.boolean().optional().default(false),
});

/**
 * Normalizes phone number into consistent "+91 XXXXX XXXXX" format
 */
function normalizeIndianPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  const tenDigits = digits.length > 10 ? digits.slice(-10) : digits;
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
}

/**
 * GET /api/contacts
 */
export async function getContacts(req, res, next) {
  try {
    if (isDbConnected()) {
      const contacts = await Contact.find().sort({ isPrimary: -1, createdAt: 1 });
      return res.json({ success: true, count: contacts.length, data: contacts });
    }

    return res.json({
      success: true,
      count: inMemoryContacts.length,
      data: inMemoryContacts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/contacts
 */
export async function createContact(req, res, next) {
  try {
    const validation = contactSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.format(),
      });
    }

    const { name, phone, relationship, isPrimary, receiveSMS, receiveCalls } = validation.data;
    const formattedPhone = normalizeIndianPhone(phone);

    if (isDbConnected()) {
      // If marking as primary, clear any existing primary
      if (isPrimary) {
        await Contact.updateMany({}, { $set: { isPrimary: false } });
      }

      // If this is the only contact, make it primary automatically
      const count = await Contact.countDocuments();
      const shouldBePrimary = isPrimary || count === 0;

      const newContact = await Contact.create({
        name,
        phone: formattedPhone,
        relationship,
        isPrimary: shouldBePrimary,
        receiveSMS,
        receiveCalls,
      });

      return res.status(201).json({ success: true, data: newContact });
    }

    // In-Memory
    if (isPrimary) {
      inMemoryContacts.forEach((c) => (c.isPrimary = false));
    }
    const shouldBePrimary = isPrimary || inMemoryContacts.length === 0;

    const newContact = {
      _id: 'c_' + Math.random().toString(36).substring(2, 9),
      name,
      phone: formattedPhone,
      relationship,
      isPrimary: shouldBePrimary,
      receiveSMS,
      receiveCalls,
      createdAt: new Date().toISOString(),
    };

    inMemoryContacts.push(newContact);
    return res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/contacts/:id
 */
export async function updateContact(req, res, next) {
  try {
    const { id } = req.params;
    const validation = contactSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.format(),
      });
    }

    const updates = { ...validation.data };
    if (updates.phone) {
      updates.phone = normalizeIndianPhone(updates.phone);
    }

    if (isDbConnected()) {
      if (updates.isPrimary) {
        await Contact.updateMany({ _id: { $ne: id } }, { $set: { isPrimary: false } });
      }

      const updated = await Contact.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }
      return res.json({ success: true, data: updated });
    }

    // In-Memory
    const contact = inMemoryContacts.find((c) => c._id === id || c.id === id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    if (updates.isPrimary) {
      inMemoryContacts.forEach((c) => (c.isPrimary = false));
    }

    Object.assign(contact, updates);
    return res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/contacts/:id
 */
export async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Contact.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }

      // If deleted contact was primary, designate first remaining contact as primary
      if (deleted.isPrimary) {
        const remaining = await Contact.findOne();
        if (remaining) {
          remaining.isPrimary = true;
          await remaining.save();
        }
      }

      return res.json({ success: true, message: 'Contact deleted successfully' });
    }

    // In-Memory
    const index = inMemoryContacts.findIndex((c) => c._id === id || c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    const wasPrimary = inMemoryContacts[index].isPrimary;
    inMemoryContacts.splice(index, 1);

    if (wasPrimary && inMemoryContacts.length > 0) {
      inMemoryContacts[0].isPrimary = true;
    }

    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    next(error);
  }
}
