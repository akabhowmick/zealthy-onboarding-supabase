import { Router } from "express";
import { prisma } from "../prisma.js";
import { configSchema, DEFAULT_CONFIG, isValidPartition } from "../validation/config.js";

export const configRouter = Router();

configRouter.get("/", async (_req, res) => {
  let cfg = await prisma.config.findUnique({ where: { id: 1 } });
  if (!cfg) {
    cfg = await prisma.config.create({ data: { id: 1, ...DEFAULT_CONFIG } });
  }
  res.json({ step2: cfg.step2, step3: cfg.step3 });
});

configRouter.post("/", async (req, res) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const { step2, step3 } = parsed.data;
  if (!isValidPartition(step2, step3)) {
    return res.status(400).json({
      error: "Each component must be on exactly one of steps 2 or 3, and both steps need at least one."
    });
  }
  const updated = await prisma.config.upsert({
    where: { id: 1 },
    update: { step2, step3 },
    create: { id: 1, step2, step3 }
  });
  res.json({ step2: updated.step2, step3: updated.step3 });
});
