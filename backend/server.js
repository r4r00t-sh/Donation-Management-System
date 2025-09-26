require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.disable('x-powered-by');

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
}

// Helper: check admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin only' });
}

// Register (public)
app.post('/api/auth/register', async (req, res) => {
  const { password, name, phone, email, address, members } = req.body;
  if (!email || !password || !name || !phone || !address) return res.status(400).json({ error: 'All fields are required' });
  try {
    // Check if phone/email exists in any family
    const [existing] = await pool.query('SELECT family_id FROM users WHERE phone = ? OR email = ?', [phone, email]);
    if (existing.length > 0 && existing[0].family_id) {
      // Return family info for frontend to prompt user
      const [usersInFam] = await pool.query('SELECT * FROM users WHERE family_id = ?', [existing[0].family_id]);
      return res.status(409).json({ error: 'Already in a family', family_id: existing[0].family_id, members: usersInFam });
    }
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ error: 'Email already exists' });
    // Create new family
    const uuid = require('uuid');
    const [famCountRows] = await pool.query('SELECT COUNT(*) as count FROM families');
    const famSerial = famCountRows[0].count + 1;
    const family_code = `SA/PJ/FAM-${famSerial.toString().padStart(3, '0')}`;
    const family_id = uuid.v4();
    await pool.query('INSERT INTO families (id, family_code) VALUES (?, ?)', [family_id, family_code]);
    // Insert main user
    const user_id = uuid.v4();
    const hash = bcrypt.hashSync(password, 8);
    await pool.query('INSERT INTO users (id, username, password_hash, role, name, phone, email, address, family_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user_id, email, hash, 'public', name, phone, email, address, family_id]);
    // Insert family members if provided
    let createdMembers = [];
    if (Array.isArray(members)) {
      for (const m of members) {
        const member_id = uuid.v4();
        await pool.query('INSERT INTO members (id, family_id, name, star, dob, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)', [member_id, family_id, m.name, m.star || null, m.dob || null, m.phone || null, m.email || null]);
        createdMembers.push({ id: member_id, ...m });
      }
    }
    const token = jwt.sign({ id: user_id, email, role: 'public' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user_id, email, role: 'public', name, phone, address, family_id, family_code }, members: createdMembers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, address: user.address } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', db: true });
  } catch (e) {
    res.status(500).json({ status: 'error', db: false, error: e.message });
  }
});

