const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from both backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.join(__dirname, '..');
const JWT_SECRET = process.env.JWT_SECRET || 'yourchoice_default_fallback_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Data Store (Active when MongoDB is not connected)
const inMemory = {
  users: [],
  admins: [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10),
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      _id: 'ord_sample_101',
      name: 'Kofi Mensah',
      email: 'kofi@example.com',
      phone: '+233 24 123 4567',
      address: 'East Legon, Accra',
      items: [
        { name: 'HP Pavilion 15 Student Laptop', price: 4500, quantity: 1 },
        { name: 'Wireless Ergonomic Mouse', price: 150, quantity: 1 }
      ],
      total: 4650,
      status: 'Processing',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'ord_sample_102',
      name: 'Ama Osei',
      email: 'ama@example.com',
      phone: '+233 20 987 6543',
      address: 'Kumasi Central, Ashanti Region',
      items: [
        { name: 'USB-C Multi-Port Hub', price: 280, quantity: 2 }
      ],
      total: 560,
      status: 'Pending',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  contactMessages: [
    {
      _id: 'msg_sample_101',
      name: 'Kwame Boateng',
      email: 'kwame@example.com',
      subject: 'Order Status & Tracking',
      message: 'Hello YourChoice team, I would like to confirm the estimated arrival date for my delivery to East Legon. Thank you!',
      status: 'New',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

app.inMemory = inMemory;

// Order Schema
const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  total: Number,
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  userId: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model('Admin', adminSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  cart: { type: Array, default: [] },
  wishlist: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  status: { type: String, default: 'New', enum: ['New', 'Read', 'Replied'] },
  createdAt: { type: Date, default: Date.now },
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

let isMongoConnected = false;

// Authenticate Admin Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid token' });
  }
}

// Create or verify initial admin user with salted bcrypt hash
async function createInitialAdmin() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(initialPassword, 10);
      const admin = new Admin({ username: adminUsername, password: hashedPassword });
      await admin.save();
      console.log(`✅ Initial admin user '${adminUsername}' created with salted bcrypt hash in MongoDB`);
    } else {
      // Auto-migrate legacy plaintext password if it isn't a bcrypt hash yet
      if (!existingAdmin.password.startsWith('$2a$') && !existingAdmin.password.startsWith('$2b$')) {
        existingAdmin.password = await bcrypt.hash(existingAdmin.password, 10);
        await existingAdmin.save();
        console.log(`🔒 Existing admin '${adminUsername}' password securely migrated to bcrypt hash`);
      } else {
        console.log(`✅ Admin user '${adminUsername}' verified in MongoDB (bcrypt hashed)`);
      }
    }
  } catch (err) {
    console.error('❌ Error creating initial admin in MongoDB:', err);
  }
}

const targetDbName = process.env.MONGODB_DB_NAME || 'yourchoice';

