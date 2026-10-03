import type { Response } from "express";
export const ok = <T>(res: Response, data: T, status = 200, meta?: Record<string, unknown>) => res.status(status).json(meta ? { data, meta } : { data });
export const fail = (res: Response, status: number, code: string, message: string, fields?: Record<string, string>) => res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