// USERS (admin only)
app.get('/api/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, role, created_at, family_id FROM users');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', authenticateJWT, requireAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) return res.status(409).json({ error: 'Username exists' });
    const id = require('uuid').v4();
    const hash = bcrypt.hashSync(password, 8);
    await pool.query('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)', [id, username, hash, role]);
    res.json({ id, username, role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;
  if (!username || !role) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, id]);
    res.json({ id, username, role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// THEME (global)
app.get('/api/theme', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT active_theme_id FROM settings LIMIT 1');
    if (!settings[0] || !settings[0].active_theme_id) return res.json(null);
    const [themes] = await pool.query('SELECT * FROM themes WHERE id = ?', [settings[0].active_theme_id]);
    res.json(themes[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/theme', authenticateJWT, requireAdmin, async (req, res) => {
  const { name, primary_color, accent_color, pink_color, light_color } = req.body;
  if (!name || !primary_color || !accent_color || !pink_color || !light_color) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO themes (id, name, primary_color, accent_color, pink_color, light_color) VALUES (?, ?, ?, ?, ?, ?)', [id, name, primary_color, accent_color, pink_color, light_color]);
    // Set as active theme
    await pool.query('INSERT INTO settings (id, active_theme_id) VALUES (1, ?) ON DUPLICATE KEY UPDATE active_theme_id = VALUES(active_theme_id)', [id]);
    res.json({ id, name, primary_color, accent_color, pink_color, light_color });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all themes
app.get('/api/themes', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [themes] = await pool.query('SELECT * FROM themes');
    res.json(themes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Activate a theme by id
app.post('/api/theme/activate', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Theme id required' });
  try {
    // Check if theme exists
    const [themes] = await pool.query('SELECT * FROM themes WHERE id = ?', [id]);
    if (themes.length === 0) return res.status(404).json({ error: 'Theme not found' });
    await pool.query('INSERT INTO settings (id, active_theme_id) VALUES (1, ?) ON DUPLICATE KEY UPDATE active_theme_id = VALUES(active_theme_id)', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a theme by id (admin only)
app.delete('/api/theme/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent deleting the active theme
    const [settings] = await pool.query('SELECT active_theme_id FROM settings LIMIT 1');
    if (settings[0] && settings[0].active_theme_id === id) {
      return res.status(400).json({ error: 'Cannot delete the active theme.' });
    }
    await pool.query('DELETE FROM themes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CUSTOM FIELDS
app.get('/api/custom-fields', authenticateJWT, async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM custom_fields');
    for (const field of fields) {
      if (field.type === 'radio' || field.type === 'dropdown') {
        const [options] = await pool.query('SELECT id, label, value FROM custom_field_options WHERE field_id = ?', [field.id]);
        field.options = options;
      }
    }
    res.json(fields);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/custom-fields', authenticateJWT, requireAdmin, async (req, res) => {
  const { label, type, required, options } = req.body;
  if (!label || !type) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO custom_fields (id, label, type, required) VALUES (?, ?, ?, ?)', [id, label, type, !!required]);
    if ((type === 'radio' || type === 'dropdown') && Array.isArray(options)) {
      for (const opt of options) {
        const optId = require('uuid').v4();
        await pool.query('INSERT INTO custom_field_options (id, field_id, label, value) VALUES (?, ?, ?, ?)', [optId, id, opt.label, opt.value]);
      }
    }
    res.json({ id, label, type, required, options });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/custom-fields/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { label, type, required, options } = req.body;
  if (!label || !type) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query('UPDATE custom_fields SET label = ?, type = ?, required = ? WHERE id = ?', [label, type, !!required, id]);
    await pool.query('DELETE FROM custom_field_options WHERE field_id = ?', [id]);
    if ((type === 'radio' || type === 'dropdown') && Array.isArray(options)) {
      for (const opt of options) {
        const optId = require('uuid').v4();
        await pool.query('INSERT INTO custom_field_options (id, field_id, label, value) VALUES (?, ?, ?, ?)', [optId, id, opt.label, opt.value]);
      }
    }
    res.json({ id, label, type, required, options });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/custom-fields/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM custom_fields WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// RECEIPTS
app.get('/api/receipts', authenticateJWT, async (req, res) => {
  try {
    const [receipts] = await pool.query('SELECT * FROM receipts');
    for (const receipt of receipts) {
      const [fields] = await pool.query('SELECT field_id, value FROM receipt_custom_fields WHERE receipt_id = ?', [receipt.id]);
      receipt.customFields = {};
      for (const f of fields) receipt.customFields[f.field_id] = f.value;
    }
    res.json(receipts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/receipts', authenticateJWT, async (req, res) => {
  const { donor_name, amount, date, payment_method, remarks, payment_status, customFields, star, dob, receiptMembers } = req.body;
  if (!donor_name || !amount || !date || !payment_method) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = require('uuid').v4();
    // Insert with temporary receipt_number
    await pool.query('INSERT INTO receipts (id, receipt_number, donor_name, amount, date, payment_method, remarks, created_by, payment_status, star, dob) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, donor_name, amount, date, payment_method, remarks, req.user.id, payment_status, star, dob]);
    // Save receipt members if provided
    if (Array.isArray(receiptMembers) && receiptMembers.length > 0) {
      for (const m of receiptMembers) {
        const rmid = require('uuid').v4();
        await pool.query('INSERT INTO receipt_members (id, receipt_id, member_id, pooja_type) VALUES (?, ?, ?, ?)', [rmid, id, m.member_id, m.pooja_type]);
      }
    }
    // Get the serial for this receipt
    const [rows] = await pool.query('SELECT serial FROM receipts WHERE id = ?', [id]);
    const serial = rows[0].serial;
    const receipt_number = `SA/TVPM/PR/${serial}`;
    // Generate QR code data (encode receipt info)
    const qrText = `Receipt#: ${receipt_number}\nName: ${donor_name}\nStar: ${star}\nDOB: ${dob}\nAmount: ₹${amount}`;
    const QRCode = require('qrcode');
    const qr_code_data = await QRCode.toDataURL(qrText);
    // Update the receipt with the generated receipt_number and qr_code_data
    await pool.query('UPDATE receipts SET receipt_number = ?, qr_code_data = ? WHERE id = ?', [receipt_number, qr_code_data, id]);
    res.json({ id, receipt_number });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/receipts/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [receipts] = await pool.query('SELECT * FROM receipts WHERE id = ?', [id]);
    if (receipts.length === 0) return res.status(404).json({ error: 'Not found' });
    const receipt = receipts[0];
    const [fields] = await pool.query('SELECT field_id, value FROM receipt_custom_fields WHERE receipt_id = ?', [id]);
    receipt.customFields = {};
    for (const f of fields) receipt.customFields[f.field_id] = f.value;
    // Fetch family members
    const [familyMembers] = await pool.query('SELECT user_id, name, star, dob FROM receipt_family_members WHERE receipt_id = ?', [id]);
    receipt.familyMembers = familyMembers;
    res.json(receipt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/receipts/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM receipts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Bulk delete receipts (admin only)
app.post('/api/receipts/bulk-delete', authenticateJWT, requireAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No ids provided' });
  try {
    await pool.query(`DELETE FROM receipts WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update family members for a receipt
app.put('/api/receipts/:id/family-members', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { familyMembers } = req.body;
  if (!Array.isArray(familyMembers)) return res.status(400).json({ error: 'familyMembers must be an array' });
  try {
    // Delete existing family members for this receipt
    await pool.query('DELETE FROM receipt_family_members WHERE receipt_id = ?', [id]);
    // Insert new family members
    for (const m of familyMembers) {
      const rfmId = require('uuid').v4();
      await pool.query('INSERT INTO receipt_family_members (id, receipt_id, user_id, name, star, dob) VALUES (?, ?, ?, ?, ?, ?)', [rfmId, id, m.user_id || m.id, m.name, m.star, m.dob]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TICKETS
app.get('/api/tickets', authenticateJWT, async (req, res) => {
  try {
    let query = 'SELECT * FROM tickets';
    let params = [];
    if (req.user.role === 'public') {
      query += ' WHERE created_by = ?';
      params.push(req.user.id);
    }
    const [tickets] = await pool.query(query, params);
    res.json(tickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets', authenticateJWT, async (req, res) => {
  const { type, subject, description } = req.body;
  if (!type || !subject) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO tickets (id, type, created_by, subject, description, status) VALUES (?, ?, ?, ?, ?, ?)', [id, type, req.user.id, subject, description, 'open']);
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/tickets/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Not found' });
    const ticket = tickets[0];
    if (req.user.role === 'public' && ticket.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const [messages] = await pool.query('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp ASC', [id]);
    ticket.messages = messages;
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/:id/messages', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    const msgId = require('uuid').v4();
    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = tickets[0];
    if (req.user.role === 'public' && ticket.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)', [msgId, id, req.user.id, req.user.role, message]);
    res.json({ id: msgId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/tickets/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = tickets[0];
    if (req.user.role === 'public' && ticket.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    res.json({ id, status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/tickets/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = tickets[0];
    if (req.user.role === 'public' && ticket.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// BACKUP/RESTORE (admin only)
app.get('/api/backup/export', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const tables = ['users', 'themes', 'settings', 'custom_fields', 'custom_field_options', 'receipts', 'receipt_custom_fields', 'tickets', 'ticket_messages'];
    const data = {};
    for (const table of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${table}`);
      data[table] = rows;
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backup/import', authenticateJWT, requireAdmin, async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Invalid data' });
  try {
    // Clear all tables (in reverse dependency order)
    await pool.query('DELETE FROM ticket_messages');
    await pool.query('DELETE FROM tickets');
    await pool.query('DELETE FROM receipt_custom_fields');
    await pool.query('DELETE FROM receipts');
    await pool.query('DELETE FROM custom_field_options');
    await pool.query('DELETE FROM custom_fields');
    await pool.query('DELETE FROM settings');
    await pool.query('DELETE FROM themes');
    await pool.query('DELETE FROM users');
    // Insert data
    for (const table of Object.keys(data)) {
      for (const row of data[table]) {
        const keys = Object.keys(row);
        const vals = keys.map(k => row[k]);
        const placeholders = keys.map(() => '?').join(',');
        await pool.query(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, vals);
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PAYMENT CONFIG (admin only for POST, public for GET)
app.get('/api/payment/config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_config WHERE enabled = 1 LIMIT 1');
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/payment/config', authenticateJWT, requireAdmin, async (req, res) => {
  const { gateway, key_id, key_secret, enabled } = req.body;
  if (!gateway || !key_id || !key_secret) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query('DELETE FROM payment_config WHERE gateway = ?', [gateway]);
    await pool.query('INSERT INTO payment_config (gateway, key_id, key_secret, enabled) VALUES (?, ?, ?, ?)', [gateway, key_id, key_secret, enabled ? 1 : 0]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// RAZORPAY ORDER
app.post('/api/payment/razorpay/order', authenticateJWT, async (req, res) => {
  const { amount, currency, receipt } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM payment_config WHERE gateway = ? AND enabled = 1 LIMIT 1', ['razorpay']);
    if (rows.length === 0) return res.status(400).json({ error: 'Razorpay not configured' });
    const config = rows[0];
    const razorpay = new Razorpay({ key_id: config.key_id, key_secret: config.key_secret });
    const order = await razorpay.orders.create({ amount, currency: currency || 'INR', receipt, payment_capture: 1 });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// RAZORPAY VERIFY
const crypto = require('crypto');
app.post('/api/payment/razorpay/verify', authenticateJWT, async (req, res) => {
  const { order_id, payment_id, signature } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM payment_config WHERE gateway = ? AND enabled = 1 LIMIT 1', ['razorpay']);
    if (rows.length === 0) return res.status(400).json({ error: 'Razorpay not configured' });
    const config = rows[0];
    const hmac = crypto.createHmac('sha256', config.key_secret);
    hmac.update(order_id + '|' + payment_id);
    const digest = hmac.digest('hex');
    if (digest === signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// BRANCHES (admin CRUD, list for all authenticated)
app.get('/api/branches', authenticateJWT, async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT * FROM branches');
    res.json(branches);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/branches', authenticateJWT, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO branches (id, name) VALUES (?, ?)', [id, name]);
    res.json({ id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/branches/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    await pool.query('UPDATE branches SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/branches/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM branches WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// BOOKING TYPES (admin CRUD, list for all authenticated)
app.get('/api/booking-types', authenticateJWT, async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM booking_types');
    res.json(types);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/booking-types', authenticateJWT, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO booking_types (id, name) VALUES (?, ?)', [id, name]);
    res.json({ id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/booking-types/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    await pool.query('UPDATE booking_types SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/booking-types/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM booking_types WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FAMILIES (admin CRUD, list for all authenticated)
app.get('/api/families', authenticateJWT, async (req, res) => {
  try {
    const [families] = await pool.query('SELECT * FROM families');
    res.json(families);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/families', authenticateJWT, requireAdmin, async (req, res) => {
  const { primary_user_id } = req.body;
  try {
    const id = require('uuid').v4();
    await pool.query('INSERT INTO families (id, primary_user_id) VALUES (?, ?)', [id, primary_user_id || null]);
    res.json({ id, primary_user_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/families/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { primary_user_id } = req.body;
  try {
    await pool.query('UPDATE families SET primary_user_id = ? WHERE id = ?', [primary_user_id || null, id]);
    res.json({ id, primary_user_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/families/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM families WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add family member (public, staff, admin) with family creation logic
app.post('/api/family-members', authenticateJWT, async (req, res) => {
  let { username, password, name, phone, email, star, dob } = req.body;
  try {
    username = username || email || phone || name;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields (username, password, name)' });
    }
    // Always use the main user's family_id, or create one if missing
    let famId = req.user.family_id;
    if (!famId) {
      const famUUID = require('uuid').v4();
      await pool.query('INSERT INTO families (id, primary_user_id) VALUES (?, ?)', [famUUID, req.user.id]);
      famId = famUUID;
      await pool.query('UPDATE users SET family_id = ? WHERE id = ?', [famId, req.user.id]);
    }
    // Only restrict public users from adding to a different family
    if (req.user.role === 'public' && req.user.family_id && req.user.family_id !== famId) {
      return res.status(403).json({ error: 'Cannot add to another family' });
    }
    // Check for duplicate username
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) return res.status(409).json({ error: 'Username exists' });
    const id = require('uuid').v4();
    const hash = bcrypt.hashSync(password, 8);
    await pool.query(
      'INSERT INTO users (id, username, password_hash, role, name, phone, email, star, dob, family_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, 'public', name, phone, email, star, dob, famId]
    );
    res.json({ id, username, name, phone, email, star, dob, family_id: famId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lookup family by phone/email
app.get('/api/family-by-contact', authenticateJWT, async (req, res) => {
  const { phone, email } = req.query;
  if (!phone && !email) return res.status(400).json({ error: 'Missing phone or email' });
  try {
    let query = 'SELECT family_id FROM users WHERE ';
    const params = [];
    if (phone) { query += 'phone = ?'; params.push(phone); }
    if (email) { query += (params.length ? ' OR ' : '') + 'email = ?'; params.push(email); }
    const [rows] = await pool.query(query, params);
    if (rows.length === 0 || !rows[0].family_id) return res.json(null);
    // Get all family members
    const [members] = await pool.query('SELECT * FROM users WHERE family_id = ?', [rows[0].family_id]);
    res.json({ family_id: rows[0].family_id, members });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get family members for any authenticated user (public can only fetch their own family)
app.get('/api/family-members', authenticateJWT, async (req, res) => {
  const { family_id } = req.query;
  let famId = family_id;
  if (!famId) famId = req.user.family_id;
  if (!famId) return res.status(400).json({ error: 'No family_id provided' });
  // Only allow public users to fetch their own family
  if (req.user.role === 'public' && req.user.family_id && req.user.family_id !== famId) {
    return res.status(403).json({ error: 'Cannot view another family' });
  }
  try {
    const [members] = await pool.query('SELECT * FROM users WHERE family_id = ?', [famId]);
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all members for a family
app.get('/api/members', authenticateJWT, async (req, res) => {
  const { family_id } = req.query;
  if (!family_id) return res.status(400).json({ error: 'family_id required' });
  try {
    const [members] = await pool.query('SELECT * FROM members WHERE family_id = ?', [family_id]);
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add a new member to the members table
app.post('/api/members', authenticateJWT, async (req, res) => {
  let { family_id, name, star, dob, phone, email } = req.body;
  try {
    const uuid = require('uuid');
    // 1. Check if user has a family_id
    let userFamilyId = req.user.family_id;
    let newFamilyCreated = false;
    if (!userFamilyId) {
      // 2. Generate new family_id and family_code
      const [famCountRows] = await pool.query('SELECT COUNT(*) as count FROM families');
      const famSerial = famCountRows[0].count + 1;
      const family_code = `SA/PJ/FAM-${famSerial.toString().padStart(3, '0')}`;
      userFamilyId = uuid.v4();
      await pool.query('INSERT INTO families (id, family_code, primary_user_id) VALUES (?, ?, ?)', [userFamilyId, family_code, req.user.id]);
      await pool.query('UPDATE users SET family_id = ? WHERE id = ?', [userFamilyId, req.user.id]);
      newFamilyCreated = true;
    }
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = uuid.v4();
    await pool.query('INSERT INTO members (id, family_id, name, star, dob, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, userFamilyId, name, star || null, dob || null, phone || null, email || null]);
    res.json({ id, family_id: userFamilyId, name, star, dob, phone, email, newFamilyCreated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/members/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, star, dob, phone, email } = req.body;
  try {
    await pool.query('UPDATE members SET name = ?, star = ?, dob = ?, phone = ?, email = ? WHERE id = ?', [name, star, dob, phone, email, id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/members/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/receipt-members', authenticateJWT, async (req, res) => {
  const { receipt_id } = req.query;
  if (!receipt_id) return res.status(400).json({ error: 'receipt_id required' });
  try {
    const [rows] = await pool.query(`
      SELECT m.name, m.star, m.dob, rm.pooja_type, rm.member_id
      FROM receipt_members rm
      JOIN members m ON rm.member_id = m.id
      WHERE rm.receipt_id = ?
    `, [receipt_id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/search-person', authenticateJWT, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });
  try {
    // Search users
    const [users] = await pool.query(
      'SELECT id, name, email, phone, family_id FROM users WHERE phone = ? OR email = ?',
      [query, query]
    );
    if (users.length > 0) return res.json({ person: users[0], type: 'user' });

    // Search members
    const [members] = await pool.query(
      'SELECT id, name, email, phone, family_id FROM members WHERE phone = ? OR email = ?',
      [query, query]
    );
    if (members.length > 0) return res.json({ person: members[0], type: 'member' });

    return res.json({ person: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});

module.exports = { app, pool }; 