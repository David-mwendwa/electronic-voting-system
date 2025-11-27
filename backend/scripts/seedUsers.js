import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate password in format: firstname123
const generatePassword = (email) => {
  if (!email) return 'password123'; // Fallback
  const username = email.split('@')[0];
  const firstName = username.split(/[._-]/)[0].toLowerCase();
  return `${firstName}123`;
};

const seedUsers = async () => {
  try {
    console.log('Starting user import...');
    await connectDB();

    // Import User model
    const User = (await import('../models/User.js')).default;

    // Read users data from JSON file
    const usersData = JSON.parse(
      await readFile(
        path.join(__dirname, '../../frontend/src/data/additional-voters.json'),
        'utf-8'
      )
    );

    console.log(`Found ${usersData.length} users to import`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each user
    for (const userData of usersData) {
      try {
        const { email } = userData;

        // Skip if no email
        if (!email) {
          console.log('Skipping user: No email provided');
          skippedCount++;
          continue;
        }

        // Generate password based on email
        const password = generatePassword(email);
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          // Update existing user if needed
          const isPasswordChanged = !(await bcrypt.compare(
            password,
            existingUser.password
          ));

          if (isPasswordChanged) {
            existingUser.password = hashedPassword;
            existingUser.passwordConfirm = password; // Will be hashed by pre-save hook
            await existingUser.save({ validateBeforeSave: false });
            console.log(
              `Updated user: ${email} (password reset to ${password})`
            );
            updatedCount++;
          } else {
            console.log(`Skipped existing user: ${email} (no changes needed)`);
            skippedCount++;
          }
        } else {
          // Create new user
          const newUser = new User({
            ...userData,
            password: hashedPassword,
            passwordConfirm: password, // Will be hashed by pre-save hook
            role: 'user', // Default role
            status: 'active', // Default status
          });

          await newUser.save({ validateBeforeSave: false });
          console.log(`Created user: ${email} (password: ${password})`);
          createdCount++;
        }
      } catch (error) {
        console.error(
          `Error processing user ${userData.email || 'unknown'}:`,
          error.message
        );
      }
    }

    // Print summary
    console.log('\nUser Import Summary:');
    console.log('-------------------');
    console.log(`Total processed: ${usersData.length}`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error in seedUsers:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