// Synchronize legacy records from the default 'test' database into the dedicated target database
async function syncLegacyTestData() {
  try {
    if (!mongoose.connection || !mongoose.connection.client) return;
    const currentDbName = mongoose.connection.name;
    if (currentDbName === 'test') return;

    const targetDb = mongoose.connection.db;
    const testDb = mongoose.connection.client.db('test');

    // 1. Sync legacy orders from 'test' into target DB without duplicating existing records
    const testOrders = await testDb.collection('orders').find({}).toArray();
    if (testOrders.length > 0) {
      const existingTargetIds = new Set(
        (await targetDb.collection('orders').find({}, { projection: { _id: 1 } }).toArray())
          .map(doc => doc._id.toString())
      );
      const missingOrders = testOrders.filter(doc => !existingTargetIds.has(doc._id.toString()));
      if (missingOrders.length > 0) {
        await targetDb.collection('orders').insertMany(missingOrders);
        console.log(`📦 Merged ${missingOrders.length} legacy orders from 'test' into '${currentDbName}' database`);
      }
    }

    // 2. Sync legacy users from 'test' into target DB
    const testUsers = await testDb.collection('users').find({}).toArray();
    if (testUsers.length > 0) {
      const existingTargetUsernames = new Set(
        (await targetDb.collection('users').find({}, { projection: { username: 1 } }).toArray())
          .map(u => u.username)
      );
      const missingUsers = testUsers.filter(u => !existingTargetUsernames.has(u.username));
      if (missingUsers.length > 0) {
        await targetDb.collection('users').insertMany(missingUsers);
        console.log(`👥 Merged ${missingUsers.length} legacy users from 'test' into '${currentDbName}' database`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Legacy database sync skipped:', err.message);
  }
}

// MongoDB connection (skip when running tests or if no valid URI provided)
if (process.env.NODE_ENV !== 'test') {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI && mongoURI.trim() !== '' && !mongoURI.includes('your-mongodb-connection-string')) {
    mongoose.set('bufferCommands', false);
    mongoose.connect(mongoURI, {
      dbName: targetDbName,
      serverSelectionTimeoutMS: 5000
    })
      .then(async () => {
        isMongoConnected = true;
        const activeDb = mongoose.connection.name || targetDbName;
        console.log(`✅ MongoDB connected to database: '${activeDb}'`);
        await syncLegacyTestData();
        await createInitialAdmin();
      })
      .catch((err) => {
        isMongoConnected = false;
        console.warn('⚠️ MongoDB not connected — running in-memory fallback store:', err.message);
      });
  } else {
    console.log('ℹ️ Running with in-memory store (instant setup, no external DB required)');
  }
}

// ========================================================
// DEFENSIVE INPUT VALIDATION & CONTEXTUAL SANITIZATION HELPERS
// ========================================================

// Type-safe string check enforcing length boundaries
function isValidString(val, minLen = 1, maxLen = 255) {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
}

// RFC 5322-compliant email validator
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

// Safe phone number validator (allows Ghana and international formats)
function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  return trimmed.length >= 7 && trimmed.length <= 25 && /^[+]?[\d\s\-()]{7,25}$/.test(trimmed);
}

// Escapes special regex characters before passing into MongoDB $regex queries to prevent ReDoS / injection
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validates order items array ensuring valid types and positive prices/quantities
function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return { valid: false, error: 'Order must contain between 1 and 100 items.' };
  }

  const sanitizedItems = [];
  let calculatedTotal = 0;

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    if (!it || typeof it !== 'object') {
      return { valid: false, error: `Invalid item structure at index ${idx}.` };
    }
    if (!isValidString(it.name, 1, 150)) {
      return { valid: false, error: `Invalid item name at index ${idx}.` };
    }
    const qty = Number(it.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return { valid: false, error: `Item "${it.name}" quantity must be an integer between 1 and 100.` };
    }
    const price = Number(it.price);
    if (isNaN(price) || price < 0 || price > 1000000) {
      return { valid: false, error: `Item "${it.name}" has an invalid price.` };
    }

    sanitizedItems.push({
      id: it.id ? String(it.id).substring(0, 50) : '',
      name: it.name.trim(),
      quantity: qty,
      price: Math.round(price * 100) / 100
    });
    calculatedTotal += price * qty;
  }

  return {
    valid: true,
    items: sanitizedItems,
    calculatedTotal: Math.round(calculatedTotal * 100) / 100
  };
}

// Helper: merge guest cart items into existing cart (adding quantities for matching items)
function mergeCarts(existingCart = [], incomingCart = []) {
  const merged = Array.isArray(existingCart) ? existingCart.map(item => ({ ...item })) : [];
  if (!Array.isArray(incomingCart)) return merged;

  for (const item of incomingCart) {
    if (!item || !item.name) continue;
    const existingIndex = merged.findIndex(i => (item.id && i.id === item.id) || i.name === item.name);
    if (existingIndex >= 0) {
      const currentQty = Number(merged[existingIndex].quantity) || 1;
      const incomingQty = Number(item.quantity) || 1;
      merged[existingIndex].quantity = currentQty + incomingQty;
    } else {
      merged.push({
        id: item.id || '',
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: item.image || (item.images && item.images[0]) || '',
        currency: item.currency || 'GH₵'
      });
    }
  }
  return merged;
}

