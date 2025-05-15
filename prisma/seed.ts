import { PrismaClient, FeedbackRequestType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Upsert Communities (from user request) ---
  const communitiesToSeed = [
    {
      name: 'Coding Bootcamp Grads',
      description: 'A community for coding bootcamp graduates',
    },
    {
      name: 'Product Design Network',
      description: 'For product designers looking to improve their portfolios',
    },
    {
      name: 'Marketing Professionals',
      description: 'Marketing specialists sharing industry insights',
    },
    {
      name: 'Software Engineering Hub', // This one is used later by name
      description: 'Connecting software engineers of all levels',
    },
    {
      name: 'UX/UI Designers Collective', // This one is used later by name
      description: 'Share work, get feedback, and discuss UX/UI trends',
    },
    {
      name: 'Data Science & Analytics',
      description: 'For professionals working with data analysis and machine learning',
    },
     {
      name: 'Sales & Business Development',
      description: 'Community for sales professionals and business developers',
    },
     {
      name: 'General Career Advice',
      description: 'Get feedback on general job application materials',
    },
  ];

  console.log('Upserting communities...');
  for (const communityData of communitiesToSeed) {
    const community = await prisma.community.upsert({
      where: { name: communityData.name },
      update: { description: communityData.description }, // Update description if it exists
      create: communityData,
    });
    console.log(`Upserted community: ${community.name} (ID: ${community.id})`);
  }
  console.log('Community upsert finished.');

  // --- Clean DB (selectively) ---
  console.log('Deleting existing request & join table data (UserCommunity, RequestCommunity, FeedbackRequest)...');
  // Order matters due to foreign key constraints
  await prisma.feedbackEvaluation.deleteMany(); // Evaluations depend on Responses
  await prisma.feedbackResponse.deleteMany();   // Responses depend on Requests
  await prisma.requestCommunity.deleteMany(); // Join table for Requests and Communities
  await prisma.feedbackRequest.deleteMany();    // Actual Feedback Requests
  await prisma.userCommunity.deleteMany();      // Join table for Users and Communities
  // await prisma.user.deleteMany(); // DO NOT DELETE USERS generally in seeding unless intended for full reset
  // await prisma.community.deleteMany(); // Communities are now managed by the upsert logic above
  console.log('Existing request & join table data deleted.');

  // --- Get Specific Communities (now guaranteed to exist from upsert) ---
  const seCommunity = await prisma.community.findUniqueOrThrow({
    where: { name: 'Software Engineering Hub' },
  });
  const uxCommunity = await prisma.community.findUniqueOrThrow({
    where: { name: 'UX/UI Designers Collective' },
  });
  console.log(`Using community: ${seCommunity.name} (ID: ${seCommunity.id})`);
  console.log(`Using community: ${uxCommunity.name} (ID: ${uxCommunity.id})`);

  // --- Upsert Test Users (Alice & Bob) ---
  const aliceData = {
      email: 'alice@example.com',
      clerkUserId: 'user_alice_clerk_id_dev', // Placeholder development Clerk ID
      firstName: 'Alice',
      lastName: 'Smith',
      credits: 100, // Give more credits for testing
      hasCompletedOnboarding: true,
  };
  const user1 = await prisma.user.upsert({
      where: { email: aliceData.email },
      update: aliceData, 
      create: aliceData, 
  });
  console.log(`Upserted user: ${user1.firstName} (ID: ${user1.id})`);

  const bobData = {
      email: 'bob@example.com',
      clerkUserId: 'user_bob_clerk_id_dev', // Placeholder development Clerk ID
      firstName: 'Bob',
      lastName: 'Johnson',
      credits: 50,
      hasCompletedOnboarding: true,
  };
   const user2 = await prisma.user.upsert({
       where: { email: bobData.email },
       update: bobData,
       create: bobData,
   });
  console.log(`Upserted user: ${user2.firstName} (ID: ${user2.id})`);
  
  // --- Add Users to Communities ---
  // This ensures Alice is in SE and UX, Bob is in SE.
  const userCommunityData = [
      { userId: user1.id, communityId: seCommunity.id },
      { userId: user1.id, communityId: uxCommunity.id },
      { userId: user2.id, communityId: seCommunity.id },
  ];
  for (const ucData of userCommunityData) {
      await prisma.userCommunity.upsert({
          where: { userId_communityId: { userId: ucData.userId, communityId: ucData.communityId } },
          update: {}, create: ucData
      });
  }
  console.log('Ensured users are associated with SE and UX communities.');

  // --- Create Feedback Requests ---
  const request1 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user1.id,
      requestType: FeedbackRequestType.RESUME,
      contentText: 'Could someone please review my updated resume for a Senior SWE role?',
      context: "Applying for FAANG companies, 5 YOE. Specific feedback on bullet points appreciated.",
      status: 'PENDING',
      targetCommunities: {
        create: [{ communityId: seCommunity.id }]
      }
    },
  });
  console.log(`Created feedback request: ${request1.id} (Resume) by ${user1.firstName} in ${seCommunity.name}`);

  const request2 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user1.id,
      requestType: FeedbackRequestType.LINKEDIN,
      contentUrl: 'https://linkedin.com/in/alice-smith-example-dev',
      context: "Open to new opportunities, looking for feedback on my LinkedIn profile headline and summary.",
      status: 'PENDING',
      targetCommunities: {
        create: [
            { communityId: seCommunity.id },
            { communityId: uxCommunity.id }
        ]
      }
    },
  });
  console.log(`Created feedback request: ${request2.id} (LinkedIn) by ${user1.firstName} in SE & UX communities`);

   const request3 = await prisma.feedbackRequest.create({
    data: {
      requesterId: user2.id,
      requestType: FeedbackRequestType.PORTFOLIO,
      contentUrl: 'https://bob-portfolio.example.dev',
      context: "My new UX portfolio site. Looking for feedback on case study presentation.",
      status: 'PENDING',
      targetCommunities: {
          create: [{ communityId: uxCommunity.id }]
      }
    },
  });
   console.log(`Created feedback request: ${request3.id} (Portfolio) by ${user2.firstName} in ${uxCommunity.name}`);

  // Example of an IN_PROGRESS request: Bob gives feedback to Alice's resume request
  const feedbackOnRequest1 = await prisma.feedbackResponse.create({
    data: {
        requestId: request1.id,
        responderId: user2.id,
        feedbackText: "Overall, your resume looks strong, Alice! Quantify achievements more in your bullet points. For example, instead of 'Led a team', try 'Led a team of 5 engineers to deliver X project, resulting in Y% improvement.'"
    }
  });
  await prisma.feedbackRequest.update({
    where: { id: request1.id },
    data: { status: "IN_PROGRESS" }
  });
  console.log(`Created feedback from Bob on Alice's resume (Request ID: ${request1.id}), status set to IN_PROGRESS`);

  // Example of a COMPLETED request: Alice evaluates Bob's feedback on her resume
  await prisma.feedbackEvaluation.create({
    data: {
        responseId: feedbackOnRequest1.id,
        evaluatorId: user1.id, // Alice evaluates
        rating: "SUPER_INSIGHTFUL",
        evaluationText: "Thanks Bob, that's super helpful advice! Will update."
    }
  });
  await prisma.feedbackRequest.update({
    where: { id: request1.id }, // This request is now completed by Alice's evaluation
    data: { status: "COMPLETED" }
  });
  // Simulate credit award for Super Insightful feedback (RATING_REWARDS[5] = 2)
  await prisma.user.update({
    where: { id: user2.id }, // Bob gets credits
    data: { credits: { increment: 2 } }
  });
  console.log(`Alice evaluated Bob's feedback (Response ID: ${feedbackOnRequest1.id}), request ${request1.id} set to COMPLETED. Bob awarded 2 credits.`);


  console.log(`Seeding finished.`);

  // --- Verification Step ---
  const totalUsers = await prisma.user.count();
  const totalCommunities = await prisma.community.count();
  const totalRequests = await prisma.feedbackRequest.count();
  const totalResponses = await prisma.feedbackResponse.count();
  const totalEvaluations = await prisma.feedbackEvaluation.count();

  console.log('---- Verification ----');
  console.log(`Total Users in DB: ${totalUsers}`);
  console.log(`Total Communities in DB: ${totalCommunities}`);
  console.log(`Total Feedback Requests in DB: ${totalRequests}`);
  console.log(`Total Feedback Responses in DB: ${totalResponses}`);
  console.log(`Total Feedback Evaluations in DB: ${totalEvaluations}`);
  console.log('----------------------');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 