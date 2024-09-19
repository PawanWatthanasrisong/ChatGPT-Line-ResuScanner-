import User from './userDb.js';  // Your updated User model

// Add a default createdAt field to existing users
const migrateUsers = async () => {
  
    await User.updateMany(
      { chatHistory: { $exists: true}},
      { $set: {chatHistory: null}}
    )
    console.log('Migration complete');
  };
  
  migrateUsers().catch(err => console.log(err));