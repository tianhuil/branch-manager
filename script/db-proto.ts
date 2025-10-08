import { getDb } from "@/lib/db/client";
import { blog } from "@/lib/db/schema";

/**
 * Load and print all blog rows from the database
 */
const loadAndPrintBlogs = async (): Promise<void> => {
  const db = getDb();
  const rows = await db.select().from(blog);

  console.log(`Found ${rows.length} blog post(s):\n`);

  rows.forEach((row) => {
    console.log("---");
    console.log(`ID: ${row.id}`);
    console.log(`Title: ${row.title}`);
    console.log(`Slug: ${row.slug}`);
    console.log(`Published: ${row.published}`);
    console.log(`Excerpt: ${row.excerpt || "(none)"}`);
    console.log(`Content length: ${row.content.length} characters`);
    console.log(`Created: ${row.createdAt}`);
    console.log(`Updated: ${row.updatedAt}`);
    console.log("---\n");
  });
};

loadAndPrintBlogs().catch((error) => {
  console.error("Error loading blogs:", error);
  process.exit(1);
});
