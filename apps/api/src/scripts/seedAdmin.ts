import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
const login = process.env.ADMIN_LOGIN ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "change-me";
await prisma.admin.upsert({ where: { login }, update: { passwordHash: await argon2.hash(password) }, create: { login, passwordHash: await argon2.hash(password) } });
console.log(`Admin tayyor: ${login}`); await prisma.$disconnect();
