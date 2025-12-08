// main.js
const express = require('express');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Backup System ---
async function createBackup() {
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `${backupDir}/backup_${timestamp}.json`;

  const records = await db.listRecords();
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
  console.log(`📦 Backup created: ${filePath}`);
}

// --- Export System ---
async function exportData() {
  const records = await db.listRecords();
  const exportFile = './export.txt';

  const header =
    `Export File: export.txt\n` +
    `Export Date: ${new Date().toLocaleString()}\n` +
    `Total Records: ${records.length}\n\n`;

  const content = records.map((r, i) =>
    `${i + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`
  ).join('\n');

  fs.writeFileSync(exportFile, header + content);
  console.log('✅ Data exported successfully to export.txt');
}

// --- Routes ---

// List all records
app.get('/todo', async (req, res) => {
  try {
    const records = await db.listRecords();
    res.json(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get record by ID
app.get('/todo/:id', async (req, res) => {
  try {
    const records = await db.listRecords();
    const record = records.find(r => r.id === req.params.id);
    if (!record) return res.status(404).send('Not found');
    res.json(record);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add record
app.post('/todo', async (req, res) => {
  try {
    const id = await db.addRecord(req.body);
    await createBackup();
    res.json({ id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update record
app.put('/todo/:id', async (req, res) => {
  try {
    const success = await db.updateRecord(req.params.id, req.body.name, req.body.value);
    res.json({ success });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete record
app.delete('/todo/:id', async (req, res) => {
  try {
    const success = await db.deleteRecord(req.params.id);
    await createBackup();
    res.json({ success });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Export data
app.get('/export', async (req, res) => {
  try {
    await exportData();
    res.send('Data exported successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- Start server ---
db.connect()
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
