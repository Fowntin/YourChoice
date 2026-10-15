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

test('Customer Contact Inquiry API lifecycle & validation', async () => {
  // 1. Missing fields should be rejected
  const badReq = await request(app).post('/api/contact').send({
    name: 'Kofi',
    email: 'kofi@example.com'
  });
  assert.equal(badReq.status, 400);
  assert.equal(badReq.body.success, false);

  // 2. Invalid email format should be rejected
  const badEmailReq = await request(app).post('/api/contact').send({
    name: 'Kofi',
    email: 'not-an-email',
    message: 'Hello team, inquiry test.'
  });
  assert.equal(badEmailReq.status, 400);
  assert.equal(badEmailReq.body.success, false);

  // 3. Valid contact submission succeeds
  const validSubmission = {
    name: 'Serwaa Akoto',
    email: 'serwaa@example.com',
    subject: 'Delivery Inquiry',
    message: 'Hello, what are your delivery timeframes to Kumasi?'
  };
  const submitRes = await request(app).post('/api/contact').send(validSubmission);
  assert.equal(submitRes.status, 201);
  assert.equal(submitRes.body.success, true);
  assert.ok(submitRes.body.inquiryId);

  // 4. Authenticated admin can view inquiries
  const initialUser = process.env.ADMIN_USERNAME || 'admin';
  const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
  const loginRes = await request(app).post('/api/admin/login').send({
    username: initialUser,
    password: initialPass
  });
  const token = loginRes.body.token;

  const messagesRes = await request(app)
    .get('/api/admin/messages')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(messagesRes.status, 200);
  assert.ok(Array.isArray(messagesRes.body));
  const found = messagesRes.body.find(m => m.email === 'serwaa@example.com');
  assert.ok(found, 'Submitted contact message should be retrievable by admin');
  assert.equal(found.subject, 'Delivery Inquiry');

  // 5. Authenticated admin can update message status
  const patchRes = await request(app)
    .patch(`/api/admin/messages/${found._id}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'Read' });
  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.status, 'Read');
});

test('Customer Account Security: Salted bcrypt hashing, authentication & legacy migration', async () => {
  const secureUsername = `sec_user_${Date.now()}`;
  const secureEmail = `${secureUsername}@example.com`;
  const rawPassword = 'StrongPassword!2026';

  // 1. Register customer account
  const regRes = await request(app).post('/api/users/register').send({
    username: secureUsername,
    email: secureEmail,
    password: rawPassword,
    name: 'Secure Shopper',
    phone: '+233 24 555 6677'
  });
  assert.equal(regRes.status, 201);
  assert.ok(regRes.body.user);
  assert.strictEqual(regRes.body.user.password, undefined, 'Password must never be returned in registration response');

  // 2. Verify stored password is a salted bcrypt hash, never plaintext
  if (app.inMemory && app.inMemory.users) {
    const storedRecord = app.inMemory.users.find(u => u.username === secureUsername);
    assert.ok(storedRecord, 'Customer record must be present in storage');
    assert.notEqual(storedRecord.password, rawPassword, 'Password must not be stored in plaintext');
    assert.match(storedRecord.password, /^\$2[ab]\$\d+\$/, 'Stored password must be a valid salted bcrypt hash');
  }

  // 3. Login with correct credentials succeeds
  const loginSuccessRes = await request(app).post('/api/users/login').send({
    username: secureUsername,
    password: rawPassword
  });
  assert.equal(loginSuccessRes.status, 200);
  assert.ok(loginSuccessRes.body.user);

  // 4. Login with incorrect password is rejected (401)
  const loginFailRes = await request(app).post('/api/users/login').send({
    username: secureUsername,
    password: 'WrongPassword123'
  });
  assert.equal(loginFailRes.status, 401);

  // 5. Backward compatibility & auto-migration: legacy account with plaintext password
  if (app.inMemory && app.inMemory.users) {
    const legacyUsername = `legacy_user_${Date.now()}`;
    const legacyPlainPassword = 'legacyPlaintextPass123';
    app.inMemory.users.push({
      id: 'usr_legacy_' + Date.now(),
      username: legacyUsername,
      email: `${legacyUsername}@example.com`,
      password: legacyPlainPassword, // Unhashed legacy account
      name: 'Legacy User',
      cart: [],
      wishlist: [],
      createdAt: new Date().toISOString()
    });

    // Authenticate with legacy plaintext password
    const legacyLoginRes = await request(app).post('/api/users/login').send({
      username: legacyUsername,
      password: legacyPlainPassword
    });
    assert.equal(legacyLoginRes.status, 200, 'Legacy account must be able to log in with original credentials');

    // Verify the account has now been automatically upgraded to a salted bcrypt hash
    const migratedUser = app.inMemory.users.find(u => u.username === legacyUsername);
    assert.ok(migratedUser);
    assert.notEqual(migratedUser.password, legacyPlainPassword, 'Legacy password must be migrated away from plaintext');
    assert.match(migratedUser.password, /^\$2[ab]\$\d+\$/, 'Legacy password must be upgraded to salted bcrypt hash');
  }
});

test('Input Boundary Validation & Rejection of Malformed Payloads', async () => {
  // 1. Order placement with empty items array
  const emptyItemsOrder = await request(app).post('/api/orders').send({
    name: 'Kofi Mensah',
    email: 'kofi@example.com',
    phone: '+233 24 123 4567',
    address: 'East Legon, Accra',
    items: [],
    total: 100
  });
  assert.equal(emptyItemsOrder.status, 400);

  // 2. Order placement with non-string customer name (e.g., NoSQL injection payload)
  const noSqlInjectionOrder = await request(app).post('/api/orders').send({
    name: { $gt: '' },
    email: 'kofi@example.com',
    phone: '+233 24 123 4567',
    address: 'East Legon, Accra',
    items: [{ name: 'Mouse', price: 50, quantity: 1 }],
    total: 50
  });
  assert.equal(noSqlInjectionOrder.status, 400);

  // 3. Order placement with negative item quantity
  const negativeQtyOrder = await request(app).post('/api/orders').send({
    name: 'Kofi Mensah',
    email: 'kofi@example.com',
    phone: '+233 24 123 4567',
    address: 'East Legon, Accra',
    items: [{ name: 'Mouse', price: 50, quantity: -2 }],
    total: -100
  });
  assert.equal(negativeQtyOrder.status, 400);

  // 4. Order placement with invalid email format
  const badEmailOrder = await request(app).post('/api/orders').send({
    name: 'Kofi Mensah',
    email: 'invalid-email-address',
    phone: '+233 24 123 4567',
    address: 'East Legon, Accra',
    items: [{ name: 'Mouse', price: 50, quantity: 1 }],
    total: 50
  });
  assert.equal(badEmailOrder.status, 400);

  // 5. Admin updating order with non-whitelisted status
  const initialUser = process.env.ADMIN_USERNAME || 'admin';
  const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
  const loginRes = await request(app).post('/api/admin/login').send({
    username: initialUser,
    password: initialPass
  });
  const token = loginRes.body.token;

  const badStatusRes = await request(app)
    .put('/api/admin/orders/ord_sample_101')
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'InvalidExploitStatus' });
  assert.equal(badStatusRes.status, 400);

  // 6. Admin login with empty credentials
  const emptyLoginRes = await request(app).post('/api/admin/login').send({
    username: '',
    password: ''
  });
  assert.equal(emptyLoginRes.status, 400);

  // 7. Contact submission with message shorter than 5 chars
  const shortMsgRes = await request(app).post('/api/contact').send({
    name: 'Ama Osei',
    email: 'ama@example.com',
    message: 'Hi'
  });
  assert.equal(shortMsgRes.status, 400);
});
