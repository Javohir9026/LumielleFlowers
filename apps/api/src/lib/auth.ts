import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { fail } from "./http.js";
const secretFor = (kind: "customer" | "admin") => {
  const secret = kind === "admin" ? process.env.ADMIN_JWT_SECRET : process.env.CUSTOMER_JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error(`${kind} JWT secret sozlanmagan`);
  return secret;
};
export type AuthedRequest = Request & { auth?: { id: string; kind: "customer" | "admin" } };
const AUTH_TTL_DAYS = 7;
const AUTH_TTL_MS = AUTH_TTL_DAYS * 86400_000;
const sign = (id: string, kind: "customer" | "admin") => jwt.sign({ sub: id, kind }, secretFor(kind), { expiresIn: `${AUTH_TTL_DAYS}d` });
export const setAuthCookie = (res: Response, id: string, kind: "customer" | "admin") => res.cookie(kind === "admin" ? "lumielle_admin" : "lumielle_customer", sign(id, kind), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: AUTH_TTL_MS, path: "/" });
export const clearAuthCookie = (res: Response, kind: "customer" | "admin") => res.clearCookie(kind === "admin" ? "lumielle_admin" : "lumielle_customer", { path: "/" });
export const requireAuth = (kind: "customer" | "admin") => (req: AuthedRequest, res: Response, next: NextFunction) => { try { const token = req.cookies?.[kind === "admin" ? "lumielle_admin" : "lumielle_customer"]; if (!token) throw new Error(); const payload = jwt.verify(token, secretFor(kind)) as jwt.JwtPayload; if (payload.kind !== kind || !payload.sub) throw new Error(); req.auth = { id: payload.sub, kind }; next(); } catch { clearAuthCookie(res, kind); fail(res, 401, "UNAUTHORIZED", "Sessiya tugagan. Qayta kiring."); } };
