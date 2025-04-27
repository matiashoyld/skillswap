import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const communities = [
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
      name: 'Software Engineering Hub',
      description: 'Connecting software engineers of all levels',
    },
    {
      name: 'UX/UI Designers Collective',
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

  for (const communityData of communities) {
    const community = await prisma.community.upsert({
      where: { name: communityData.name },
      update: {}, // No updates needed if it exists, just ensure it's there
      create: communityData,
    });
    console.log(`Created or found community with id: ${community.id} (${community.name})`);
  }

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