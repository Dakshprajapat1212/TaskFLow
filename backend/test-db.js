require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

async function test() {
  console.time('connect');
  await mongoose.connect(uri, { family: 4 });
  console.timeEnd('connect');
  
  console.time('query');
  const collections = await mongoose.connection.db.collections();
  console.timeEnd('query');
  
  process.exit(0);
}

test().catch(console.error);
