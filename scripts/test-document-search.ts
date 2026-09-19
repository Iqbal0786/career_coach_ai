
import "dotenv/config";
import { searchDocument } from "@/lib/services/retrieval.service";


const documentId = "cmtsism840001hkuu978ijo2d";

async function main() {
  const results = await searchDocument({
    documentId,
    query: "What are my technical skills?",
    limit: 4,
  });

  console.log("\nSearch results:\n");

  results.forEach((result, index) => {
    console.log(`--- Result ${index + 1} ---`);
    console.log("Distance:", result.distance);
    console.log("Content:", result.content);
    console.log();
  });
}

main().catch((error) => {
  console.error("Search test failed:", error);
  process.exit(1);
});