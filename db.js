// db.js
const { MongoClient, ObjectId } = require('mongodb');

const url = process.env.MONGO_URI;  // MongoDB URI from .env
const collectionName = process.env.COLLECTION_NAME || 'records';

let db, collection;

// --- Connect to MongoDB ---
async function connect() {
  try {
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    db = client.db(); // db name comes from MONGO_URI
    collection = db.collection(collectionName);
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1); // Exit if DB connection fails
  }
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