// Helper: merge guest wishlist into user wishlist (deduplicating by id or name)
function mergeWishlists(existingWishlist = [], incomingWishlist = []) {
  const merged = Array.isArray(existingWishlist) ? existingWishlist.map(item => ({ ...item })) : [];
  if (!Array.isArray(incomingWishlist)) return merged;

  for (const item of incomingWishlist) {
    if (!item) continue;
    const itemId = item.id || item._id;
    const itemName = item.name;
    const exists = merged.some(i => (itemId && i.id === itemId) || (itemName && i.name === itemName));
    if (!exists) {
      merged.push({
        id: itemId || '',
        name: itemName || 'Saved Item',
        price: Number(item.price) || 0,
        image: item.image || (item.images && item.images[0]) || '',
        currency: item.currency || 'GH₵'
      });
    }
  }
  return merged;
}

// User registration endpoint (supports optional guest cart & wishlist seed)
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, name, phone, address, guestCart, guestWishlist } = req.body || {};

    // Boundary Validation
    if (!isValidString(username, 3, 40)) {
      return res.status(400).json({ error: 'Username must be between 3 and 40 characters.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!isValidString(password, 6, 128)) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
    }
    if (!isValidString(name, 2, 80)) {
      return res.status(400).json({ error: 'Full name must be between 2 and 80 characters.' });
    }
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }
    if (address && !isValidString(address, 3, 200)) {
      return res.status(400).json({ error: 'Delivery address must be under 200 characters.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : '';
    const cleanAddress = address ? address.trim() : '';

    // Salted bcrypt password hash before storage (OWASP best practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    const initialCart = mergeCarts([], guestCart);
    const initialWishlist = mergeWishlists([], guestWishlist);

    if (isMongoConnected) {
      const existingUser = await User.findOne({
        $or: [
          { email: cleanEmail },
          { username: cleanUsername }
        ]
      });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email or username already exists.' });
      }
      const user = new User({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        cart: initialCart,
        wishlist: initialWishlist
      });
      await user.save();
      return res.status(201).json({
        message: 'User registered successfully!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          cart: user.cart || [],
          wishlist: user.wishlist || []
        }
      });
    }

    // In-memory fallback
    const exists = inMemory.users.find(u =>
      (u.username && u.username.toLowerCase() === cleanUsername.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === cleanEmail)
    );
    if (exists) {
      return res.status(400).json({ error: 'User with this email or username already exists.' });
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      name: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
      cart: initialCart,
      wishlist: initialWishlist,
      createdAt: new Date().toISOString()
    };
    inMemory.users.push(newUser);
    return res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address,
        cart: newUser.cart,
        wishlist: newUser.wishlist
      }
    });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// User login endpoint (merges guest cart and wishlist if provided)
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password, guestCart, guestWishlist } = req.body || {};
    if (!isValidString(username, 1, 100) || !isValidString(password, 1, 128)) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    const cleanUsername = username.trim();

    if (isMongoConnected) {
      const user = await User.findOne({ 
        $or: [
          { username: cleanUsername },
          { email: cleanUsername.toLowerCase() }
        ] 
      });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      // Verify bcrypt hash with auto-migration for legacy accounts
      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (user.password === password);
        if (isMatch) {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        }
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if ((Array.isArray(guestCart) && guestCart.length > 0) || (Array.isArray(guestWishlist) && guestWishlist.length > 0)) {
        user.cart = mergeCarts(user.cart || [], guestCart);
        user.wishlist = mergeWishlists(user.wishlist || [], guestWishlist);
        await user.save();
      }

      return res.json({
        message: 'Login successful!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          cart: user.cart || [],
          wishlist: user.wishlist || []
        }
      });
    }

    // In-memory fallback
    const user = inMemory.users.find(u => 
      (u.username && u.username.toLowerCase() === cleanUsername.toLowerCase()) || 
      (u.email && u.email.toLowerCase() === cleanUsername.toLowerCase())
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if ((Array.isArray(guestCart) && guestCart.length > 0) || (Array.isArray(guestWishlist) && guestWishlist.length > 0)) {
      user.cart = mergeCarts(user.cart || [], guestCart);
      user.wishlist = mergeWishlists(user.wishlist || [], guestWishlist);
    }

    return res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        cart: user.cart || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Dedicated endpoint to synchronize guest cart & wishlist into an existing user account
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, email, guestCart, guestWishlist } = req.body || {};
    const safeUserId = typeof userId === 'string' ? userId.trim() : '';
    const safeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!safeUserId && !safeEmail) {
      return res.status(400).json({ error: 'Valid user identifier (userId or email) required for synchronization.' });
    }

    if (isMongoConnected) {
      const orConditions = [];
      if (safeUserId) {
        orConditions.push({ _id: safeUserId });
        if (mongoose.Types.ObjectId.isValid(safeUserId)) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(safeUserId) });
        }
      }
      if (safeEmail && isValidEmail(safeEmail)) {
        orConditions.push({ email: { $regex: new RegExp(`^${escapeRegex(safeEmail)}$`, 'i') } });
      }
      const user = await User.findOne(orConditions.length > 1 ? { $or: orConditions } : orConditions[0]);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      user.cart = mergeCarts(user.cart || [], guestCart);
      user.wishlist = mergeWishlists(user.wishlist || [], guestWishlist);
      await user.save();

      return res.json({
        message: 'Cart and wishlist synchronized successfully',
        cart: user.cart,
        wishlist: user.wishlist
      });
    }

    // In-memory fallback
    const user = inMemory.users.find(u =>
      (safeUserId && (u.id === safeUserId || u._id === safeUserId)) ||
      (safeEmail && u.email && u.email.toLowerCase() === safeEmail)
    );

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.cart = mergeCarts(user.cart || [], guestCart);
    user.wishlist = mergeWishlists(user.wishlist || [], guestWishlist);

    return res.json({
      message: 'Cart and wishlist synchronized successfully',
      cart: user.cart,
      wishlist: user.wishlist
    });
  } catch (err) {
    console.error('Cart & Wishlist sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize items.' });
  }
});

