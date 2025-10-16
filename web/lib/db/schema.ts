import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Blog table schema
 */
export const blog = pgTable("blog", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Blog = typeof blog.$inferSelect;
export type NewBlog = typeof blog.$inferInsert;
