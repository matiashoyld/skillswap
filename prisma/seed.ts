import { PrismaClient, FeedbackRequestType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Clean DB ---
  // Order matters due to foreign key constraints
  // Only delete request-related data, keep users and communities
  console.log('Deleting existing request & join table data...');
  await prisma.requestCommunity.deleteMany();
  await prisma.feedbackRequest.deleteMany();
  await prisma.userCommunity.deleteMany();
  // await prisma.user.deleteMany(); // DO NOT DELETE USERS
  console.log('Existing request & join table data deleted.');

  // --- Get Existing Communities ---
  const seCommunity = await prisma.community.findUnique({
    where: { name: 'Software Engineering Hub' },
  });
  const uxCommunity = await prisma.community.findUnique({
    where: { name: 'UX/UI Designers Collective' },
  });

  if (!seCommunity || !uxCommunity) {
    console.error('Required communities "Software Engineering Hub" or "UX/UI Designers Collective" not found.');
    console.error('Please run the original seed script first or ensure these communities exist.');
    process.exit(1);
  }
  console.log(`Using existing community: ${seCommunity.name} (ID: ${seCommunity.id})`);
  console.log(`Using existing community: ${uxCommunity.name} (ID: ${uxCommunity.id})`);


  // --- Upsert Test Users (Alice & Bob) ---
  const aliceData = {
      email: 'alice@example.com',
      clerkUserId: 'user_alice_clerk_id', // Use a placeholder or real dev ID if known
      firstName: 'Alice',
      lastName: 'Smith',
      credits: 10,
      hasCompletedOnboarding: true,
  };
  const user1 = await prisma.user.upsert({
      where: { email: aliceData.email },
      update: aliceData, // Update if exists
      create: aliceData, // Create if doesn't exist
  });
  console.log(`Upserted user: ${user1.firstName} (ID: ${user1.id})`);

  const bobData = {
      email: 'bob@example.com',
      clerkUserId: 'user_bob_clerk_id', // Use a placeholder or real dev ID if known
      firstName: 'Bob',
      lastName: 'Johnson',
      credits: 5,
      hasCompletedOnboarding: true,
  };
   const user2 = await prisma.user.upsert({
       where: { email: bobData.email },
       update: bobData,
       create: bobData,
   });
  console.log(`Upserted user: ${user2.firstName} (ID: ${user2.id})`);

  // --- Add Users to Communities (or ignore if relation exists) ---
  // Use `upsert` or `createMany` with `skipDuplicates` if Prisma version supports it,
  // otherwise, this might error if the relationship already exists. For simplicity,
  // we'll try createMany and rely on the cleaning step to avoid duplicates for now.
  // A more robust solution would query existing relations first.
  await prisma.userCommunity.createMany({
    data: [
      { userId: user1.id, communityId: seCommunity.id },
      { userId: user1.id, communityId: uxCommunity.id },
      { userId: user2.id, communityId: seCommunity.id },
    ],
    skipDuplicates: true, // Add this if your Prisma version supports it
  });
  console.log('Ensured users are associated with communities.');

  // --- Create Feedback Requests (from Alice) ---
  // Since we delete requests above, we can use simple create here.
  const request1 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user1.id,
      requestType: FeedbackRequestType.RESUME,
      contentText: 'Could someone please review my updated resume?',
      status: 'PENDING',
    },
  });
  console.log(`Created feedback request: ${request1.id} (Type: ${request1.requestType}) by ${user1.firstName}`);

  const request2 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user1.id,
      requestType: FeedbackRequestType.LINKEDIN,
      contentUrl: 'https://linkedin.com/in/alice-smith-example',
      status: 'PENDING',
    },
  });
  console.log(`Created feedback request: ${request2.id} (Type: ${request2.requestType}) by ${user1.firstName}`);

  // --- Broadcast Requests to Communities ---
  // Since we delete requestCommunities above, we can use simple create here.
  await prisma.requestCommunity.create({
    data: {
      requestId: request1.id,
      communityId: seCommunity.id,
    },
  });
  console.log(`Broadcast request ${request1.id} to community ${seCommunity.name}`);

  // Broadcast Alice's LinkedIn request to both communities she's in
  await prisma.requestCommunity.createMany({
    data: [
      { requestId: request2.id, communityId: seCommunity.id },
      { requestId: request2.id, communityId: uxCommunity.id },
    ],
  });
  console.log(`Broadcast request ${request2.id} to communities ${seCommunity.name} and ${uxCommunity.name}`);

  // --- Create a request from Bob (to test filtering later) ---
   const request3 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user2.id,
      requestType: FeedbackRequestType.PORTFOLIO,
      contentUrl: 'https://bob-portfolio.example.com',
      status: 'PENDING',
    },
  });
   console.log(`Created feedback request: ${request3.id} (Type: ${request3.requestType}) by ${user2.firstName}`);

   // Broadcast Bob's request only to the SE community
   await prisma.requestCommunity.create({
     data: {
       requestId: request3.id,
       communityId: seCommunity.id,
     },
   });
   console.log(`Broadcast request ${request3.id} to community ${seCommunity.name}`);


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 