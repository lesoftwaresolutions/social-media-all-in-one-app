import { Router } from "express";
import { db, mediaTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const mapMedia = (m: typeof mediaTable.$inferSelect) => ({
  id: m.id,
  company_id: m.companyId,
  file_name: m.fileName,
  file_url: m.fileUrl,
  file_type: m.fileType,
  file_size: m.fileSize,
  uploaded_by: m.uploadedBy,
  created_at: m.createdAt?.toISOString() ?? new Date().toISOString(),
});

router.get("/", async (req, res) => {
  try {
    const { company_id, type } = req.query as {
      company_id: string;
      type?: string;
    };

    if (!company_id) {
      res.status(400).json({ error: "company_id required" });
      return;
    }

    const conditions = [eq(mediaTable.companyId, company_id)];
    if (type && type !== "all") {
      conditions.push(eq(mediaTable.fileType, type));
    }

    const items = await db
      .select()
      .from(mediaTable)
      .where(and(...conditions));

    res.json(items.map(mapMedia));
  } catch (err) {
    req.log.error({ err }, "Failed to list media");
    res.status(500).json({ error: "Failed to list media" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const [item] = await db
      .insert(mediaTable)
      .values({
        companyId: body.company_id,
        fileName: body.file_name,
        fileUrl: body.file_url,
        fileType: body.file_type,
        fileSize: body.file_size,
        uploadedBy: body.uploaded_by,
      })
      .returning();

    res.status(201).json(mapMedia(item));
  } catch (err) {
    req.log.error({ err }, "Failed to create media");
    res.status(500).json({ error: "Failed to create media" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(mediaTable).where(eq(mediaTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete media");
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
