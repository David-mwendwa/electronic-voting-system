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

// Helper function to format numbers with thousands separators
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Helper function to calculate time until next election
const getTimeUntilNextElection = (elections) => {
  const now = new Date();
  const upcoming = elections
    .filter((e) => new Date(e.startDate) > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  if (upcoming.length === 0) return 'No upcoming elections';

  const nextElection = new Date(upcoming[0].startDate);
  const diffTime = nextElection - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

const exportElections = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const Election = (await import('../models/Election.js')).default;

    console.log('\n🔍 Gathering election statistics...');

    // Get all elections and related statistics in parallel
    const [elections, statusStats, candidateStats, voteStats, yearStats] =
      await Promise.all([
        // Get all elections
        Election.find({}).sort({ createdAt: -1 }).lean(),

        // Get status distribution
        Election.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Get candidate statistics
        Election.aggregate([
          {
            $project: {
              candidateCount: { $size: '$candidates' },
              hasResults: {
                $gt: [{ $size: { $objectToArray: '$results' } }, 0],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalCandidates: { $sum: '$candidateCount' },
              avgCandidates: { $avg: '$candidateCount' },
              maxCandidates: { $max: '$candidateCount' },
              minCandidates: { $min: '$candidateCount' },
              electionsWithResults: { $sum: { $cond: ['$hasResults', 1, 0] } },
            },
          },
        ]),

        // Get vote statistics
        Election.aggregate([
          {
            $project: {
              voteCount: { $sum: { $objectToArray: '$results' }.v },
              hasVotes: { $gt: [{ $size: { $objectToArray: '$results' } }, 0] },
            },
          },
          {
            $group: {
              _id: null,
              totalVotes: { $sum: '$voteCount' },
              avgVotes: { $avg: '$voteCount' },
              maxVotes: { $max: '$voteCount' },
              electionsWithVotes: { $sum: { $cond: ['$hasVotes', 1, 0] } },
            },
          },
        ]),

        // Get yearly statistics
        Election.aggregate([
          {
            $project: {
              year: { $year: '$createdAt' },
              status: 1,
              candidateCount: { $size: '$candidates' },
            },
          },
          {
            $group: {
              _id: '$year',
              count: { $sum: 1 },
              active: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
              },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              upcoming: {
                $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] },
              },
              avgCandidates: { $avg: '$candidateCount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    // Format the statistics
    const stats = {
      totalElections: elections.length,
      nextElection: getTimeUntilNextElection(elections),
      status: statusStats.reduce(
        (acc, { _id, count }) => ({
          ...acc,
          [_id]: count,
        }),
        {}
      ),
      candidates: candidateStats[0] || {
        totalCandidates: 0,
        avgCandidates: 0,
        maxCandidates: 0,
        minCandidates: 0,
        electionsWithResults: 0,
      },
      votes: voteStats[0] || {
        totalVotes: 0,
        avgVotes: 0,
        maxVotes: 0,
        electionsWithVotes: 0,
      },
      byYear: yearStats,
    };

    // Display simplified statistics
    console.log('\n📊 Election Statistics:');
    console.log('┌─────────────────────────────┐');
    console.log(
      `│ Total Elections: ${elections.length.toString().padEnd(8)} │`
    );
    console.log('├─────────────────────────────┤');

    // Status Summary
    console.log('│ Status:                    │');
    statusStats.forEach((stat) => {
      console.log(
        `│ • ${stat._id.padEnd(15)} ${stat.count.toString().padStart(6)} │`
      );
    });

    // Candidate Stats
    if (candidateStats[0]) {
      const c = candidateStats[0];
      console.log('├─────────────────────────────┤');
      console.log('│ Candidate Stats:            │');
      console.log(
        `│ • Total:   ${c.totalCandidates.toString().padStart(6)} ${' '.repeat(8)}│`
      );
      console.log(
        `│ • Avg/Elec: ${c.avgCandidates.toFixed(1).padStart(6)} ${' '.repeat(8)}│`
      );
    }

    // Vote Stats
    if (voteStats[0]) {
      const v = voteStats[0];
      console.log('├─────────────────────────────┤');
      console.log('│ Vote Stats:                 │');
      console.log(
        `│ • Total:   ${v.totalVotes.toString().padStart(6)} ${' '.repeat(8)}│`
      );
      console.log(
        `│ • Avg/Elec: ${v.avgVotes.toFixed(1).padStart(6)} ${' '.repeat(8)}│`
      );
    }

    // Yearly Summary
    if (yearStats.length > 0) {
      console.log('├─────────────────────────────┤');
      console.log('│ By Year:                    │');
      yearStats.forEach((year) => {
        console.log(
          `│ • ${year._id}: ${year.count.toString().padStart(3)} ` +
            `(Active: ${year.active || 0}, ` +
            `Completed: ${year.completed || 0})`.padEnd(5) +
            '│'
        );
      });
    }

    console.log('└─────────────────────────────┘\n');

    // Convert MongoDB _id to string and format dates
    const formattedElections = elections.map((election) => ({
      ...election,
      _id: election._id.toString(),
      startDate: election.startDate.toISOString(),
      endDate: election.endDate.toISOString(),
      createdAt: election.createdAt.toISOString(),
      updatedAt: election.updatedAt.toISOString(),
      createdBy: election.createdBy?.toString(),
    }));

    // Create data directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../data/exports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(
      outputDir,
      `elections-export-${timestamp}.json`
    );

    // Ensure directory exists
    await import('fs').then((fs) =>
      fs.promises.mkdir(outputDir, { recursive: true })
    );

    // Write to file
    await writeFile(
      outputFile,
      JSON.stringify(formattedElections, null, 2),
      'utf-8'
    );

    console.log(
      `✅ Successfully exported ${formattedElections.length} elections to:`
    );
    console.log(outputFile);
    console.log(
      '\n📊 Statistics have been logged above. The export file contains detailed election data.'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting elections:', error);
    process.exit(1);
  }
};

exportElections();
