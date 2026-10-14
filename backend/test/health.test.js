const { test } = require('node:test');
const assert = require('assert');
const request = require('supertest');
const app = require('../server');

test('GET / should respond with running message', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /backend is running/i);
});

test('GET /api/health should return ok and dbName', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.database);
  assert.ok(res.body.dbName);
});

test('Admin Auth & Management lifecycle', async () => {
  // 1. Unauthenticated request to /api/admin/admins should be rejected
  const unauthList = await request(app).get('/api/admin/admins');
  assert.equal(unauthList.status, 401);

  // 2. Unauthenticated request to /api/admin/create should be rejected
  const unauthCreate = await request(app).post('/api/admin/create').send({
    username: 'unauth_user',
    password: 'password123'
  });
  assert.equal(unauthCreate.status, 401);

  // 3. Authenticate with initial admin credentials
  const initialUser = process.env.ADMIN_USERNAME || 'admin';
  const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
  const loginRes = await request(app).post('/api/admin/login').send({
    username: initialUser,
    password: initialPass
  });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token, 'Token must be returned on valid login');
  const token = loginRes.body.token;

  // 4. Authenticated request to /api/admin/admins should succeed and NOT expose passwords
  const adminListRes = await request(app)
    .get('/api/admin/admins')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(adminListRes.status, 200);
  assert.ok(Array.isArray(adminListRes.body));
  assert.ok(adminListRes.body.length >= 1);
  for (const admin of adminListRes.body) {
    assert.strictEqual(admin.password, undefined, 'Password must never be returned in admin list');
    assert.ok(admin.username);
  }

  // 5. Authenticated admin creates a new admin account
  const newAdminUser = `test_admin_${Date.now()}`;
  const newAdminPass = 'Secret1234!';
  const createRes = await request(app)
    .post('/api/admin/create')
    .set('Authorization', `Bearer ${token}`)
    .send({
      username: newAdminUser,
      password: newAdminPass
    });
  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);

  // 6. Newly created admin can now log in successfully
  const newLoginRes = await request(app).post('/api/admin/login').send({
    username: newAdminUser,
    password: newAdminPass
  });
  assert.equal(newLoginRes.status, 200);
  assert.ok(newLoginRes.body.token);
});

test('Customer Order Placement & User Orders Retrieval', async () => {
  const customerEmail = `shopper_${Date.now()}@example.com`;
  const orderPayload = {
    name: 'Jane Shopper',
    email: customerEmail,
    phone: '+233 24 000 1122',
    address: '42 High Street, Accra',
    items: [{ id: 'p1', name: 'Cotton T-Shirt', price: 45, quantity: 2 }],
    total: 90,
    userId: 'usr_jane_123'
  };

  // 1. Place order
  const orderRes = await request(app).post('/api/orders').send(orderPayload);
  assert.equal(orderRes.status, 201);
  assert.ok(orderRes.body.orderId);
  assert.equal(orderRes.body.status, 'Pending');

  // 2. Fetch customer orders by email
  const userOrdersRes = await request(app).get(`/api/user/orders?email=${encodeURIComponent(customerEmail)}`);
  assert.equal(userOrdersRes.status, 200);
  assert.ok(Array.isArray(userOrdersRes.body));
  assert.equal(userOrdersRes.body.length, 1);
  assert.equal(userOrdersRes.body[0].email, customerEmail);
  assert.equal(userOrdersRes.body[0].total, 90);
  assert.equal(userOrdersRes.body[0].status, 'Pending');

  // 3. Fetch customer orders by string userId (e.g., usr_jane_123)
  const userOrdersByIdRes = await request(app).get('/api/user/orders?userId=usr_jane_123');
  assert.equal(userOrdersByIdRes.status, 200);
  assert.ok(Array.isArray(userOrdersByIdRes.body));
  assert.ok(userOrdersByIdRes.body.some(o => o.email === customerEmail));

  // 4. Fetch customer orders by route param /api/users/:userId/orders
  const paramOrdersRes = await request(app).get('/api/users/usr_jane_123/orders');
  assert.equal(paramOrdersRes.status, 200);
  assert.ok(Array.isArray(paramOrdersRes.body));
  assert.ok(paramOrdersRes.body.some(o => o.email === customerEmail));

  // 5. Test with specific timestamp string userId format (e.g., usr_1791852530600)
  const timestampUserId = 'usr_1791852530600';
  const customOrderRes = await request(app).post('/api/orders').send({
    name: 'Cast Test User',
    email: 'cast_test@example.com',
    phone: '+233 50 111 2233',
    address: 'Cast Test Address',
    items: [{ id: 'p2', name: 'Smart Watch', price: 150, quantity: 1 }],
    total: 150,
    userId: timestampUserId
  });
  assert.equal(customOrderRes.status, 201);

  const fetchCastRes = await request(app).get(`/api/user/orders?userId=${timestampUserId}&email=cast_test@example.com`);
  assert.equal(fetchCastRes.status, 200);
  assert.ok(Array.isArray(fetchCastRes.body));
  assert.ok(fetchCastRes.body.some(o => o.userId === timestampUserId || o.email === 'cast_test@example.com'));
});

