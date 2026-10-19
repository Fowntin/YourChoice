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

  // 1. Unauthenticated order placement must be rejected with 401
  const unauthRes = await request(app).post('/api/orders').send(orderPayload);
  assert.equal(unauthRes.status, 401);
  assert.equal(unauthRes.body.error, 'Please log in to complete your order.');

  // 2. Register customer account to obtain valid JWT token
  const regRes = await request(app).post('/api/users/register').send({
    username: `jane_${Date.now()}`,
    email: customerEmail,
    password: 'Password123!',
    name: 'Jane Shopper',
    phone: '+233 24 000 1122',
    address: '42 High Street, Accra'
  });
  assert.equal(regRes.status, 201);
  const customerToken = regRes.body.token;
  assert.ok(customerToken);

  // 3. Place order with authenticated Bearer token
  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send(orderPayload);
  assert.equal(orderRes.status, 201);
  assert.ok(orderRes.body.orderId);
  assert.equal(orderRes.body.status, 'Pending');

  // 4. Fetch customer orders by email
  const userOrdersRes = await request(app).get(`/api/user/orders?email=${encodeURIComponent(customerEmail)}`);
  assert.equal(userOrdersRes.status, 200);
  assert.ok(Array.isArray(userOrdersRes.body));
  assert.equal(userOrdersRes.body.length, 1);
  assert.equal(userOrdersRes.body[0].email, customerEmail);
  assert.equal(userOrdersRes.body[0].total, 90);
  assert.equal(userOrdersRes.body[0].status, 'Pending');

  // 5. Fetch customer orders by string userId (e.g., usr_jane_123 or registered id)
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
  const customOrderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
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
  // Pre-authenticate customer for order boundary validation tests
  const custReg = await request(app).post('/api/users/register').send({
    username: `boundary_${Date.now()}`,
    email: `boundary_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Boundary Tester'
  });
  const custToken = custReg.body.token;

  // 1. Order placement with empty items array
  const emptyItemsOrder = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      name: 'Kofi Mensah',
      email: 'kofi@example.com',
      phone: '+233 24 123 4567',
      address: 'East Legon, Accra',
      items: [],
      total: 100
    });
  assert.equal(emptyItemsOrder.status, 400);

  // 2. Order placement with non-string customer name (e.g., NoSQL injection payload)
  const noSqlInjectionOrder = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      name: { $gt: '' },
      email: 'kofi@example.com',
      phone: '+233 24 123 4567',
      address: 'East Legon, Accra',
      items: [{ name: 'Mouse', price: 50, quantity: 1 }],
      total: 50
    });
  assert.equal(noSqlInjectionOrder.status, 400);

  // 3. Order placement with negative item quantity
  const negativeQtyOrder = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      name: 'Kofi Mensah',
      email: 'kofi@example.com',
      phone: '+233 24 123 4567',
      address: 'East Legon, Accra',
      items: [{ name: 'Mouse', price: 50, quantity: -2 }],
      total: -100
    });
  assert.equal(negativeQtyOrder.status, 400);

  // 4. Order placement with invalid email format
  const badEmailOrder = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
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

test('Password Reset Workflow: Token generation, expiration, anti-enumeration & bcrypt execution', async () => {
  const resetUser = `reset_user_${Date.now()}`;
  const resetEmail = `${resetUser}@example.com`;
  const initialPassword = 'InitialSecretPassword123!';
  const newPassword = 'BrandNewPassword456!';

  // 1. Register a test user
  const regRes = await request(app).post('/api/users/register').send({
    username: resetUser,
    email: resetEmail,
    password: initialPassword,
    name: 'Reset Test User'
  });
  assert.equal(regRes.status, 201);

  // 2. Request password reset with non-existent email:
  // MUST return 200 generic success to prevent user enumeration
  const nonExistentRes = await request(app).post('/api/auth/forgot-password').send({
    email: 'nonexistent_account_9999@example.com'
  });
  assert.equal(nonExistentRes.status, 200);
  assert.equal(nonExistentRes.body.success, true);
  assert.equal(nonExistentRes.body.message, 'If that email exists, a reset link has been sent.');

  // 3. Request password reset with invalid email format returns 400
  const invalidEmailRes = await request(app).post('/api/auth/forgot-password').send({
    email: 'not-an-email'
  });
  assert.equal(invalidEmailRes.status, 400);

  // 4. Request password reset for existing registered user
  const beforeRequestTime = Date.now();
  const forgotRes = await request(app).post('/api/auth/forgot-password').send({
    email: resetEmail
  });
  assert.equal(forgotRes.status, 200);
  assert.equal(forgotRes.body.success, true);
  assert.equal(forgotRes.body.message, 'If that email exists, a reset link has been sent.');

  // 5. Inspect stored user record for crypto token and 15-minute expiration
  const storedUser = app.inMemory.users.find(u => u.email === resetEmail);
  assert.ok(storedUser, 'User must exist in memory store');
  assert.ok(storedUser.resetPasswordToken, 'resetPasswordToken must be generated');
  assert.equal(storedUser.resetPasswordToken.length, 64, 'Token must be 64-char hex string (32 bytes)');
  assert.ok(storedUser.resetPasswordExpires, 'resetPasswordExpires date must be set');

  const expiryTime = new Date(storedUser.resetPasswordExpires).getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  // Expiration should be within 2 seconds of 15 minutes from request time
  assert.ok(expiryTime >= beforeRequestTime + fifteenMinutesMs - 2000, 'Expiration must be at least 15 mins ahead');
  assert.ok(expiryTime <= Date.now() + fifteenMinutesMs + 2000, 'Expiration must not exceed 15 mins ahead');

  const validToken = storedUser.resetPasswordToken;

  // 6. Verify token check endpoint
  const verifyValid = await request(app).get(`/api/auth/verify-token?token=${validToken}`);
  assert.equal(verifyValid.status, 200);
  assert.equal(verifyValid.body.valid, true);

  // 7. Attempt reset with non-existent token returns 400
  const bogusResetRes = await request(app).post('/api/auth/reset-password').send({
    token: 'bogus_token_1234567890abcdef1234567890abcdef',
    newPassword: newPassword
  });
  assert.equal(bogusResetRes.status, 400);
  assert.equal(bogusResetRes.body.error, 'Token is invalid or has expired.');

  // 8. Attempt reset with expired token returns 400
  storedUser.resetPasswordExpires = new Date(Date.now() - 5000); // 5 seconds in the past
  const expiredResetRes = await request(app).post('/api/auth/reset-password').send({
    token: validToken,
    newPassword: newPassword
  });
  assert.equal(expiredResetRes.status, 400);
  assert.equal(expiredResetRes.body.error, 'Token is invalid or has expired.');

  // 9. Restore valid expiration to test successful reset
  storedUser.resetPasswordExpires = new Date(Date.now() + fifteenMinutesMs);

  // 10. Attempt reset with invalid/too-short password returns 400
  const shortPassRes = await request(app).post('/api/auth/reset-password').send({
    token: validToken,
    newPassword: '123'
  });
  assert.equal(shortPassRes.status, 400);

  // 11. Execute successful password reset
  const successResetRes = await request(app).post('/api/auth/reset-password').send({
    token: validToken,
    newPassword: newPassword
  });
  assert.equal(successResetRes.status, 200);
  assert.equal(successResetRes.body.success, true);
  assert.equal(successResetRes.body.message, 'Password reset successfully. You may now log in.');

  // 12. Critical Cleanup Verification: fields must be cleared back to null
  assert.strictEqual(storedUser.resetPasswordToken, null, 'resetPasswordToken must be reset to null');
  assert.strictEqual(storedUser.resetPasswordExpires, null, 'resetPasswordExpires must be reset to null');

  // 13. Verify user's new password is a salted bcrypt hash
  assert.match(storedUser.password, /^\$2[ab]\$\d+\$/, 'Updated password must be a salted bcrypt hash');

  // 14. Old password must no longer work for login
  const oldLoginRes = await request(app).post('/api/users/login').send({
    username: resetUser,
    password: initialPassword
  });
  assert.equal(oldLoginRes.status, 401);

  // 15. New password works successfully for login
  const newLoginRes = await request(app).post('/api/users/login').send({
    username: resetUser,
    password: newPassword
  });
  assert.equal(newLoginRes.status, 200);
  assert.equal(newLoginRes.body.user.username, resetUser);

  // 16. Single-use enforcement: Attempting to reuse the same token must fail
  const reuseRes = await request(app).post('/api/auth/reset-password').send({
    token: validToken,
    newPassword: 'YetAnotherPassword789!'
  });
  assert.equal(reuseRes.status, 400);
  assert.equal(reuseRes.body.error, 'Token is invalid or has expired.');
});

test('Hybrid Product Catalog Decoupling & Checkout Inventory Validation', async () => {
  // 1. GET /api/v1/products merges static catalog with dynamic metrics
  const productsRes = await request(app).get('/api/v1/products');
  assert.equal(productsRes.status, 200);
  assert.ok(Array.isArray(productsRes.body), 'Response should be a merged product array');
  assert.ok(productsRes.body.length > 0, 'Catalog should contain items');

  const firstProduct = productsRes.body[0];
  assert.ok(firstProduct.id, 'Product must contain id');
  assert.equal(typeof firstProduct.stock, 'number', 'Product must have numeric stock');
  assert.equal(typeof firstProduct.totalSales, 'number', 'Product must have numeric totalSales');
  assert.equal(typeof firstProduct.inStock, 'boolean', 'Product must have boolean inStock flag');
  assert.equal(typeof firstProduct.hasDiscount, 'boolean', 'Product must have boolean hasDiscount flag');
  assert.equal(typeof firstProduct.discountPercentage, 'number', 'Product must have discountPercentage');

  // Also verify alias GET /api/products
  const aliasRes = await request(app).get('/api/products');
  assert.equal(aliasRes.status, 200);
  assert.equal(aliasRes.body.length, productsRes.body.length);

  // 2. Checkout inventory validation: Attempting to order quantity > available stock returns 400 "Item is out of stock"
  const invUserReg = await request(app).post('/api/users/register').send({
    username: `inv_${Date.now()}`,
    email: `inv_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Inventory Tester'
  });
  const invToken = invUserReg.body.token;

  const excessiveQuantity = (firstProduct.stock || 10) + 5;
  const outOfStockRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${invToken}`)
    .send({
      name: 'Inventory Tester',
      email: 'stocktest@example.com',
      phone: '+233 24 111 2233',
      address: '10 Industrial Way, Accra',
      items: [{ id: firstProduct.id, name: firstProduct.name, price: firstProduct.price, quantity: excessiveQuantity }],
      total: firstProduct.price * excessiveQuantity
    });
  assert.equal(outOfStockRes.status, 400);
  assert.equal(outOfStockRes.body.error, 'Item is out of stock');

  // 3. Sufficient stock order succeeds and decrements stock
  const currentStock = firstProduct.stock;
  const validOrderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${invToken}`)
    .send({
      name: 'Inventory Tester',
      email: 'stocktest@example.com',
      phone: '+233 24 111 2233',
      address: '10 Industrial Way, Accra',
      items: [{ id: firstProduct.id, name: firstProduct.name, price: firstProduct.price, quantity: 1 }],
      total: firstProduct.price
    });
  assert.equal(validOrderRes.status, 201);
  assert.ok(validOrderRes.body.orderId);

  // Verify stock was decremented
  const updatedProductsRes = await request(app).get('/api/v1/products');
  const updatedItem = updatedProductsRes.body.find(p => p.id === firstProduct.id);
  assert.equal(updatedItem.stock, currentStock - 1);
  assert.equal(updatedItem.totalSales, 1);
});