// Retrieve an authenticated user's current saved cart and wishlist
app.get('/api/user/cart-wishlist', async (req, res) => {
  try {
    const rawUserId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
    const rawEmail = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    if (!rawUserId && !rawEmail) {
      return res.status(400).json({ error: 'userId or email query parameter required.' });
    }

    if (isMongoConnected) {
      const orConditions = [];
      if (rawUserId) {
        orConditions.push({ _id: rawUserId });
        if (mongoose.Types.ObjectId.isValid(rawUserId)) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(rawUserId) });
        }
      }
      if (rawEmail && isValidEmail(rawEmail)) {
        orConditions.push({ email: { $regex: new RegExp(`^${escapeRegex(rawEmail)}$`, 'i') } });
      }
      const user = await User.findOne(orConditions.length > 1 ? { $or: orConditions } : orConditions[0]);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json({
        cart: user.cart || [],
        wishlist: user.wishlist || []
      });
    }

    const user = inMemory.users.find(u =>
      (rawUserId && (u.id === rawUserId || u._id === rawUserId)) ||
      (rawEmail && u.email && u.email.toLowerCase() === rawEmail)
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      cart: user.cart || [],
      wishlist: user.wishlist || []
    });
  } catch (err) {
    console.error('Get cart & wishlist error:', err);
    res.status(500).json({ error: 'Failed to retrieve saved items.' });
  }
});

