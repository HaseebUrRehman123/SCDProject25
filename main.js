const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- Backup System ---
function createBackup() {
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `${backupDir}/backup_${timestamp}.json`;

  const records = db.listRecords();
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
  console.log(`📦 Backup created: ${filePath}`);
}

// --- Export System ---
function exportData() {
  const records = db.listRecords();
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

// --- Statistics ---
function viewStatistics() {
  const records = db.listRecords();
  if (records.length === 0) {
    console.log("No records available.");
    return menu();
  }

  const total = records.length;

  const names = records.map(r => r.name);
  const longestName = names.reduce((a, b) => a.length > b.length ? a : b);

  const dates = records.map(r => new Date(r.created || Date.now()));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  const lastModified = new Date();

  console.log(`
Vault Statistics
--------------------------
Total Records: ${total}
Last Modified: ${lastModified}
Longest Name: ${longestName} (${longestName.length} characters)
Earliest Record: ${earliest.toISOString().split('T')[0]}
Latest Record: ${latest.toISOString().split('T')[0]}
`);
  menu();
}

// --- Search Records ---
function searchRecords() {
  rl.question("Enter search keyword: ", keyword => {
    const records = db.listRecords();
    const term = keyword.toLowerCase();

    const results = records.filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.id.toString() === term
    );

    if (results.length === 0) {
      console.log("No records found.");
    } else {
      console.log(`Found ${results.length} matching records:`);
      results.forEach((r, i) =>
        console.log(`${i + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${r.created || 'N/A'}`)
      );
    }
    menu();
  });
}

// --- Sort Records ---
function sortRecords() {
  rl.question("Sort by (1=Name, 2=Date): ", field => {
    rl.question("Order (1=Ascending, 2=Descending): ", order => {
      const records = [...db.listRecords()];

      if (field === '1') {
        records.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        records.sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
      }

      if (order === '2') records.reverse();

      console.log("\nSorted Records:");
      records.forEach((r, i) =>
        console.log(`${i + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${r.created || 'N/A'}`)
      );

      menu();
    });
  });
}

// --- MENU ---
function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Exit
6. Search Records
7. Sort Records
8. Export Data
9. View Vault Statistics
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {

      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            createBackup();
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r =>
          console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`)
        );
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '✅ Record deleted!' : '❌ Record not found.');
          createBackup();
          menu();
        });
        break;

      case '5':
        console.log("👋 Exiting NodeVault...");
        rl.close();
        break;

      case '6':
        searchRecords();
        break;

      case '7':
        sortRecords();
        break;

      case '8':
        exportData();
        menu();
        break;

      case '9':
        viewStatistics();
        break;

      default:
        console.log('❌ Invalid option.');
        menu();
    }
  });
}

menu();
