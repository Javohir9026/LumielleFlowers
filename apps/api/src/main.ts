import app from "./app.js";
import { startTelegramBot } from "./lib/telegram.js";
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => { console.log(`Lumielle API: http://localhost:${port}`); startTelegramBot(); });
