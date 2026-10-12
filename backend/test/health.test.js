const { test } = require('node:test');
const assert = require('assert');
const request = require('supertest');
const app = require('../server');

test('GET / should respond with running message', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /backend is running/i);
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



