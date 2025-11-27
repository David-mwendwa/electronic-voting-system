import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
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

const exportUsers = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const User = (await import('../models/User.js')).default;

    // Get user statistics
    console.log('\n Gathering statistics...');

    // User statistics
    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      // Election statistics
      totalElections,
      electionsByStatus,
      electionsByYear,
      totalVotesCast,
      avgVotersPerElection,
    ] = await Promise.all([
      // User stats
      User.countDocuments({}),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

      // Election stats
      mongoose.connection.db.collection('elections').countDocuments({}),
      mongoose.connection.db
        .collection('elections')
        .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
        .toArray(),
      mongoose.connection.db
        .collection('elections')
        .aggregate([
          {
            $project: {
              year: { $year: '$createdAt' },
              status: 1,
            },
          },
          {
            $group: {
              _id: '$year',
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Total votes cast across all elections
      mongoose.connection.db
        .collection('elections')
        .aggregate([
          {
            $group: {
              _id: null,
              totalVotes: { $sum: { $size: '$voters' } },
            },
          },
        ])
        .toArray(),

      // Average voters per election
      mongoose.connection.db
        .collection('elections')
        .aggregate([
          {
            $group: {
              _id: null,
              avgVoters: { $avg: { $size: '$voters' } },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    // Format and display statistics
    console.log('\n User Statistics:');
    console.log('┌─────────────────────────────┐');
    console.log(`│ Total Users: ${totalUsers.toString().padEnd(13)} │`);
    console.log('├─────────────────────────────┤');
    console.log('│ Users by Role:             │');
    usersByRole.forEach((role) =>
      console.log(
        `│   • ${role._id.padEnd(15)} ${role.count.toString().padStart(6)} │`
      )
    );
    console.log('├─────────────────────────────┤');
    console.log('│ Users by Status:           │');
    usersByStatus.forEach((status) =>
      console.log(
        `│   • ${(status._id || 'no status').padEnd(15)} ${status.count.toString().padStart(6)} │`
      )
    );
    console.log('└─────────────────────────────┘');

    // Calculate and format election statistics
    const totalVotes = totalVotesCast[0]?.totalVotes || 0;
    const avgVoters = avgVotersPerElection[0]?.avgVoters?.toFixed(1) || 0;

    console.log('\n  Election Statistics:');
    console.log('┌─────────────────────────────┐');
    console.log(`│ Total Elections: ${totalElections.toString().padEnd(8)} │`);
    console.log('├─────────────────────────────┤');
    console.log('│ Elections by Status:       │');
    electionsByStatus.forEach((election) =>
      console.log(
        `│   • ${election._id.padEnd(15)} ${election.count.toString().padStart(6)} │`
      )
    );
    console.log('├─────────────────────────────┤');
    console.log('│ Elections by Year:         │');
    electionsByYear.forEach((year) =>
      console.log(
        `│   • ${year._id.toString().padEnd(15)} ${year.total.toString().padStart(6)} │` +
          ` (${year.completed} completed)`
      )
    );
    console.log('├─────────────────────────────┤');
    console.log(`│ Total Votes Cast: ${totalVotes.toString().padEnd(7)} │`);
    console.log(`│ Avg Voters/Election: ${avgVoters.padEnd(4)} │`);
    console.log('└─────────────────────────────┘');

    // Get all users with all fields except password, using direct MongoDB collection access
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();

    // Format the data safely
    const formattedUsers = allUsers.map((user) => {
      const formattedUser = {
        _id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'inactive',
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: user.updatedAt
          ? new Date(user.updatedAt).toISOString()
          : new Date().toISOString(),
      };

      // Add optional fields if they exist
      if (user.phone) formattedUser.phone = user.phone;
      if (user.address) formattedUser.address = user.address;
      if (user.gender) formattedUser.gender = user.gender;
      if (user.id) formattedUser.id = user.id;
      if (user.hasVoted !== undefined) formattedUser.hasVoted = user.hasVoted;
      if (user.description) formattedUser.description = user.description;

      // Handle dateOfBirth safely
      if (user.dateOfBirth) {
        try {
          formattedUser.dateOfBirth = new Date(user.dateOfBirth)
            .toISOString()
            .split('T')[0];
        } catch (e) {
          console.warn(
            `Invalid dateOfBirth for user ${user._id}: ${user.dateOfBirth}`
          );
        }
      }

      // Handle arrays safely
      if (Array.isArray(user.createdElections)) {
        formattedUser.createdElections = user.createdElections.map((id) =>
          id.toString()
        );
      }
      if (Array.isArray(user.votedIn)) {
        formattedUser.votedIn = user.votedIn.map((id) => id.toString());
      }

      return formattedUser;
    });

    // Create data directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../data/exports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `users-export-${timestamp}.json`);

    // Ensure directory exists
    await import('fs').then((fs) =>
      fs.promises.mkdir(outputDir, { recursive: true })
    );

    // Write to file
    await writeFile(
      outputFile,
      JSON.stringify(formattedUsers, null, 2),
      'utf-8'
    );

    console.log(
      `\n✅ Successfully exported ${formattedUsers.length} users to:`
    );
    console.log(outputFile);

    // Show sample of exported data
    console.log('\nSample of exported data:');
    console.log(formattedUsers.slice(0, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error exporting users:', error);
    process.exit(1);
  }
};

exportUsers();
