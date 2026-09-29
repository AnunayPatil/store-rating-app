const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const userSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Must follow standard email validation rules'),
  password: z
    .string()
    .regex(passwordRegex, 'Password must be 8-16 characters with at least one uppercase and one special character'),
  address: z
    .string()
    .max(400, 'Address must not exceed 400 characters'),
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional(),
});

const storeSchema = z.object({
  name: z.string().min(20, 'Store name must be at least 20 characters').max(60, 'Store name must not exceed 60 characters'),
  email: z.string().email('Invalid email format'),
  address: z.string().max(400, 'Address must not exceed 400 characters'),
  ownerId: z.string().uuid().optional().nullable(),
});

module.exports = { userSchema, storeSchema, passwordRegex };