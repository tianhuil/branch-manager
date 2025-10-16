import { eq } from "drizzle-orm";
import { getDrizzle } from "./client";
import { blog, type NewBlog } from "./schema";

/**
 * Seed data for the blog table
 */
const seedBlogs: NewBlog[] = [
  {
    title: "Welcome to Branch Manager",
    slug: "welcome-to-branch-manager",
    content: "Branch Manager automates preview database creation for your PRs.",
    excerpt: "Learn about Branch Manager",
    published: true,
  },
  {
    title: "Getting Started",
    slug: "getting-started",
    content: "Preview databases are isolated instances for each pull request.",
    excerpt: "Guide to preview databases",
    published: true,
  },
  {
    title: "Draft Post",
    slug: "draft-post",
    content: "This is a draft post.",
    excerpt: "Draft content",
    published: false,
  },
];

/**
 * Seed the database with initial data
 * This function is idempotent - it will only insert data if it doesn't already exist
 */
export const seedDatabase = async (databaseUrl?: string): Promise<void> => {
  const db = getDrizzle(databaseUrl);

  console.log("Starting database seed...");

  await Promise.all(
    seedBlogs.map(async (blogData) => {
      // Check if blog with this slug already exists
      const existing = await db
        .select()
        .from(blog)
        .where(eq(blog.slug, blogData.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(blog).values(blogData);
        console.log(`✓ Inserted blog: ${blogData.title}`);
      } else {
        console.log(`- Skipped blog (already exists): ${blogData.title}`);
      }
    })
  );

  console.log("Database seed complete!");
};

/**
 * Run seed script when executed directly
 */
if (import.meta.main) {
  seedDatabase()
    .then(() => {
      console.log("Seed script finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}