// Update an authenticated user's cart and wishlist directly (e.g. real-time background autosave)
app.post('/api/user/cart-wishlist', async (req, res) => {
  try {
    const { userId, email, cart, wishlist } = req.body || {};
    const safeUserId = typeof userId === 'string' ? userId.trim() : '';
    const safeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!safeUserId && !safeEmail) {
      return res.status(400).json({ error: 'userId or email required.' });
    }

    const safeCart = Array.isArray(cart) ? cart.slice(0, 100) : [];
    const safeWishlist = Array.isArray(wishlist) ? wishlist.slice(0, 100) : [];

    if (isMongoConnected) {
      const orConditions = [];
      if (safeUserId) {
        orConditions.push({ _id: safeUserId });
        if (mongoose.Types.ObjectId.isValid(safeUserId)) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(safeUserId) });
        }
      }
      if (safeEmail && isValidEmail(safeEmail)) {
        orConditions.push({ email: { $regex: new RegExp(`^${escapeRegex(safeEmail)}$`, 'i') } });
      }
      const user = await User.findOne(orConditions.length > 1 ? { $or: orConditions } : orConditions[0]);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      if (Array.isArray(cart)) user.cart = safeCart;
      if (Array.isArray(wishlist)) user.wishlist = safeWishlist;
      await user.save();
      return res.json({ success: true, cart: user.cart, wishlist: user.wishlist });
    }

    const user = inMemory.users.find(u =>
      (safeUserId && (u.id === safeUserId || u._id === safeUserId)) ||
      (safeEmail && u.email && u.email.toLowerCase() === safeEmail)
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (Array.isArray(cart)) user.cart = safeCart;
    if (Array.isArray(wishlist)) user.wishlist = safeWishlist;
    return res.json({ success: true, cart: user.cart, wishlist: user.wishlist });
  } catch (err) {
    console.error('Save cart & wishlist error:', err);
    res.status(500).json({ error: 'Failed to update items.' });
  }
});

