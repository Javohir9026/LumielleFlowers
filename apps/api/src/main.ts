import app from "./app.js";
import { startTelegramBot } from "./lib/telegram.js";

const required = ["DATABASE_URL", "CUSTOMER_JWT_SECRET", "ADMIN_JWT_SECRET", "OTP_PEPPER"] as const;
for (const key of required) {
  const value = process.env[key];
  if (!value || ((key === "CUSTOMER_JWT_SECRET" || key === "ADMIN_JWT_SECRET" || key === "OTP_PEPPER") && value.length < 32)) throw new Error(`${key} production uchun xavfsiz sozlanmagan`);
}
if (process.env.NODE_ENV === "production" && process.env.OTP_DEV_CODE) throw new Error("Productionda OTP_DEV_CODE o‘rnatilmasligi kerak");
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => { console.log(`Lumielle API: http://localhost:${port}`); startTelegramBot(); });
