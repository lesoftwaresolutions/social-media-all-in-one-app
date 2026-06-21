import { pgTable, text, uuid, integer, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analyticsTable = pgTable("analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull(),
  platform: text("platform").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  followers: integer("followers").default(0),
  newFollowers: integer("new_followers").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analyticsTable).omit({ id: true, createdAt: true });
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analyticsTable.$inferSelect;
