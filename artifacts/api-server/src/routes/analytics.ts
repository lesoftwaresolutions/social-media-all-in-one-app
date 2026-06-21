import { Router } from "express";
import { db, analyticsTable, socialAccountsTable, postsTable } from "@workspace/db";
import { eq, and, gte, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/platform-breakdown", async (req, res) => {
  try {
    const { company_id } = req.query as { company_id: string };
    if (!company_id) {
      res.status(400).json({ error: "company_id required" });
      return;
    }

    const accounts = await db
      .select()
      .from(socialAccountsTable)
      .where(eq(socialAccountsTable.companyId, company_id));

    const breakdown = await Promise.all(
      accounts.map(async (acc) => {
        const posts = await db
          .select()
          .from(postsTable)
          .where(
            and(
              eq(postsTable.companyId, company_id),
              eq(postsTable.platform, acc.platform),
              eq(postsTable.status, "published"),
            ),
          );

        const totalLikes = posts.reduce((s, p) => s + (p.likes ?? 0), 0);
        const totalComments = posts.reduce((s, p) => s + (p.comments ?? 0), 0);
        const count = posts.length || 1;

        return {
          platform: acc.platform,
          followers: acc.followers ?? 0,
          posts: posts.length,
          avgLikes: totalLikes / count,
          avgComments: totalComments / count,
          engagementRate: Number(acc.engagementRate ?? 0),
        };
      }),
    );

    res.json(breakdown);
  } catch (err) {
    req.log.error({ err }, "Failed to get platform breakdown");
    res.status(500).json({ error: "Failed to get platform breakdown" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { company_id, platform, days } = req.query as {
      company_id: string;
      platform?: string;
      days?: string;
    };

    if (!company_id) {
      res.status(400).json({ error: "company_id required" });
      return;
    }

    const daysBack = parseInt(days ?? "7", 10);
    const since = new Date();
    since.setDate(since.getDate() - daysBack);
    const sinceStr = since.toISOString().split("T")[0];

    const conditions = [
      eq(analyticsTable.companyId, company_id),
      gte(analyticsTable.date, sinceStr),
    ];
    if (platform) conditions.push(eq(analyticsTable.platform, platform));

    const entries = await db
      .select()
      .from(analyticsTable)
      .where(and(...conditions))
      .orderBy(analyticsTable.date);

    res.json(
      entries.map((e) => ({
        ...e,
        company_id: e.companyId,
        new_followers: e.newFollowers,
        engagement_rate: e.engagementRate ? Number(e.engagementRate) : null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list analytics");
    res.status(500).json({ error: "Failed to list analytics" });
  }
});

export default router;
