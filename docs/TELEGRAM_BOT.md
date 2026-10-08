# Telegram buyurtma boti

Bot yangi buyurtma tushganda loyiha egasiga buyurtma tarkibi bilan xabar yuboradi. Xabardagi tugmalar orqali buyurtmani qabul qilish, yetkazib berildi deb belgilash yoki sabab kiritib bekor qilish mumkin.

## Sozlash

1. Telegram'da `@BotFather` orqali bot yarating va token oling.
2. `apps/api/.env` fayliga tokenni qo‘shing:

   ```env
   TELEGRAM_BOT_TOKEN=botfather_bergan_token
   ```

3. API'ni ishga tushiring, Telegram'da yangi botga `/start` yuboring. Bot sizning chat ID'ingizni qaytaradi.
4. Shu qiymatni `.env`ga qo‘shing va API'ni qayta ishga tushiring:

   ```env
   TELEGRAM_OWNER_CHAT_ID=raqamli_chat_id
   ```

Faqat `TELEGRAM_OWNER_CHAT_ID` bilan teng bo‘lgan chat buyurtma xabarlarini oladi va action tugmalaridan foydalana oladi.

## Buyurtma oqimi

1. Yangi buyurtma → **Qabul qilish** yoki **Bekor qilish**.
2. Qabul qilingandan keyin → **Yetkazib berildi** yoki **Bekor qilish**.
3. Bekor qilish bosilganda bot sababni so‘raydi; kamida 3 belgi yuborilgach buyurtma bekor qilinadi va sabab buyurtma tarixiga saqlanadi.