// Get user's orders by route param
app.get('/api/users/:userId/orders', async (req, res) => {
  try {
    const rawUserId = typeof req.params.userId === 'string' ? req.params.userId.trim() : '';
    const emailParam = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

    if (isMongoConnected) {
      const orConditions = [];
      if (rawUserId) {
        orConditions.push({ userId: rawUserId });
        if (mongoose.Types.ObjectId.isValid(rawUserId)) {
          orConditions.push({ userId: new mongoose.Types.ObjectId(rawUserId) });
        }
      }
      if (emailParam && isValidEmail(emailParam)) {
        orConditions.push({ email: { $regex: new RegExp(`^${escapeRegex(emailParam)}$`, 'i') } });
      }
      const filter = orConditions.length > 1 ? { $or: orConditions } : (orConditions[0] || {});
      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = inMemory.orders.filter(o => 
      (rawUserId && o.userId === rawUserId) || (emailParam && o.email && o.email.toLowerCase() === emailParam)
    );
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Dedicated customer orders endpoint: GET /api/user/orders?userId=...&email=...
app.get('/api/user/orders', async (req, res) => {
  try {
    const rawUserId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
    const rawEmail = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    if (!rawUserId && !rawEmail) {
      return res.status(400).json({ error: 'User identifier or email required.' });
    }

    if (isMongoConnected) {
      const orConditions = [];
      if (rawUserId) {
        orConditions.push({ userId: rawUserId });
        if (mongoose.Types.ObjectId.isValid(rawUserId)) {
          orConditions.push({ userId: new mongoose.Types.ObjectId(rawUserId) });
        }
      }
      if (rawEmail && isValidEmail(rawEmail)) {
        orConditions.push({ email: { $regex: new RegExp(`^${escapeRegex(rawEmail)}$`, 'i') } });
      }
      const query = orConditions.length > 1 ? { $or: orConditions } : (orConditions[0] || {});
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json(orders);
    }

    // In-memory fallback
    const orders = inMemory.orders.filter(o => {
      const matchId = rawUserId && o.userId === rawUserId;
      const matchEmail = rawEmail && o.email && o.email.toLowerCase() === rawEmail;
      return matchId || matchEmail;
    });
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// Place order endpoint with full boundary validation
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, address, items, total, userId } = req.body || {};

    if (!isValidString(name, 2, 80)) {
      return res.status(400).json({ error: 'Customer name is required (2-80 characters).' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }
    if (!isValidString(address, 5, 250)) {
      return res.status(400).json({ error: 'Delivery address is required (5-250 characters).' });
    }

    const itemsValidation = validateOrderItems(items);
    if (!itemsValidation.valid) {
      return res.status(400).json({ error: itemsValidation.error });
    }

    const submittedTotal = Number(total);
    if (isNaN(submittedTotal) || submittedTotal < 0) {
      return res.status(400).json({ error: 'Invalid order total.' });
    }

    // Enforce total authenticity against verified items calculation
    const orderTotal = Math.abs(submittedTotal - itemsValidation.calculatedTotal) > 0.05
      ? itemsValidation.calculatedTotal
      : Math.round(submittedTotal * 100) / 100;

    const cleanUserId = (typeof userId === 'string' && userId.trim()) ? userId.trim().substring(0, 60) : null;

    if (isMongoConnected) {
      const orderData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        items: itemsValidation.items,
        total: orderTotal
      };
      if (cleanUserId) orderData.userId = cleanUserId;
      const order = new Order(orderData);
      await order.save();
      return res.status(201).json({ 
        message: 'Order placed successfully!', 
        orderId: order._id,
        status: order.status || 'Pending' 
      });
    }

    // In-memory fallback
    const newOrder = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      items: itemsValidation.items,
      total: orderTotal,
      status: 'Pending',
      userId: cleanUserId,
      createdAt: new Date().toISOString()
    };
    inMemory.orders.unshift(newOrder);
    res.status(201).json({ 
      message: 'Order placed successfully!', 
      orderId: newOrder._id,
      status: newOrder.status 
    });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// Submit customer contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!isValidString(name, 2, 100)) {
      return res.status(400).json({ success: false, error: 'Name is required (2-100 characters).' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    if (!isValidString(message, 5, 3000)) {
      return res.status(400).json({ success: false, error: 'Message must be between 5 and 3000 characters long.' });
    }
    if (subject !== undefined && subject !== null && !isValidString(subject, 1, 150)) {
      return res.status(400).json({ success: false, error: 'Subject must be under 150 characters.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = (subject && typeof subject === 'string' && subject.trim()) ? subject.trim() : 'General Inquiry';
    const cleanMessage = message.trim();

    if (isMongoConnected) {
      const contactRecord = new ContactMessage({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'New'
      });
      await contactRecord.save();
      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Your message has been received.',
        inquiryId: contactRecord._id,
        createdAt: contactRecord.createdAt
      });
    }

    // In-memory fallback
    const newInquiry = {
      _id: 'msg_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'New',
      createdAt: new Date().toISOString()
    };
    inMemory.contactMessages.unshift(newInquiry);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received.',
      inquiryId: newInquiry._id,
      createdAt: newInquiry.createdAt
    });
  } catch (err) {
    console.error('Contact message submission error:', err);
    res.status(500).json({ success: false, error: 'Failed to process inquiry. Please try again.' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!isValidString(username, 1, 100) || !isValidString(password, 1, 128)) {
      return res.status(400).json({ success: false, message: 'Valid username and password required' });
    }

    const cleanUsername = username.trim();
    let adminUser = null;
    let passwordHash = null;

    if (isMongoConnected) {
      adminUser = await Admin.findOne({ username: cleanUsername });
      if (adminUser) {
        passwordHash = adminUser.password;
      }
    } else {
      adminUser = inMemory.admins.find(a => a.username === cleanUsername);
      if (adminUser) {
        passwordHash = adminUser.password;
      }
    }

    if (!adminUser || !passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password with bcrypt (supports auto-migration if legacy plaintext)
    let isMatch = false;
    if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, passwordHash);
    } else {
      isMatch = (password === passwordHash);
      if (isMatch && isMongoConnected) {
        adminUser.password = await bcrypt.hash(password, 10);
        await adminUser.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Issue signed JWT
    const token = jwt.sign(
      { id: adminUser._id || adminUser.username, username: adminUser.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { username: adminUser.username }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Login failed due to a server error' });
  }
});

// Create admin user endpoint (Protected: only authenticated admins can create admins)
app.post('/api/admin/create', authenticateAdmin, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!isValidString(username, 3, 50)) {
      return res.status(400).json({ success: false, message: 'Admin username must be between 3 and 50 characters' });
    }
    if (!isValidString(password, 6, 128)) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters' });
    }

    const cleanUsername = username.trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected) {
      const existingAdmin = await Admin.findOne({ username: cleanUsername });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'An admin with this username already exists' });
      }
      const admin = new Admin({ username: cleanUsername, password: hashedPassword, createdAt: new Date() });
      await admin.save();
      return res.status(201).json({
        success: true,
        message: 'Administrator created successfully',
        admin: { username: admin.username, createdAt: admin.createdAt }
      });
    }

    // In-memory fallback
    if (inMemory.admins.some(a => a.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'An admin with this username already exists' });
    }
    const newAdmin = { username: cleanUsername, password: hashedPassword, createdAt: new Date().toISOString() };
    inMemory.admins.push(newAdmin);
    res.status(201).json({
      success: true,
      message: 'Administrator created successfully',
      admin: { username: newAdmin.username, createdAt: newAdmin.createdAt }
    });
  } catch (err) {
    console.error('Admin creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to create administrator' });
  }
});

