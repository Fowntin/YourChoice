const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });

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
      password: bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10)
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
  ]
};

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

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
  } catch (err) {
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

// MongoDB connection (skip when running tests or if no valid URI provided)
if (process.env.NODE_ENV !== 'test') {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI && mongoURI.trim() !== '' && !mongoURI.includes('your-mongodb-connection-string')) {
    mongoose.set('bufferCommands', false);
    mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    })
      .then(() => {
        isMongoConnected = true;
        console.log('✅ MongoDB connected');
        createInitialAdmin();
      })
      .catch((err) => {
        isMongoConnected = false;
        console.warn('⚠️ MongoDB not connected — running in-memory fallback store:', err.message);
      });
  } else {
    console.log('ℹ️ Running with in-memory store (instant setup, no external DB required)');
  }
}

// User registration endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, name, phone, address } = req.body;
    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (isMongoConnected) {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email or username already exists.' });
      }
      const user = new User({ username, email, password, name, phone, address });
      await user.save();
      return res.status(201).json({ message: 'User registered successfully!' });
    }

    // In-memory fallback
    const exists = inMemory.users.find(u => u.username === username || u.email === email);
    if (exists) {
      return res.status(400).json({ error: 'User with this email or username already exists.' });
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      username,
      email,
      password,
      name,
      phone: phone || '',
      address: address || '',
      createdAt: new Date()
    };
    inMemory.users.push(newUser);
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// User login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    if (isMongoConnected) {
      const user = await User.findOne({ 
        $or: [{ username }, { email: username }] 
      });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      return res.json({
        message: 'Login successful!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address
        }
      });
    }

    // In-memory fallback
    const user = inMemory.users.find(u => (u.username === username || u.email === username) && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    return res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Get user's orders
app.get('/api/users/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    if (isMongoConnected) {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = inMemory.orders.filter(o => o.userId === userId);
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Place order endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, address, items, total, userId } = req.body;
    if (!name || !email || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or empty cart.' });
    }

    if (isMongoConnected) {
      const orderData = { name, email, phone, address, items, total };
      if (userId) orderData.userId = userId;
      const order = new Order(orderData);
      await order.save();
      return res.status(201).json({ message: 'Order placed successfully!' });
    }

    // In-memory fallback
    const newOrder = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      phone,
      address,
      items,
      total: Number(total) || 0,
      status: 'Pending',
      userId: userId || null,
      createdAt: new Date().toISOString()
    };
    inMemory.orders.unshift(newOrder);
    res.status(201).json({ message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    let adminUser = null;
    let passwordHash = null;

    if (isMongoConnected) {
      adminUser = await Admin.findOne({ username });
      if (adminUser) {
        passwordHash = adminUser.password;
      }
    } else {
      adminUser = inMemory.admins.find(a => a.username === username);
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected) {
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'Admin already exists' });
      }
      const admin = new Admin({ username, password: hashedPassword });
      await admin.save();
      return res.status(201).json({ success: true, message: 'Admin created successfully' });
    }

    // In-memory fallback
    if (inMemory.admins.some(a => a.username === username)) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    inMemory.admins.push({ username, password: hashedPassword });
    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (err) {
    console.error('Admin creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to create admin' });
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (Protected: admin only)
app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (isMongoConnected) {
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
      if (!order) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Serve static frontend files from parent directory
app.use(express.static(rootDir, { index: false }));

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