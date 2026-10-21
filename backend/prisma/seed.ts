import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

const demoProfiles = [
  {
    displayName: "Creator Studio",
    email: "hello@creatorstudio.io",
    accountType: AccountType.CREATOR,
    industry: "Digital Media",
    bio: "A small production studio creating short-form video, photography and brand campaigns for lifestyle brands.",
    skills: "Video Production, Photography, Social Media, Brand Storytelling",
    portfolioUrl: "https://creatorstudio.example.com",
    twitterUrl: "https://twitter.com/creatorstudio",
    instagramUrl: "https://instagram.com/creatorstudio",
    linkedinUrl: null,
  },
  {
    displayName: "Maya Flores",
    email: "maya.flores@example.com",
    accountType: AccountType.CREATOR,
    industry: "Fashion",
    bio: "Lifestyle and slow-fashion creator sharing honest reviews, capsule wardrobe guides and sustainable styling tips.",
    skills: "Fashion, Styling, Sustainability, Review",
    portfolioUrl: "https://mayaflores.example.com",
    twitterUrl: null,
    instagramUrl: "https://instagram.com/mayaflores",
    linkedinUrl: null,
  },
  {
    displayName: "Bright Labs",
    email: "partners@brightlabs.example.com",
    accountType: AccountType.BRAND,
    industry: "Technology",
    bio: "Consumer hardware brand building affordable smart home devices with a focus on privacy and repairability.",
    skills: "Product Marketing, Brand Identity, E-commerce, Partnerships",
    portfolioUrl: "https://brightlabs.example.com",
    twitterUrl: "https://twitter.com/brightlabs",
    instagramUrl: null,
    linkedinUrl: "https://linkedin.com/company/brightlabs",
  },
  {
    displayName: "Nimbus Coffee Roasters",
    email: "hello@nimbuscoffee.example.com",
    accountType: AccountType.BUSINESS,
    industry: "Food & Beverage",
    bio: "Speciality coffee roaster sourcing single-origin beans directly from smallholder farms across East Africa.",
    skills: "Coffee, Sourcing, Retail, Wholesale",
    portfolioUrl: "https://nimbuscoffee.example.com",
    twitterUrl: null,
    instagramUrl: "https://instagram.com/nimbuscoffee",
    linkedinUrl: null,
  },
  {
    displayName: "The Verdant Table",
    email: "careers@verdanttable.example.com",
    accountType: AccountType.BUSINESS,
    industry: "Food & Beverage",
    bio: "Plant-forward restaurant group running six neighbourhood kitchens with a strong local-sourcing programme.",
    skills: "Hospitality, Menu Development, Local Sourcing, Team Training",
    portfolioUrl: "https://verdanttable.example.com",
    twitterUrl: null,
    instagramUrl: "https://instagram.com/verdanttable",
    linkedinUrl: "https://linkedin.com/company/verdanttable",
  },
  {
    displayName: "Aria Bennett",
    email: "aria.bennett@example.com",
    accountType: AccountType.CREATOR,
    industry: "Technology",
    bio: "Software engineer and creator publishing practical tutorials on TypeScript, testing and developer tooling.",
    skills: "TypeScript, Developer Tooling, Technical Writing, Testing",
    portfolioUrl: "https://ariabennett.example.com",
    twitterUrl: "https://twitter.com/ariabennett",
    instagramUrl: null,
    linkedinUrl: "https://linkedin.com/in/ariabennett",
  },
  {
    displayName: "Northwind Outdoor",
    email: "media@northwindoutdoor.example.com",
    accountType: AccountType.BRAND,
    industry: "Retail",
    bio: "Outdoor apparel brand focused on durable, repairable gear and transparent supply-chain reporting.",
    skills: "Brand Campaigns, Influencer Marketing, Outdoor, Logistics",
    portfolioUrl: "https://northwindoutdoor.example.com",
    twitterUrl: null,
    instagramUrl: "https://instagram.com/northwindoutdoor",
    linkedinUrl: "https://linkedin.com/company/northwindoutdoor",
  },
  {
    displayName: "Lena Okafor",
    email: "lena.okafor@example.com",
    accountType: AccountType.CREATOR,
    industry: "Health & Fitness",
    bio: "Certified strength coach producing evidence-based training plans and short follow-along mobility sessions.",
    skills: "Strength Training, Mobility, Coaching, Nutrition",
    portfolioUrl: "https://lenaokafor.example.com",
    twitterUrl: "https://twitter.com/lenaokafor",
    instagramUrl: "https://instagram.com/lenaokafor",
    linkedinUrl: null,
  },
  {
    displayName: "Paper & Pine Publishing",
    email: "editorial@paperandpine.example.com",
    accountType: AccountType.BUSINESS,
    industry: "Education",
    bio: "Independent publisher of practical design and business books, working with first-time authors.",
    skills: "Publishing, Editing, Editorial Design, Author Development",
    portfolioUrl: "https://paperandpine.example.com",
    twitterUrl: null,
    instagramUrl: null,
    linkedinUrl: "https://linkedin.com/company/paperandpine",
  },
  {
    displayName: "Sonia Marchetti",
    email: "sonia.marchetti@example.com",
    accountType: AccountType.CREATOR,
    industry: "Design",
    bio: "Independent graphic designer documenting colour systems, typography pairing and identity design case studies.",
    skills: "Graphic Design, Typography, Brand Identity, Illustration",
    portfolioUrl: "https://soniamarchetti.example.com",
    twitterUrl: null,
    instagramUrl: "https://instagram.com/soniamarchetti",
    linkedinUrl: "https://linkedin.com/in/soniamarchetti",
  },
] as const;

async function main() {
  console.log("Seeding CreatorConnect demo profiles...");

  for (const profile of demoProfiles) {
    await prisma.profile.upsert({
      where: { email: profile.email },
      update: profile,
      create: profile,
    });
  }

  const count = await prisma.profile.count();
  console.log(`Seed complete. ${count} profiles available in the database.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
