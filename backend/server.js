const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

// Import static product catalog from ./src/assets/products.js (or fallback /src/products.js)
let staticProducts = [];
try {
  const imported = require(path.resolve(__dirname, '../src/assets/products.js'));
  staticProducts = Array.isArray(imported) ? imported : (imported.products || []);
} catch {
  try {
    const fallback = require(path.resolve(__dirname, '../src/products.js'));
    staticProducts = Array.isArray(fallback) ? fallback : (fallback.products || []);
  } catch (err) {
    console.warn('⚠️ Could not load static products catalog:', err.message);
  }
}

// Load environment variables from both backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

// Import Ghana validation & localization utility
const GhanaValidation = require(path.resolve(__dirname, '../ghana-validation.js'));

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
  products: staticProducts.map(p => ({
    productSku: p.id,
    stock: typeof p.stock === 'number' ? p.stock : 10,
    totalSales: 0
  })),
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
  phoneNetwork: { type: String },
  deliveryRegion: { type: String },
  deliveryTown: { type: String },
  deliveryLandmark: { type: String },
  deliveryGps: { type: String },
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
  phoneNetwork: { type: String },
  deliveryRegion: { type: String },
  deliveryTown: { type: String },
  deliveryLandmark: { type: String },
  deliveryGps: { type: String },
  address: { type: String },
  cart: { type: Array, default: [] },
  wishlist: { type: Array, default: [] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
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

// ========================================
// 1. PRODUCT SCHEMA DEFINITION
// ========================================
// Decoupled dynamic metrics: stock levels & sales counts living in MongoDB
const productSchema = new mongoose.Schema({
  productSku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  stock: {
    type: Number,
    default: 10,
    min: [0, 'Stock cannot be negative']
  },
  totalSales: {
    type: Number,
    default: 0,
    min: [0, 'Total sales cannot be negative']
  }
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

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

// Authenticate Customer Middleware (Requires valid customer or admin token for database-modifying actions)
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in to complete your order.' });
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid authentication token.' });
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

// ========================================
// 2. IDEMPOTENT STARTUP SYNCHRONIZATION (THE SEED ENGINE)
// ========================================
async function seedProducts() {
  try {
    if (!isMongoConnected) {
      if (!inMemory.products || inMemory.products.length === 0) {
        inMemory.products = staticProducts.map(item => ({
          productSku: item.id,
          stock: typeof item.stock === 'number' ? item.stock : 10,
          totalSales: 0
        }));
      }
      return;
    }

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 Product collection is empty. Seeding initial catalog metrics...');
      const seedDocs = staticProducts.map(item => ({
        productSku: item.id,
        stock: typeof item.stock === 'number' ? item.stock : 10,
        totalSales: 0
      }));
      if (seedDocs.length > 0) {
        await Product.insertMany(seedDocs, { ordered: false });
        console.log(`✅ Successfully seeded ${seedDocs.length} products into MongoDB.`);
      }
    } else {
      // Collection already has data: bulkWrite to insert any new static items without modifying active stock
      const bulkOps = staticProducts.map(item => ({
        updateOne: {
          filter: { productSku: item.id },
          update: {
            $setOnInsert: {
              productSku: item.id,
              stock: typeof item.stock === 'number' ? item.stock : 10,
              totalSales: 0
            }
          },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        const result = await Product.bulkWrite(bulkOps, { ordered: false });
        if (result.upsertedCount > 0) {
          console.log(`🔄 Bulk synchronized product catalog: ${result.upsertedCount} new products inserted.`);
        } else {
          console.log(`✅ Product catalog in sync: All ${staticProducts.length} static products verified in MongoDB.`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error in product seed engine:', err);
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
        await seedProducts();
      })
      .catch((err) => {
        isMongoConnected = false;
        console.warn('⚠️ MongoDB not connected — running in-memory fallback store:', err.message);
        seedProducts();
      });
  } else {
    console.log('ℹ️ Running with in-memory store (instant setup, no external DB required)');
    seedProducts();
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

// Safe phone number validator (validates Ghana NCA telecom prefixes & international formats)
function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const result = GhanaValidation.parseGhanaPhone(phone);
  return result.isValid;
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
    const {
      username,
      email,
      password,
      name,
      phone,
      address,
      deliveryRegion,
      deliveryTown,
      deliveryLandmark,
      deliveryGps,
      guestCart,
      guestWishlist
    } = req.body || {};

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

    let parsedPhoneData = null;
    if (phone) {
      parsedPhoneData = GhanaValidation.parseGhanaPhone(phone);
      if (!parsedPhoneData.isValid) {
        return res.status(400).json({ error: parsedPhoneData.error || 'Please provide a valid phone number.' });
      }
    }

    let cleanRegion = deliveryRegion ? String(deliveryRegion).trim() : '';
    let cleanTown = deliveryTown ? String(deliveryTown).trim() : '';
    let cleanLandmark = deliveryLandmark ? String(deliveryLandmark).trim() : '';
    let cleanGps = deliveryGps ? String(deliveryGps).trim() : '';
    let cleanAddress = address ? String(address).trim() : '';

    if (cleanRegion || cleanTown || cleanLandmark) {
      const addrValidation = GhanaValidation.validateGhanaAddress({
        region: cleanRegion,
        town: cleanTown,
        landmark: cleanLandmark,
        gps: cleanGps
      });
      if (!addrValidation.isValid) {
        const firstErr = Object.values(addrValidation.errors)[0];
        return res.status(400).json({ error: firstErr || 'Invalid delivery address details.' });
      }
      cleanRegion = addrValidation.values.region;
      cleanTown = addrValidation.values.town;
      cleanLandmark = addrValidation.values.landmark;
      cleanGps = addrValidation.values.gps;
      if (!cleanAddress) {
        cleanAddress = addrValidation.values.formattedAddress;
      }
    } else if (cleanAddress && !isValidString(cleanAddress, 3, 250)) {
      return res.status(400).json({ error: 'Delivery address must be under 200 characters.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = parsedPhoneData ? (parsedPhoneData.localFormat || phone.trim()) : (phone ? phone.trim() : '');
    const phoneNetwork = parsedPhoneData ? parsedPhoneData.network : null;

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
        phoneNetwork: phoneNetwork,
        deliveryRegion: cleanRegion,
        deliveryTown: cleanTown,
        deliveryLandmark: cleanLandmark,
        deliveryGps: cleanGps,
        address: cleanAddress,
        cart: initialCart,
        wishlist: initialWishlist
      });
      await user.save();
      const token = jwt.sign(
        { id: user._id.toString(), username: user.username, email: user.email, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          phoneNetwork: user.phoneNetwork,
          deliveryRegion: user.deliveryRegion,
          deliveryTown: user.deliveryTown,
          deliveryLandmark: user.deliveryLandmark,
          deliveryGps: user.deliveryGps,
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
      phoneNetwork: phoneNetwork,
      deliveryRegion: cleanRegion,
      deliveryTown: cleanTown,
      deliveryLandmark: cleanLandmark,
      deliveryGps: cleanGps,
      address: cleanAddress,
      cart: initialCart,
      wishlist: initialWishlist,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date().toISOString()
    };
    inMemory.users.push(newUser);
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        phoneNetwork: newUser.phoneNetwork,
        deliveryRegion: newUser.deliveryRegion,
        deliveryTown: newUser.deliveryTown,
        deliveryLandmark: newUser.deliveryLandmark,
        deliveryGps: newUser.deliveryGps,
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

      const token = jwt.sign(
        { id: user._id.toString(), username: user.username, email: user.email, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          phoneNetwork: user.phoneNetwork || null,
          deliveryRegion: user.deliveryRegion || '',
          deliveryTown: user.deliveryTown || '',
          deliveryLandmark: user.deliveryLandmark || '',
          deliveryGps: user.deliveryGps || '',
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

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phoneNetwork: user.phoneNetwork || null,
        deliveryRegion: user.deliveryRegion || '',
        deliveryTown: user.deliveryTown || '',
        deliveryLandmark: user.deliveryLandmark || '',
        deliveryGps: user.deliveryGps || '',
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

// ========================================================
// PASSWORD RESET WORKFLOW (Nodemailer, Crypto Token & Bcrypt)
// ========================================================

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Clean and normalize SMTP host string (strips protocol prefixes, colons, slashes and auto-corrects provider hosts)
function normalizeSmtpHost(rawHost) {
  if (!rawHost || typeof rawHost !== 'string') return '';
  let host = rawHost.trim();
  // Strip surrounding quotes
  host = host.replace(/^["']|["']$/g, '').trim();

  // Strip any protocol or scheme prefix (e.g., https://, http://, smtp://, smtps://, ://, //)
  while (/^[a-zA-Z0-9+.-]*:?\/\/|^[:/]+/.test(host)) {
    host = host.replace(/^[a-zA-Z0-9+.-]*:?\/\//, '').replace(/^[:/]+/, '').trim();
  }

  // Strip any URL path, query string, or hash
  host = host.split('/')[0].split('?')[0].split('#')[0].trim();

  // Strip port if attached to hostname
  if (host.includes(':')) {
    const parts = host.split(':');
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
      host = parts[0];
    }
  }

  // Strip trailing slashes or colons
  host = host.replace(/[/:]+$/, '').trim();

  // Auto-normalize known email provider SMTP hosts
  const lower = host.toLowerCase();
  if (lower === 'resend.com' || lower === 'api.resend.com' || lower.endsWith('.resend.com')) {
    return 'smtp.resend.com';
  }
  if (lower === 'brevo.com' || lower.endsWith('.brevo.com') || lower.includes('sendinblue')) {
    return 'smtp-relay.brevo.com';
  }
  if (lower === 'gmail.com') {
    return 'smtp.gmail.com';
  }
  if (lower === 'sendgrid.com' || lower === 'sendgrid.net') {
    return 'smtp.sendgrid.net';
  }
  if (lower === 'mailgun.org' || lower === 'mailgun.com') {
    return 'smtp.mailgun.org';
  }
  return host;
}

// Dispatches clean branded HTML password reset email via Nodemailer SMTP with console fallback
async function sendPasswordResetEmail({ toEmail, resetUrl, userName }) {
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_FROM || '"YourChoice Support" <no-reply@yourchoice.com>';
  const safeName = escapeHtml(userName || 'Customer');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - YourChoice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .wrapper { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 36px 28px; }
    .brand { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 24px; }
    .heading { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 16px; }
    .paragraph { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 13px 28px; border-radius: 8px; }
    .url-box { font-size: 12px; word-break: break-all; color: #60a5fa; background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 20px; }
    .footer { font-size: 13px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #334155; padding-top: 18px; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="brand">YourChoice</div>
    <div class="heading">Password Reset Request</div>
    <p class="paragraph">Hello ${safeName},</p>
    <p class="paragraph">We received a request to reset the password for your YourChoice account. Click the button below to choose a new password. For your security, this link is valid for <strong>15 minutes</strong>.</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">Reset Password</a>
    </div>
    <p class="paragraph" style="font-size: 13px; color: #94a3b8;">If you are having trouble clicking the button, copy and paste this link into your browser:</p>
    <div class="url-box">${resetUrl}</div>
    <div class="footer">
      <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  </div>
</body>
</html>`;

  // 1. Try real SMTP email dispatch if SMTP credentials and nodemailer are available
  const rawHost = process.env.SMTP_HOST || '';
  const cleanHost = normalizeSmtpHost(rawHost);
  const smtpUser = process.env.SMTP_USER || (cleanHost === 'smtp.resend.com' && process.env.SMTP_PASS ? 'resend' : '');
  const smtpPass = process.env.SMTP_PASS || process.env.RESEND_API_KEY || '';

  if (cleanHost && smtpPass && nodemailer) {
    try {
      const port = parseInt(process.env.SMTP_PORT, 10) || (cleanHost === 'smtp.resend.com' ? 587 : 587);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      const transporter = nodemailer.createTransport({
        host: cleanHost,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: 'Reset Your Password - YourChoice',
        html: htmlContent,
        text: `Reset your YourChoice password using this link (valid for 15 minutes): ${resetUrl}`,
      });

      console.log(`📧 Password reset email dispatched via SMTP (${cleanHost}:${port}) to ${toEmail} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`⚠️ SMTP dispatch error to ${toEmail}:`, smtpErr.message);
    }
  }

  // 2. Resilient Console Fallback (Development, Testing & Easy Verification)
  console.log('════════════════════════════════════════════════════════════');
  console.log(`📧 [MOCK EMAIL SERVICE] Password Reset Email to: ${toEmail}`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log('⏰ Expiration: 15 minutes from request time');
  console.log('════════════════════════════════════════════════════════════');
  return { success: true, simulated: true, resetUrl };
}

// Generic 200 response to prevent user enumeration
const FORGOT_PASSWORD_GENERIC_RESPONSE = {
  success: true,
  message: 'If that email exists, a reset link has been sent.'
};

// Route 1: Request Password Reset Link (POST /api/auth/forgot-password)
async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Please provide an email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Configurable base domain via APP_URL env variable with fallback to host header
    const domain = (process.env.APP_URL || process.env.CLIENT_URL || 
      (req.headers.host ? `${req.protocol || 'http'}://${req.headers.host}` : 'http://localhost:3000')
    ).replace(/\/+$/, '');

    // Cryptographically secure token using native Node.js crypto
    const token = crypto.randomBytes(32).toString('hex');
    // Exactly 15 minutes from now
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000);

    let userFound = false;
    let targetUserName = '';

    if (isMongoConnected) {
      const user = await User.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') }
      });
      if (user) {
        userFound = true;
        targetUserName = user.name || user.username || '';
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expirationDate;
        await user.save();
      }
    } else {
      const user = inMemory.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (user) {
        userFound = true;
        targetUserName = user.name || user.username || '';
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expirationDate;
      }
    }

    if (userFound) {
      const resetUrl = `${domain}/reset-password?token=${token}`;
      await sendPasswordResetEmail({
        toEmail: cleanEmail,
        resetUrl,
        userName: targetUserName,
      });
    }

    // Always return generic 200 response to prevent user enumeration
    return res.status(200).json(FORGOT_PASSWORD_GENERIC_RESPONSE);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
}

app.post('/api/auth/forgot-password', handleForgotPassword);
app.post('/api/users/forgot-password', handleForgotPassword);

// Optional helper to check token validity before displaying reset form
app.get('/api/auth/verify-token', async (req, res) => {
  try {
    const rawToken = (req.query && req.query.token) || (req.body && req.body.token);
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
      return res.status(400).json({ valid: false, error: 'Token is invalid or has expired.' });
    }

    const cleanToken = rawToken.trim();
    const now = Date.now();
    let user = null;

    if (isMongoConnected) {
      user = await User.findOne({
        resetPasswordToken: cleanToken,
        resetPasswordExpires: { $gt: now }
      });
    } else {
      user = inMemory.users.find(u =>
        u.resetPasswordToken === cleanToken &&
        u.resetPasswordExpires &&
        new Date(u.resetPasswordExpires).getTime() > now
      );
    }

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Token is invalid or has expired.' });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ valid: false, error: 'Failed to verify token.' });
  }
});

// Route 2: Execute Password Reset (POST /api/auth/reset-password)
async function handleResetPassword(req, res) {
  try {
    const token = (req.body && req.body.token) || (req.query && req.query.token);
    const newPassword = req.body && (req.body.newPassword !== undefined ? req.body.newPassword : req.body.password);

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ error: 'Token is invalid or has expired.' });
    }

    if (!isValidString(newPassword, 6, 128)) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
    }

    const cleanToken = token.trim();
    const now = Date.now();

    if (isMongoConnected) {
      // Look up user by matching token AND resetPasswordExpires > Date.now()
      const user = await User.findOne({
        resetPasswordToken: cleanToken,
        resetPasswordExpires: { $gt: now }
      });

      if (!user) {
        return res.status(400).json({ error: 'Token is invalid or has expired.' });
      }

      // Hash new password using existing bcrypt mechanism
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Critical Cleanup: clear token and expiration fields back to null
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully. You may now log in.'
      });
    }

    // In-memory fallback
    const user = inMemory.users.find(u =>
      u.resetPasswordToken === cleanToken &&
      u.resetPasswordExpires &&
      new Date(u.resetPasswordExpires).getTime() > now
    );

    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    // Critical Cleanup: clear token and expiration fields back to null
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You may now log in.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
}

app.post('/api/auth/reset-password', handleResetPassword);
app.post('/api/users/reset-password', handleResetPassword);

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

// Place order endpoint with full boundary validation, Ghana localization and mandatory customer authentication
app.post('/api/orders', authenticateUser, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      deliveryRegion,
      deliveryTown,
      deliveryLandmark,
      deliveryGps,
      items,
      total,
      userId
    } = req.body || {};

    if (!isValidString(name, 2, 80)) {
      return res.status(400).json({ error: 'Customer name is required (2-80 characters).' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const parsedPhoneData = GhanaValidation.parseGhanaPhone(phone);
    if (!parsedPhoneData.isValid) {
      return res.status(400).json({ error: parsedPhoneData.error || 'Please provide a valid phone number.' });
    }

    let cleanRegion = deliveryRegion ? String(deliveryRegion).trim() : '';
    let cleanTown = deliveryTown ? String(deliveryTown).trim() : '';
    let cleanLandmark = deliveryLandmark ? String(deliveryLandmark).trim() : '';
    let cleanGps = deliveryGps ? String(deliveryGps).trim() : '';
    let cleanAddress = address ? String(address).trim() : '';

    if (cleanRegion || cleanTown || cleanLandmark) {
      const addrValidation = GhanaValidation.validateGhanaAddress({
        region: cleanRegion,
        town: cleanTown,
        landmark: cleanLandmark,
        gps: cleanGps
      });
      if (!addrValidation.isValid) {
        const firstErr = Object.values(addrValidation.errors)[0];
        return res.status(400).json({ error: firstErr || 'Invalid delivery address details.' });
      }
      cleanRegion = addrValidation.values.region;
      cleanTown = addrValidation.values.town;
      cleanLandmark = addrValidation.values.landmark;
      cleanGps = addrValidation.values.gps;
      if (!cleanAddress) {
        cleanAddress = addrValidation.values.formattedAddress;
      }
    } else if (!isValidString(cleanAddress, 5, 250)) {
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
    const cleanPhone = parsedPhoneData.localFormat || phone.trim();
    const phoneNetwork = parsedPhoneData.network;

    // ========================================
    // 4. INVENTORY VALIDATION CHECK (DATABASE & IN-MEMORY)
    // ========================================
    if (isMongoConnected) {
      for (const it of itemsValidation.items) {
        const sku = it.id;
        if (!sku) continue;
        const dbProduct = await Product.findOne({ productSku: sku });
        if (dbProduct && dbProduct.stock < it.quantity) {
          return res.status(400).json({ error: 'Item is out of stock' });
        }
      }
    } else if (inMemory.products) {
      for (const it of itemsValidation.items) {
        const sku = it.id;
        if (!sku) continue;
        const memProd = inMemory.products.find(p => p.productSku === sku);
        if (memProd && memProd.stock < it.quantity) {
          return res.status(400).json({ error: 'Item is out of stock' });
        }
      }
    }

    if (isMongoConnected) {
      // Deduct stock using { $inc: { stock: -quantityRequested } } and update sales metrics
      for (const it of itemsValidation.items) {
        const sku = it.id;
        if (!sku) continue;
        await Product.updateOne(
          { productSku: sku },
          { $inc: { stock: -it.quantity, totalSales: it.quantity } }
        );
      }

      const verifiedUserId = cleanUserId || (req.user && req.user.id) || null;
      const verifiedEmail = (req.user && req.user.email) ? req.user.email.toLowerCase() : email.trim().toLowerCase();

      const orderData = {
        name: name.trim(),
        email: verifiedEmail,
        phone: cleanPhone,
        phoneNetwork: phoneNetwork,
        deliveryRegion: cleanRegion,
        deliveryTown: cleanTown,
        deliveryLandmark: cleanLandmark,
        deliveryGps: cleanGps,
        address: cleanAddress,
        items: itemsValidation.items,
        total: orderTotal
      };
      if (verifiedUserId) orderData.userId = verifiedUserId;
      const order = new Order(orderData);
      await order.save();
      return res.status(201).json({ 
        message: 'Order placed successfully!', 
        orderId: order._id,
        status: order.status || 'Pending' 
      });
    }

    // In-memory fallback
    if (inMemory.products) {
      for (const it of itemsValidation.items) {
        const sku = it.id;
        if (!sku) continue;
        const memProd = inMemory.products.find(p => p.productSku === sku);
        if (memProd) {
          memProd.stock -= it.quantity;
          memProd.totalSales = (memProd.totalSales || 0) + it.quantity;
        }
      }
    }

    const verifiedUserId = cleanUserId || (req.user && req.user.id) || null;
    const verifiedEmail = (req.user && req.user.email) ? req.user.email.toLowerCase() : email.trim().toLowerCase();

    const newOrder = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: verifiedEmail,
      phone: cleanPhone,
      phoneNetwork: phoneNetwork,
      deliveryRegion: cleanRegion,
      deliveryTown: cleanTown,
      deliveryLandmark: cleanLandmark,
      deliveryGps: cleanGps,
      address: cleanAddress,
      items: itemsValidation.items,
      total: orderTotal,
      status: 'Pending',
      userId: verifiedUserId,
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

// ========================================================
// USER PROFILE & DELIVERY SETTINGS ENDPOINTS
// ========================================================

// GET /api/user/profile - Fetch authenticated user's contact & delivery information
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const userEmail = req.user && req.user.email;

    if (isMongoConnected) {
      const user = await User.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null },
          { email: userEmail ? userEmail.toLowerCase() : null }
        ].filter(Boolean)
      });
      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        phoneNetwork: user.phoneNetwork || null,
        deliveryRegion: user.deliveryRegion || '',
        deliveryTown: user.deliveryTown || '',
        deliveryLandmark: user.deliveryLandmark || '',
        deliveryGps: user.deliveryGps || '',
        address: user.address || ''
      });
    }

    // In-memory fallback
    const user = inMemory.users.find(u => 
      (userId && String(u.id) === String(userId)) || 
      (userEmail && u.email && u.email.toLowerCase() === userEmail.toLowerCase())
    );
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      phoneNetwork: user.phoneNetwork || null,
      deliveryRegion: user.deliveryRegion || '',
      deliveryTown: user.deliveryTown || '',
      deliveryLandmark: user.deliveryLandmark || '',
      deliveryGps: user.deliveryGps || '',
      address: user.address || ''
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to load user profile.' });
  }
});

