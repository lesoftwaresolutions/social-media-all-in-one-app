import { pgTable, text, uuid, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const socialAccountsTable = pgTable("social_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull(),
  platform: text("platform").notNull(),
  username: text("username"),
  followers: integer("followers").default(0),
  postsCount: integer("posts_count").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }),
  connected: boolean("connected").notNull().default(false),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccountsTable).omit({ id: true, createdAt: true });
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccountsTable.$inferSelect;
