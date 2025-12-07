const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, 'nodevault.log');

// Helper to write log
function writeLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

// --- Logging functions ---
module.exports = {
  logAdd: (record) => {
    writeLog(`✅ Added Record | ID: ${record.id} | Name: ${record.name} | Value: ${record.value}`);
  },

  logUpdate: (record) => {
    writeLog(`✏️ Updated Record | ID: ${record.id} | New Name: ${record.name} | New Value: ${record.value}`);
  },

  logDelete: (record) => {
    writeLog(`🗑️ Deleted Record | ID: ${record.id}${record.name ? ` | Name: ${record.name}` : ''}`);
  },

  logBackup: (filePath) => {
    writeLog(`📦 Backup Created: ${filePath}`);
  },

  logExport: (filePath) => {
    writeLog(`📤 Data Exported: ${filePath}`);
  }
};