// PUT /api/user/profile - Update authenticated user's contact & delivery information
app.put('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const userEmail = req.user && req.user.email;
    const { name, phone, deliveryRegion, deliveryTown, deliveryLandmark, deliveryGps, address } = req.body || {};

    if (name && !isValidString(name, 2, 80)) {
      return res.status(400).json({ error: 'Full name must be between 2 and 80 characters.' });
    }

    let parsedPhoneData = null;
    if (phone) {
      parsedPhoneData = GhanaValidation.parseGhanaPhone(phone);
      if (!parsedPhoneData.isValid) {
        return res.status(400).json({ error: parsedPhoneData.error || 'Please provide a valid phone number.' });
      }
    }

    let cleanRegion = deliveryRegion ? String(deliveryRegion).trim() : '';
    let cleanTown = deliveryTown ? String(deliveryTown).trim() : '';
    let cleanLandmark = deliveryLandmark ? String(deliveryLandmark).trim() : '';
    let cleanGps = deliveryGps ? String(deliveryGps).trim() : '';
    let cleanAddress = address ? String(address).trim() : '';

    if (cleanRegion || cleanTown || cleanLandmark) {
      const addrValidation = GhanaValidation.validateGhanaAddress({
        region: cleanRegion,
        town: cleanTown,
        landmark: cleanLandmark,
        gps: cleanGps
      });
      if (!addrValidation.isValid) {
        const firstErr = Object.values(addrValidation.errors)[0];
        return res.status(400).json({ error: firstErr || 'Invalid delivery address details.' });
      }
      cleanRegion = addrValidation.values.region;
      cleanTown = addrValidation.values.town;
      cleanLandmark = addrValidation.values.landmark;
      cleanGps = addrValidation.values.gps;
      if (!cleanAddress) {
        cleanAddress = addrValidation.values.formattedAddress;
      }
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (parsedPhoneData) {
      updates.phone = parsedPhoneData.localFormat || phone.trim();
      updates.phoneNetwork = parsedPhoneData.network;
    }
    if (cleanRegion) updates.deliveryRegion = cleanRegion;
    if (cleanTown) updates.deliveryTown = cleanTown;
    if (cleanLandmark) updates.deliveryLandmark = cleanLandmark;
    if (cleanGps !== undefined) updates.deliveryGps = cleanGps;
    if (cleanAddress) updates.address = cleanAddress;

    if (isMongoConnected) {
      const updatedUser = await User.findOneAndUpdate(
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null },
            { email: userEmail ? userEmail.toLowerCase() : null }
          ].filter(Boolean)
        },
        { $set: updates },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: 'User profile not found.' });
      }
      return res.json({
        message: 'Profile updated successfully!',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          phoneNetwork: updatedUser.phoneNetwork,
          deliveryRegion: updatedUser.deliveryRegion,
          deliveryTown: updatedUser.deliveryTown,
          deliveryLandmark: updatedUser.deliveryLandmark,
          deliveryGps: updatedUser.deliveryGps,
          address: updatedUser.address
        }
      });
    }

    // In-memory fallback
    const userIndex = inMemory.users.findIndex(u => 
      (userId && String(u.id) === String(userId)) || 
      (userEmail && u.email && u.email.toLowerCase() === userEmail.toLowerCase())
    );
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    inMemory.users[userIndex] = { ...inMemory.users[userIndex], ...updates };
    const updatedUser = inMemory.users[userIndex];

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        phoneNetwork: updatedUser.phoneNetwork,
        deliveryRegion: updatedUser.deliveryRegion,
        deliveryTown: updatedUser.deliveryTown,
        deliveryLandmark: updatedUser.deliveryLandmark,
        deliveryGps: updatedUser.deliveryGps,
        address: updatedUser.address
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
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

