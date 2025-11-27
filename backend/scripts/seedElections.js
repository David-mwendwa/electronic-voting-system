import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

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

const generateElections = (count = 3) => {
  const elections = [];
  const statuses = ['upcoming', 'active', 'completed'];

  for (let i = 0; i < count; i++) {
    const startDate = faker.date.soon({ days: i * 5 });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2); // 2-day election period

    const election = {
      title: faker.helpers.arrayElement([
        `${faker.location.county()} ${faker.helpers.arrayElement(['Gubernatorial', 'Senatorial', 'Member of Parliament'])} Election ${faker.date.future().getFullYear()}`,
        `${faker.company.name()} Student Union Election`,
        `${faker.location.city()} Local Council Election`,
      ]),
      description: faker.lorem.paragraph(),
      startDate,
      endDate,
      status: statuses[i % statuses.length],
      candidates: Array.from(
        { length: faker.number.int({ min: 2, max: 5 }) },
        () => ({
          name: faker.person.fullName(),
          party: faker.helpers.arrayElement([
            'Independent',
            `${faker.location.county()} Peoples Party`,
            `New ${faker.person.lastName()} Movement`,
            `United ${faker.location.country()} Alliance`,
            `${faker.person.lastName()} Party`,
            `Progressive ${faker.helpers.arrayElement(['Democratic', 'Liberal', 'Conservative', 'Green'])} Party`,
            `Alliance for ${faker.location.city()}`,
            `People's ${faker.helpers.arrayElement(['Freedom', 'Justice', 'Unity'])} Party`,
          ]),
          gender: faker.person.sex(),
        })
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For completed elections, add results
    if (election.status === 'completed') {
      election.results = {};
      let totalVotes = 0;

      election.candidates.forEach((candidate, index) => {
        const votes = faker.number.int({ min: 100, max: 1000 });
        election.results[candidate.name] = votes;
        totalVotes += votes;
      });

      election.totalVotes = totalVotes;
    }

    elections.push(election);
  }

  return elections;
};

const seedElections = async (count = 3) => {
  try {
    console.log('Starting election seeding...');
    await connectDB();

    const Election = (await import('../models/Election.js')).default;

    // Clear existing elections (optional)
    // await Election.deleteMany({});

    // Generate sample elections
    const elections = generateElections(count);

    // Insert elections
    const createdElections = await Election.insertMany(elections);

    console.log(`\nSuccessfully seeded ${createdElections.length} elections:`);
    createdElections.forEach((election, index) => {
      console.log(`\n${index + 1}. ${election.title}`);
      console.log(`   Status: ${election.status}`);
      console.log(
        `   Period: ${election.startDate.toLocaleDateString()} - ${election.endDate.toLocaleDateString()}`
      );
      console.log(`   Candidates: ${election.candidates.length}`);
      if (election.status === 'completed') {
        console.log(`   Total Votes: ${election.totalVotes}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding elections:', error);
    process.exit(1);
  }
};

// Get count from command line or use default (3)
const count = process.argv[2] ? parseInt(process.argv[2]) : 3;
seedElections(count);
