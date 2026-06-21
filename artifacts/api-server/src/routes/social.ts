import { Router } from "express";
import { db, socialAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const mapAccount = (a: typeof socialAccountsTable.$inferSelect) => ({
  id: a.id,
  company_id: a.companyId,
  platform: a.platform,
  username: a.username,
  followers: a.followers,
  posts_count: a.postsCount,
  engagement_rate: a.engagementRate ? Number(a.engagementRate) : null,
  connected: a.connected,
  connected_at: a.connectedAt?.toISOString() ?? null,
  created_at: a.createdAt?.toISOString() ?? new Date().toISOString(),
});

router.get("/", async (req, res) => {
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

    res.json(accounts.map(mapAccount));
  } catch (err) {
    req.log.error({ err }, "Failed to list social accounts");
    res.status(500).json({ error: "Failed to list social accounts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const existing = await db
      .select()
      .from(socialAccountsTable)
      .where(
        and(
          eq(socialAccountsTable.companyId, body.company_id),
          eq(socialAccountsTable.platform, body.platform),
        ),
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(socialAccountsTable)
        .set({
          username: body.username,
          followers: body.followers,
          postsCount: body.posts_count,
          engagementRate: body.engagement_rate?.toString(),
          connected: body.connected ?? false,
          connectedAt: body.connected ? new Date() : null,
        })
        .where(eq(socialAccountsTable.id, existing[0].id))
        .returning();

      res.status(201).json(mapAccount(updated));
      return;
    }

    const [account] = await db
      .insert(socialAccountsTable)
      .values({
        companyId: body.company_id,
        platform: body.platform,
        username: body.username,
        followers: body.followers,
        postsCount: body.posts_count,
        engagementRate: body.engagement_rate?.toString(),
        connected: body.connected ?? false,
        connectedAt: body.connected ? new Date() : null,
      })
      .returning();

    res.status(201).json(mapAccount(account));
  } catch (err) {
    req.log.error({ err }, "Failed to create social account");
    res.status(500).json({ error: "Failed to create social account" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updateValues: Record<string, unknown> = {};
    if (body.username !== undefined) updateValues.username = body.username;
    if (body.followers !== undefined) updateValues.followers = body.followers;
    if (body.posts_count !== undefined) updateValues.postsCount = body.posts_count;
    if (body.engagement_rate !== undefined)
      updateValues.engagementRate = body.engagement_rate?.toString();
    if (body.connected !== undefined) {
      updateValues.connected = body.connected;
      updateValues.connectedAt = body.connected ? new Date() : null;
    }

    const [account] = await db
      .update(socialAccountsTable)
      .set(updateValues)
      .where(eq(socialAccountsTable.id, req.params.id))
      .returning();

    if (!account) {
      res.status(404).json({ error: "Social account not found" });
      return;
    }

    res.json(mapAccount(account));
  } catch (err) {
    req.log.error({ err }, "Failed to update social account");
    res.status(500).json({ error: "Failed to update social account" });
  }
});

export default router;