test('Ghanaian Localization & Delivery Field Validation Suite', async () => {
  const GhanaValidation = require('../../ghana-validation.js');

  // 1. Ghanaian Phone & Telecom Network Detection
  const mtnLocal = GhanaValidation.parseGhanaPhone('024 123 4567');
  assert.equal(mtnLocal.isValid, true);
  assert.equal(mtnLocal.network, 'MTN');
  assert.equal(mtnLocal.localFormat, '0241234567');
  assert.equal(mtnLocal.internationalFormat, '+233241234567');

  const mtnIntl = GhanaValidation.parseGhanaPhone('+233549988776');
  assert.equal(mtnIntl.isValid, true);
  assert.equal(mtnIntl.network, 'MTN');

  const telecel = GhanaValidation.parseGhanaPhone('0201234567');
  assert.equal(telecel.isValid, true);
  assert.equal(telecel.network, 'Telecel');

  const atMoney = GhanaValidation.parseGhanaPhone('0271234567');
  assert.equal(atMoney.isValid, true);
  assert.equal(atMoney.network, 'AT');

  // Invalid numbers
  const invalidPrefix = GhanaValidation.parseGhanaPhone('0231234567');
  assert.equal(invalidPrefix.isValid, false);
  assert.match(invalidPrefix.error, /not a recognized Ghana mobile network/i);

  const shortNumber = GhanaValidation.parseGhanaPhone('02412345');
  assert.equal(shortNumber.isValid, false);
  assert.match(shortNumber.error, /must be 10 digits/i);

  // 2. GhanaPost GPS Digital Address Format
  const validGps = GhanaValidation.validateGhanaPostGPS('GA-183-9024');
  assert.equal(validGps.isValid, true);
  assert.equal(validGps.formatted, 'GA-183-9024');

  const noHyphenGps = GhanaValidation.validateGhanaPostGPS('ak0392311');
  assert.equal(noHyphenGps.isValid, true);
  assert.equal(noHyphenGps.formatted, 'AK-039-2311');

  const invalidGps = GhanaValidation.validateGhanaPostGPS('INVALID-GPS');
  assert.equal(invalidGps.isValid, false);

  const emptyGps = GhanaValidation.validateGhanaPostGPS('');
  assert.equal(emptyGps.isValid, true);
  assert.equal(emptyGps.isEmpty, true);

  // 3. Structured Delivery Address Validation
  const validAddress = GhanaValidation.validateGhanaAddress({
    region: 'Greater Accra',
    town: 'East Legon',
    landmark: 'Opposite Shell Filling Station, near Starbites',
    gps: 'GA-183-9024'
  });
  assert.equal(validAddress.isValid, true);
  assert.equal(validAddress.values.formattedAddress, 'East Legon, Opposite Shell Filling Station, near Starbites (GPS: GA-183-9024), Greater Accra, Ghana');

  const missingLandmark = GhanaValidation.validateGhanaAddress({
    region: 'Ashanti',
    town: 'Kumasi',
    landmark: ''
  });
  assert.equal(missingLandmark.isValid, false);
  assert.ok(missingLandmark.errors.landmark);

  const invalidRegion = GhanaValidation.validateGhanaAddress({
    region: 'Atlantis Region',
    town: 'Kumasi',
    landmark: 'Near market'
  });
  assert.equal(invalidRegion.isValid, false);
  assert.ok(invalidRegion.errors.region);

  // 4. End-to-end Profile lifecycle with Ghana delivery details
  const ghanaUserReg = await request(app).post('/api/users/register').send({
    username: `ghana_${Date.now()}`,
    email: `ghana_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Kofi Mensah',
    phone: '024 123 4567',
    deliveryRegion: 'Greater Accra',
    deliveryTown: 'Osu',
    deliveryLandmark: 'Oxford Street, Behind Papaye',
    deliveryGps: 'GA-012-3456'
  });
  assert.equal(ghanaUserReg.status, 201);
  assert.equal(ghanaUserReg.body.user.phoneNetwork, 'MTN');
  assert.equal(ghanaUserReg.body.user.deliveryRegion, 'Greater Accra');
  const ghanaToken = ghanaUserReg.body.token;

  // Retrieve user profile
  const profileGet = await request(app)
    .get('/api/user/profile')
    .set('Authorization', `Bearer ${ghanaToken}`);
  assert.equal(profileGet.status, 200);
  assert.equal(profileGet.body.deliveryTown, 'Osu');
  assert.equal(profileGet.body.phoneNetwork, 'MTN');

  // Update user profile with Telecel number & Kumasi delivery
  const profileUpdate = await request(app)
    .put('/api/user/profile')
    .set('Authorization', `Bearer ${ghanaToken}`)
    .send({
      name: 'Kofi A. Mensah',
      phone: '020 987 6543',
      deliveryRegion: 'Ashanti',
      deliveryTown: 'Kumasi Central',
      deliveryLandmark: 'Adum, Opposite Melcom',
      deliveryGps: 'AK-123-4567'
    });
  assert.equal(profileUpdate.status, 200);
  assert.equal(profileUpdate.body.user.name, 'Kofi A. Mensah');
  assert.equal(profileUpdate.body.user.phoneNetwork, 'Telecel');
  assert.equal(profileUpdate.body.user.deliveryRegion, 'Ashanti');
  assert.equal(profileUpdate.body.user.deliveryTown, 'Kumasi Central');
  assert.ok(profileUpdate.body.user.phone);

  // Verify subsequent GET /api/user/profile confirms persisted phone number
  const persistedProfile = await request(app)
    .get('/api/user/profile')
    .set('Authorization', `Bearer ${ghanaToken}`);
  assert.equal(persistedProfile.status, 200);
  assert.equal(persistedProfile.body.phoneNetwork, 'Telecel');
  const parsedPersisted = GhanaValidation.parseGhanaPhone(persistedProfile.body.phone);
  assert.equal(parsedPersisted.isValid, true);
  assert.equal(parsedPersisted.network, 'Telecel');

  // 5. Order placement with structured delivery data
  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${ghanaToken}`)
    .send({
      name: 'Kofi A. Mensah',
      email: ghanaUserReg.body.user.email,
      phone: '020 987 6543',
      deliveryRegion: 'Ashanti',
      deliveryTown: 'Kumasi Central',
      deliveryLandmark: 'Adum, Opposite Melcom',
      deliveryGps: 'AK-123-4567',
      items: [{ id: 'item_test_1', name: 'USB-C Cable', price: 25, quantity: 2 }],
      total: 50
    });
  assert.equal(orderRes.status, 201);
  assert.ok(orderRes.body.orderId);

  // Reject order with invalid phone
  const badPhoneOrder = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${ghanaToken}`)
    .send({
      name: 'Kofi A. Mensah',
      email: ghanaUserReg.body.user.email,
      phone: '12345',
      deliveryRegion: 'Ashanti',
      deliveryTown: 'Kumasi Central',
      deliveryLandmark: 'Adum, Opposite Melcom',
      items: [{ id: 'item_test_1', name: 'USB-C Cable', price: 25, quantity: 1 }],
      total: 25
    });
  assert.equal(badPhoneOrder.status, 400);
  assert.match(badPhoneOrder.body.error, /phone/i);
});