// ========================================
// 3. CLEAN GET PRODUCTS ENDPOINT FOR THE FRONTEND (HYBRID RESOLVER)
// ========================================
async function handleGetProducts(req, res) {
  try {
    const dynamicMetricsMap = new Map();

    if (isMongoConnected) {
      const dbProducts = await Product.find({}, { productSku: 1, stock: 1, totalSales: 1, _id: 0 }).lean();
      for (const p of dbProducts) {
        if (p.productSku) {
          dynamicMetricsMap.set(p.productSku, p);
        }
      }
    } else if (inMemory.products && inMemory.products.length > 0) {
      for (const p of inMemory.products) {
        if (p.productSku) {
          dynamicMetricsMap.set(p.productSku, p);
        }
      }
    }

    const mergedProducts = staticProducts.map(staticItem => {
      const metrics = dynamicMetricsMap.get(staticItem.id) || {};
      const stock = typeof metrics.stock === 'number' ? metrics.stock : (typeof staticItem.stock === 'number' ? staticItem.stock : 10);
      const totalSales = typeof metrics.totalSales === 'number' ? metrics.totalSales : 0;
      
      const hasDiscount = Boolean(
        staticItem.isOnSale ||
        (staticItem.discount && staticItem.discount > 0) ||
        (staticItem.originalPrice && staticItem.originalPrice > staticItem.price)
      );
      const discountPercentage = staticItem.discount || (
        staticItem.originalPrice && staticItem.originalPrice > staticItem.price
          ? Math.round(((staticItem.originalPrice - staticItem.price) / staticItem.originalPrice) * 100)
          : 0
      );

      const inStock = stock > 0;
      const isTrending = Boolean(totalSales >= 5 || staticItem.isTrending);

      return {
        ...staticItem,
        stock,
        totalSales,
        inStock,
        isTrending,
        hasDiscount,
        discountPercentage
      };
    });

    res.json(mergedProducts);
  } catch (err) {
    console.error('Failed to retrieve hybrid product catalog:', err);
    res.status(500).json({ error: 'Failed to retrieve product catalog' });
  }
}

app.get('/api/v1/products', handleGetProducts);
app.get('/api/products', handleGetProducts);

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

// Dedicated HTML route for password reset page
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(rootDir, 'reset-password.html'));
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
module.exports.Product = Product;
module.exports.seedProducts = seedProducts;
module.exports.staticProducts = staticProducts;
module.exports.isValidPhone = isValidPhone;