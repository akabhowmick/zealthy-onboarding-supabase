import { Router } from "express";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";

export const usersRouter = Router();
const SALT_ROUNDS = 10;

function getUid(req: any) {
  return req.cookies?.uid as string | undefined;
}

// GET list for /data
usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, aboutMe: true, street: true, city: true, state: true, zip: true,
      birthdate: true, stepCompleted: true, createdAt: true, updatedAt: true
    }
  });
  res.json(users);
});

// GET current for resume
usersRouter.get("/me", async (req, res) => {
  const uid = getUid(req);
  if (!uid) return res.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true, email: true, aboutMe: true, street: true, city: true, state: true, zip: true,
      birthdate: true, stepCompleted: true
    }
  });
  res.json({ user });
});

// POST step1/2/3
usersRouter.post("/", async (req, res) => {
  const body = req.body;

  if (body?.step === 1) {
    const { email, password } = body;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash },
      create: { email, passwordHash: hash }
    });

    const sameSite = (process.env.COOKIE_SAMESITE || "lax") as "lax" | "strict" | "none";
    const secure = (process.env.COOKIE_SECURE || "false") === "true";

    res.cookie("uid", user.id, {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30 * 1000
    });
    return res.json({ ok: true, id: user.id, stepCompleted: user.stepCompleted });
  }

  const uid = getUid(req);
  if (!uid) return res.status(401).json({ error: "No user session. Complete step 1 first." });
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const { step, data } = body;
  if (step === 2 || step === 3) {
    const { aboutMe, street, city, state, zip, birthdate } = data || {};
    const updated = await prisma.user.update({
      where: { id: uid },
      data: {
        aboutMe: aboutMe ?? user.aboutMe,
        street: street ?? user.street,
        city: city ?? user.city,
        state: state ?? user.state,
        zip: zip ?? user.zip,
        birthdate: birthdate ? new Date(birthdate) : user.birthdate,
        stepCompleted: Math.max(user.stepCompleted, step)
      },
      select: { id: true, stepCompleted: true }
    });
    return res.json({ ok: true, ...updated });
  }

  return res.status(400).json({ error: "Invalid step" });
});
