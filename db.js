const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'nodevault';
const collectionName = 'records';

let db, collection;

// --- Connect to MongoDB ---
async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  collection = db.collection(collectionName);
}

// --- List all records ---
async function listRecords() {
  if (!collection) throw new Error('DB not connected');
  const records = await collection.find({}).toArray();
  return records.map(r => ({
    id: r._id.toString(),
    name: r.name,
    value: r.value,
    created: r.created,
    updated: r.updated
  }));
}

// --- Add a new record ---
async function addRecord({ name, value }) {
  if (!collection) throw new Error('DB not connected');
  const timestamp = new Date().toISOString();
  const result = await collection.insertOne({
    name,
    value,
    created: timestamp,
    updated: timestamp
  });
  return result.insertedId.toString();
}

// --- Update an existing record ---
async function updateRecord(id, name, value) {
  if (!collection) throw new Error('DB not connected');
  const filter = { _id: new ObjectId(id) };
  const update = {
    $set: {
      name,
      value,
      updated: new Date().toISOString()
    }
  };
  const result = await collection.updateOne(filter, update);
  return result.modifiedCount > 0;
}

// --- Delete a record ---
async function deleteRecord(id) {
  if (!collection) throw new Error('DB not connected');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- Export functions ---
module.exports = {
  connect,
  listRecords,
  addRecord,
  updateRecord,
  deleteRecord
};