// Get all admin accounts (Protected: authenticated admins only, excludes passwords)
app.get('/api/admin/admins', authenticateAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const admins = await Admin.find({}, { password: 0 }).sort({ createdAt: -1 });
      return res.json(admins);
    }
    // In-memory fallback (sanitized: never send password hashes)
    const sanitizedAdmins = inMemory.admins.map(a => ({
      username: a.username,
      createdAt: a.createdAt || new Date().toISOString()
    }));
    res.json(sanitizedAdmins);
  } catch (err) {
    console.error('Error fetching admin accounts:', err);
    res.status(500).json({ error: 'Failed to fetch admin accounts' });
  }
});

// Get all orders (Protected: admin only)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }
    res.json(inMemory.orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (Protected: admin only)
app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!id || typeof id !== 'string' || id.trim().length === 0 || id.length > 100) {
      return res.status(400).json({ error: 'Valid order ID required.' });
    }
    if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid order status. Allowed values: ${validStatuses.join(', ')}` });
    }

    const cleanId = id.trim();
    if (isMongoConnected) {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        order = await Order.findByIdAndUpdate(cleanId, { status }, { new: true });
      }
      if (!order) {
        // Fallback to checking in-memory orders if hybrid or seed order
        const memOrder = inMemory.orders.find(o => o._id === cleanId);
        if (memOrder) {
          memOrder.status = status;
          return res.json(memOrder);
        }
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.json(order);
    }

    const order = inMemory.orders.find(o => o._id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.status = status;
    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get dashboard stats (Protected: admin only)
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const pendingOrders = await Order.countDocuments({ status: 'Pending' });
      return res.json({
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders
      });
    }

    const totalOrders = inMemory.orders.length;
    const totalRevenue = inMemory.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = inMemory.orders.filter(o => o.status === 'Pending').length;
    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all customer contact messages (Protected: admin only)
app.get('/api/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      return res.json(messages);
    }
    res.json(inMemory.contactMessages || []);
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    res.status(500).json({ error: 'Failed to fetch customer messages.' });
  }
});

// Update customer message status (Protected: admin only)
app.patch('/api/admin/messages/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const validStatuses = ['New', 'Read', 'Replied'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Allowed values: New, Read, Replied' });
    }

    if (isMongoConnected) {
      let msg = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        msg = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
      }
      if (!msg) {
        const memMsg = (inMemory.contactMessages || []).find(m => m._id === id);
        if (memMsg) {
          memMsg.status = status;
          return res.json(memMsg);
        }
        return res.status(404).json({ error: 'Message not found' });
      }
      return res.json(msg);
    }

    const msg = (inMemory.contactMessages || []).find(m => m._id === id);
    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }
    msg.status = status;
    res.json(msg);
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ error: 'Failed to update message status.' });
  }
});

// Serve static frontend files from parent directory
app.use(express.static(rootDir, { index: false }));

// Health check route exposing connection and database status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'connected' : 'in-memory-fallback',
    dbName: isMongoConnected ? (mongoose.connection.name || targetDbName) : 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// Root route: serves index.html for web requests, and health text for API/tests
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.sendFile(path.join(rootDir, 'index.html'));
  }
  res.send('YourChoice backend is running.');
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Only start server when this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;