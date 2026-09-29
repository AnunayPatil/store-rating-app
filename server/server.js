const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

app.use(cors());
app.use(express.json());

// ==========================================
// VALIDATION SCHEMAS
// ==========================================
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$\%^&*(),.?":{}\vert{}<>]).{8,16}$/;

const userSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Must follow standard email validation rules'),
  password: z.string().regex(passwordRegex, 'Password must be 8-16 characters with at least one uppercase and one special character'),
  address: z.string().max(400, 'Address must not exceed 400 characters'),
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional(),
});

const storeSchema = z.object({
  name: z.string().min(20, 'Store name must be at least 20 characters').max(60, 'Store name must not exceed 60 characters'),
  email: z.string().email('Invalid email format'),
  address: z.string().max(400, 'Address must not exceed 400 characters'),
  ownerId: z.string().optional().nullable(),
});

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
const auth = (allowedRoles = []) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }

  const { name, email, password, address } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, address, role: 'NORMAL_USER' },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, role: user.role, name: user.name, id: user.id });
});

app.put('/api/auth/change-password', auth(), async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || !passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'Password must be 8-16 characters with at least one uppercase and one special character',
    });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hash },
  });
  res.json({ message: 'Password updated successfully' });
});

// ==========================================
// 2. SYSTEM ADMINISTRATOR ROUTES
// ==========================================
app.get('/api/admin/dashboard', auth(['ADMIN']), async (req, res) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  res.json({ totalUsers, totalStores, totalRatings });
});

app.post('/api/admin/users', auth(['ADMIN']), async (req, res) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }

  const { name, email, password, address, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, address, role: role || 'NORMAL_USER' },
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.get('/api/admin/users', auth(['ADMIN']), async (req, res) => {
  const { search = '', role = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

  const validSortColumns = ['name', 'email', 'address', 'role'];
  const sortField = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const users = await prisma.user.findMany({
    where: {
      AND: [
        role ? { role } : {},
        search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { address: { contains: search } },
              ],
            }
          : {},
      ],
    },
    include: {
      stores: {
        include: { ratings: true },
      },
    },
    orderBy: { [sortField]: orderDirection },
  });

  const formattedUsers = users.map((u) => {
    let ownerStoreRating = null;
    if (u.role === 'STORE_OWNER' && u.stores.length > 0) {
      const allRatings = u.stores.flatMap((s) => s.ratings);
      if (allRatings.length > 0) {
        const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
        ownerStoreRating = (sum / allRatings.length).toFixed(1);
      }
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      address: u.address,
      role: u.role,
      rating: ownerStoreRating,
    };
  });

  res.json(formattedUsers);
});

app.post('/api/admin/stores', auth(['ADMIN']), async (req, res) => {
  const validation = storeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }

  const { name, email, address, ownerId } = req.body;
  try {
    const store = await prisma.store.create({
      data: { name, email, address, ownerId: ownerId || null },
    });
    res.status(201).json(store);
  } catch (e) {
    res.status(400).json({ error: 'Store email already exists' });
  }
});

app.get('/api/admin/stores', auth(['ADMIN']), async (req, res) => {
  const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

  const validSortColumns = ['name', 'email', 'address'];
  const sortField = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const stores = await prisma.store.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {},
    include: { ratings: true },
    orderBy: { [sortField]: orderDirection },
  });

  const result = stores.map((s) => {
    const avgRating = s.ratings.length
      ? (s.ratings.reduce((acc, r) => acc + r.rating, 0) / s.ratings.length).toFixed(1)
      : '0.0';
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      rating: avgRating,
    };
  });

  res.json(result);
});

// ==========================================
// 3. NORMAL USER ROUTES
// ==========================================
app.get('/api/stores', auth(['NORMAL_USER', 'ADMIN']), async (req, res) => {
  const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

  const validSortColumns = ['name', 'address'];
  const sortField = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const stores = await prisma.store.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {},
    include: { ratings: true },
    orderBy: { [sortField]: orderDirection },
  });

  const response = stores.map((s) => {
    const userRatingObj = s.ratings.find((r) => r.userId === req.user.id);
    const avgRating = s.ratings.length
      ? (s.ratings.reduce((acc, r) => acc + r.rating, 0) / s.ratings.length).toFixed(1)
      : '0.0';

    return {
      id: s.id,
      name: s.name,
      address: s.address,
      overallRating: avgRating,
      userRating: userRatingObj ? userRatingObj.rating : null,
    };
  });

  res.json(response);
});

app.post('/api/ratings', auth(['NORMAL_USER']), async (req, res) => {
  const { storeId, rating } = req.body;
  const numRating = parseInt(rating, 10);

  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must range from 1 to 5' });
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return res.status(404).json({ error: 'Store not found' });

  const record = await prisma.rating.upsert({
    where: { userId_storeId: { userId: req.user.id, storeId } },
    update: { rating: numRating },
    create: { userId: req.user.id, storeId, rating: numRating },
  });

  res.json({ message: 'Rating submitted successfully', data: record });
});

// ==========================================
// 4. STORE OWNER ROUTES
// ==========================================
app.get('/api/owner/dashboard', auth(['STORE_OWNER']), async (req, res) => {
  const store = await prisma.store.findFirst({
    where: { ownerId: req.user.id },
    include: {
      ratings: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!store) {
    return res.json({
      storeName: 'No Store Assigned',
      overallRating: '0.0',
      raters: [],
    });
  }

  const avgRating = store.ratings.length
    ? (store.ratings.reduce((acc, r) => acc + r.rating, 0) / store.ratings.length).toFixed(1)
    : '0.0';

  res.json({
    storeName: store.name,
    overallRating: avgRating,
    raters: store.ratings.map((r) => ({
      userName: r.user.name,
      email: r.user.email,
      rating: r.rating,
    })),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));