test('Cart & Wishlist Persistence and Account Synchronization', async () => {
  const testUsername = `sync_user_${Date.now()}`;
  const testEmail = `${testUsername}@example.com`;
  const guestCart = [
    { id: 'item_1', name: 'Wireless Headphones', price: 90, quantity: 2, image: 'headphones.jpg' }
  ];
  const guestWishlist = [
    { id: 'item_2', name: 'Smart Fitness Tracker', price: 65, image: 'tracker.jpg' }
  ];

  // 1. Register with guest items
  const regRes = await request(app).post('/api/users/register').send({
    username: testUsername,
    email: testEmail,
    password: 'password123',
    name: 'Sync Test User',
    guestCart,
    guestWishlist
  });

  assert.equal(regRes.status, 201);
  assert.ok(regRes.body.user);
  assert.equal(regRes.body.user.cart.length, 1);
  assert.equal(regRes.body.user.cart[0].name, 'Wireless Headphones');
  assert.equal(regRes.body.user.cart[0].quantity, 2);
  assert.equal(regRes.body.user.wishlist.length, 1);
  assert.equal(regRes.body.user.wishlist[0].name, 'Smart Fitness Tracker');

  // 2. Login with additional guest items and merge
  const additionalGuestCart = [
    { id: 'item_1', name: 'Wireless Headphones', price: 90, quantity: 1, image: 'headphones.jpg' },
    { id: 'item_3', name: 'Laptop Backpack', price: 45, quantity: 1, image: 'backpack.jpg' }
  ];
  const additionalGuestWishlist = [
    { id: 'item_2', name: 'Smart Fitness Tracker', price: 65, image: 'tracker.jpg' },
    { id: 'item_4', name: 'Desk Lamp', price: 30, image: 'lamp.jpg' }
  ];

  const loginRes = await request(app).post('/api/users/login').send({
    username: testUsername,
    password: 'password123',
    guestCart: additionalGuestCart,
    guestWishlist: additionalGuestWishlist
  });

  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.user);
  assert.equal(loginRes.body.user.cart.length, 2);
  const headphones = loginRes.body.user.cart.find(i => i.id === 'item_1' || i.name === 'Wireless Headphones');
  assert.ok(headphones);
  assert.equal(headphones.quantity, 3);
  assert.equal(loginRes.body.user.wishlist.length, 2);

  // 3. GET /api/user/cart-wishlist
  const fetchRes = await request(app).get(`/api/user/cart-wishlist?email=${testEmail}`);
  assert.equal(fetchRes.status, 200);
  assert.equal(fetchRes.body.cart.length, 2);
  assert.equal(fetchRes.body.wishlist.length, 2);

  // 4. POST /api/user/cart-wishlist (direct autosave update)
  const updateRes = await request(app).post('/api/user/cart-wishlist').send({
    email: testEmail,
    cart: [{ id: 'item_5', name: 'Mechanical Keyboard', price: 110, quantity: 1 }],
    wishlist: [{ id: 'item_6', name: 'Gaming Mouse', price: 50 }]
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.cart.length, 1);
  assert.equal(updateRes.body.cart[0].name, 'Mechanical Keyboard');

  // 5. POST /api/user/sync (explicit merge sync endpoint)
  const syncRes = await request(app).post('/api/user/sync').send({
    email: testEmail,
    guestCart: [{ id: 'item_5', name: 'Mechanical Keyboard', price: 110, quantity: 2 }],
    guestWishlist: [{ id: 'item_7', name: 'USB-C Dock', price: 80 }]
  });
  assert.equal(syncRes.status, 200);
  assert.equal(syncRes.body.cart.length, 1);
  assert.equal(syncRes.body.cart[0].quantity, 3);
  assert.equal(syncRes.body.wishlist.length, 2);
});




