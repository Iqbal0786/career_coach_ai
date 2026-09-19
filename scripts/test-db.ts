import "dotenv/config";
import { prisma } from "../lib/db/prisma";

async function main() {
  const chat = await prisma.chat.create({
    data: {
      title: "Test Chat",
    },
  });

  console.log("Created chat:", chat);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });