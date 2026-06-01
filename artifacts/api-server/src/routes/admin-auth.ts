import { Router } from "express";
import {
  clearAdminSessionCookie,
  getAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "../lib/admin-auth";

const router = Router();

router.post("/admin/login", (req, res) => {
  const username = String(req.body?.username ?? "");
  const password = String(req.body?.password ?? "");
  if (!verifyAdminCredentials(username, password)) {
    res.status(401).json({ error: "Identifiants invalides." });
    return;
  }

  setAdminSessionCookie(res, username);
  res.json({ authenticated: true });
});

router.post("/admin/logout", (_req, res) => {
  clearAdminSessionCookie(res);
  res.json({ authenticated: false });
});

router.get("/admin/session", (req, res) => {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username: session.username });
});

export default router;

