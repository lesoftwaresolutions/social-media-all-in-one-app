import { Router } from "express";
import { db, companiesTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const mapCompany = (c: typeof companiesTable.$inferSelect) => ({
  id: c.id,
  company_name: c.companyName,
  logo_url: c.logoUrl,
  industry: c.industry,
  location: c.location,
  website: c.website,
  plan: c.plan,
  created_at: c.createdAt?.toISOString() ?? new Date().toISOString(),
});

const mapProfile = (p: typeof profilesTable.$inferSelect) => ({
  id: p.id,
  company_id: p.companyId,
  full_name: p.fullName,
  email: p.email,
  role: p.role,
  avatar_url: p.avatarUrl,
  created_at: p.createdAt?.toISOString() ?? new Date().toISOString(),
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [company] = await db
      .insert(companiesTable)
      .values({
        companyName: body.company_name,
        industry: body.industry,
        location: body.location,
        website: body.website,
        plan: body.plan ?? "starter",
      })
      .returning();

    res.status(201).json(mapCompany(company));
  } catch (err) {
    req.log.error({ err }, "Failed to create company");
    res.status(500).json({ error: "Failed to create company" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, req.params.id));

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.json(mapCompany(company));
  } catch (err) {
    req.log.error({ err }, "Failed to get company");
    res.status(500).json({ error: "Failed to get company" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updateValues: Record<string, unknown> = {};
    if (body.company_name !== undefined) updateValues.companyName = body.company_name;
    if (body.logo_url !== undefined) updateValues.logoUrl = body.logo_url;
    if (body.industry !== undefined) updateValues.industry = body.industry;
    if (body.location !== undefined) updateValues.location = body.location;
    if (body.website !== undefined) updateValues.website = body.website;
    if (body.plan !== undefined) updateValues.plan = body.plan;

    const [company] = await db
      .update(companiesTable)
      .set(updateValues)
      .where(eq(companiesTable.id, req.params.id))
      .returning();

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.json(mapCompany(company));
  } catch (err) {
    req.log.error({ err }, "Failed to update company");
    res.status(500).json({ error: "Failed to update company" });
  }
});

router.get("/profiles/:id", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, req.params.id));

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json(mapProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.patch("/profiles/:id", async (req, res) => {
  try {
    const body = req.body;
    const updateValues: Record<string, unknown> = {};
    if (body.full_name !== undefined) updateValues.fullName = body.full_name;
    if (body.avatar_url !== undefined) updateValues.avatarUrl = body.avatar_url;
    if (body.company_id !== undefined) updateValues.companyId = body.company_id;
    if (body.role !== undefined) updateValues.role = body.role;

    const existing = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, req.params.id));

    let profile;
    if (existing.length === 0) {
      const [created] = await db
        .insert(profilesTable)
        .values({
          id: req.params.id,
          ...updateValues,
        } as typeof profilesTable.$inferInsert)
        .returning();
      profile = created;
    } else {
      const [updated] = await db
        .update(profilesTable)
        .set(updateValues)
        .where(eq(profilesTable.id, req.params.id))
        .returning();
      profile = updated;
    }

    res.json(mapProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
