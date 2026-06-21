import { Router } from "express";
import { db, postsTable } from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard-summary", async (req, res) => {
  try {
    const { company_id } = req.query as { company_id: string };
    if (!company_id) {
      res.status(400).json({ error: "company_id required" });
      return;
    }

    const allPosts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.companyId, company_id))
      .orderBy(desc(postsTable.createdAt));

    const recentPosts = allPosts.slice(0, 8);

    const totalEngagement = allPosts.reduce(
      (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0),
      0,
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentByWeek = allPosts.filter(
      (p) => p.createdAt && p.createdAt > weekAgo,
    );
    const previousWeek = allPosts.filter((p) => {
      if (!p.createdAt) return false;
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return p.createdAt > twoWeeksAgo && p.createdAt <= weekAgo;
    });

    const postsChange =
      previousWeek.length > 0
        ? ((recentByWeek.length - previousWeek.length) / previousWeek.length) *
          100
        : 0;

    res.json({
      totalFollowers: 0,
      totalEngagement,
      totalPosts: allPosts.length,
      avgEngagementRate: 0,
      recentPosts: recentPosts.map((p) => ({
        ...p,
        hashtags: p.hashtags ?? [],
        scheduled_at: p.scheduledAt?.toISOString() ?? null,
        published_at: p.publishedAt?.toISOString() ?? null,
        created_at: p.createdAt?.toISOString() ?? new Date().toISOString(),
        company_id: p.companyId,
        image_url: p.imageUrl,
        created_by: p.createdBy,
      })),
      weeklyChange: {
        followers: 0,
        engagement: 0,
        posts: postsChange,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { company_id, status, platform } = req.query as {
      company_id: string;
      status?: string;
      platform?: string;
    };
    if (!company_id) {
      res.status(400).json({ error: "company_id required" });
      return;
    }

    const conditions = [eq(postsTable.companyId, company_id)];
    if (status) conditions.push(eq(postsTable.status, status));
    if (platform) conditions.push(eq(postsTable.platform, platform));

    const posts = await db
      .select()
      .from(postsTable)
      .where(and(...conditions))
      .orderBy(desc(postsTable.createdAt));

    res.json(
      posts.map((p) => ({
        ...p,
        hashtags: p.hashtags ?? [],
        scheduled_at: p.scheduledAt?.toISOString() ?? null,
        published_at: p.publishedAt?.toISOString() ?? null,
        created_at: p.createdAt?.toISOString() ?? new Date().toISOString(),
        company_id: p.companyId,
        image_url: p.imageUrl,
        created_by: p.createdBy,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list posts");
    res.status(500).json({ error: "Failed to list posts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [post] = await db
      .insert(postsTable)
      .values({
        companyId: body.company_id,
        platform: body.platform,
        caption: body.caption,
        hashtags: body.hashtags,
        imageUrl: body.image_url,
        status: body.status ?? "draft",
        scheduledAt: body.scheduled_at ? new Date(body.scheduled_at) : null,
        createdBy: body.created_by,
      })
      .returning();

    res.status(201).json({
      ...post,
      hashtags: post.hashtags ?? [],
      scheduled_at: post.scheduledAt?.toISOString() ?? null,
      published_at: post.publishedAt?.toISOString() ?? null,
      created_at: post.createdAt?.toISOString() ?? new Date().toISOString(),
      company_id: post.companyId,
      image_url: post.imageUrl,
      created_by: post.createdBy,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, req.params.id));

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({
      ...post,
      hashtags: post.hashtags ?? [],
      scheduled_at: post.scheduledAt?.toISOString() ?? null,
      published_at: post.publishedAt?.toISOString() ?? null,
      created_at: post.createdAt?.toISOString() ?? new Date().toISOString(),
      company_id: post.companyId,
      image_url: post.imageUrl,
      created_by: post.createdBy,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Failed to get post" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updateValues: Record<string, unknown> = {};
    if (body.caption !== undefined) updateValues.caption = body.caption;
    if (body.hashtags !== undefined) updateValues.hashtags = body.hashtags;
    if (body.image_url !== undefined) updateValues.imageUrl = body.image_url;
    if (body.status !== undefined) updateValues.status = body.status;
    if (body.scheduled_at !== undefined)
      updateValues.scheduledAt = body.scheduled_at
        ? new Date(body.scheduled_at)
        : null;

    const [post] = await db
      .update(postsTable)
      .set(updateValues)
      .where(eq(postsTable.id, req.params.id))
      .returning();

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({
      ...post,
      hashtags: post.hashtags ?? [],
      scheduled_at: post.scheduledAt?.toISOString() ?? null,
      published_at: post.publishedAt?.toISOString() ?? null,
      created_at: post.createdAt?.toISOString() ?? new Date().toISOString(),
      company_id: post.companyId,
      image_url: post.imageUrl,
      created_by: post.createdBy,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(postsTable).where(eq(postsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
