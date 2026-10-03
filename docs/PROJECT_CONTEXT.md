# Lumielle Flowers — loyiha konteksti

> Manba: `TZ-lumielle-flowers.md` va `TZ-lumielle-flowers-dev.md`.
> Ushbu fayl keyingi barcha ishlar uchun asosiy texnik kelishuv hisoblanadi.

## Yakuniy texnologik qarorlar

| Qism | Tanlangan texnologiya |
| --- | --- |
| Public web | **Next.js + TypeScript** (App Router, SSR/metadata) |
| Backend API | Node.js 20+, TypeScript, Express |
| Admin panel | Alohida React + TypeScript ilovasi |
| Ma'lumotlar bazasi | PostgreSQL 16 + Prisma |
| Umumiy paket | `packages/shared`: Zod sxemalari, tiplar, formatterlar va konstantalar |

Public web bo‘yicha original dev-TZ’dagi Vite qarori foydalanuvchi topshirig‘i bilan almashtirildi: Next.js ishlatiladi. Admin React ilova bo‘lib qoladi. API barcha klientlar uchun yagona manba bo‘ladi.

## Mahsulot va biznes qoidalari

- Bitta Lumielle Flowers do‘koni, marketplace emas; boshlang‘ich assortiment taxminan 50 mahsulot.
- Faqat Toshkent bo‘ylab bepul yetkazib berish; olib ketish yo‘q; buyurtma 24/7 qabul qilinadi.
- Valyuta faqat UZS; to‘lov — yetkazilganda naqd. Onlayn to‘lov MVP tarkibida emas.
- Web tili: `uz` (asosiy), `ru`, `en`. Tarjima bo‘sh bo‘lsa o‘zbekcha qiymat ko‘rsatiladi.
- Ombor hisobi yo‘q: mavjud bo‘lmagan mahsulot admin tomonidan yashiriladi.
- Chegirma alohida modul emas: `discountPrice` bo‘lsa aksiya; u har doim `price`dan kichik bo‘lishi kerak.
- Mijoz buyurtma berishidan avval +998 telefon raqamiga OTP orqali kiradi. Admin login/parol bilan kiradi.
- Buyurtma narxi, mahsulot nomi va miqdori buyurtma yaratilgan paytda snapshot sifatida saqlanadi; keyingi mahsulot tahriri tarixga ta’sir qilmaydi.
- Buyurtma holatlari: `new → confirmed → delivering → delivered`; `cancelled` holatiga yetkazilguncha o‘tish mumkin. `delivered` va `cancelled` yakuniy.
- Buyurtma yaratish tranzaksiyada, idempotency key bilan, narxlar faqat bazadan hisoblanadi.

## UX / dizayn tamoyillari

- Dizayn `tg.uz` ruhida: toza, tez, mobil-first, tushunarli navigatsiya va ixcham kartalar.
- Brenddan kelib chiqadigan **maksimal 4 ta rang** ishlatiladi. Public web yorug‘ tema; admin yorug‘/qorong‘i tema.
- Hamma UI elementlari — tugma, input, qidiruv, select/dropdown, modal, toast, jadval, pagination, badge va skeleton — loyiha ichidagi alohida custom komponentlardan iborat bo‘ladi. Tayyor UI-kit komponentlari to‘g‘ridan-to‘g‘ri ko‘chirib ishlatilmaydi.
- Animatsiyalar nozik va maqsadli bo‘ladi: sahifaga kirish, modal/drawer, dropdown, toast, savat va kartadagi holat almashinuvi. `prefers-reduced-motion` hurmat qilinadi.
- 360 px dan boshlab gorizontal scrollsiz ishlaydi. Touch nishonlari kamida 44×44 px.
- Mahsulot rasmlari responsiv, WebP variantlarda, lazy loading bilan; birinchi ekran LCP uchun prioritet qilinadi.
- Telegram/Instagram ichki brauzerlarida `dvh`, safe-area va localStorage mavjud bo‘lmasligi holati hisobga olinadi.

## Monorepo tuzilmasi

```text
apps/
  api/                 # Express API, Prisma, uploads
  web/                 # Next.js public storefront
  admin/               # React admin panel
packages/
  shared/              # Zod, domain types, helpers, constants
docs/
docker-compose.yml     # PostgreSQL
package.json           # npm workspaces
README.md
```

## Backend me’yorlari

- Express, Prisma, Zod, Pino, Argon2, JWT, Multer + Sharp, Helmet, CORS va rate-limit ishlatiladi.
- Cookie: mijoz va admin uchun alohida httpOnly JWT cookie hamda alohida secret.
- API bazasi `/api`; muvaffaqiyat javobi `{ data, meta? }`, xato javobi `{ error: { code, message, fields? } }`.
- Pul qiymati butun `INTEGER` so‘mda saqlanadi; floating-point ishlatilmaydi.
- Barcha sana-vaqtlar `timestamptz`; “bugun” chegarasi `Asia/Tashkent` bo‘yicha.
- Query booleanlari maxsus `parseBool` bilan parse qilinadi; `z.coerce.boolean()` ishlatilmaydi.
- Pagination: `page >= 1`, `limit 1..48`, standart 12.
- Rasmlar local diskda (`apps/api/uploads`) saqlanadi; JPEG/PNG/WebP, 5 MB gacha, mahsulotga ko‘pi bilan 6 ta; Sharp orqali `sm`/`md`/`lg` WebP variantlari yaratiladi.
- OTP: 6 xonali, hashlangan, muddati, 5 urinish limiti, 60 soniya cooldown va rate-limit bilan. Developmentda faqat env orqali test kodi mumkin.
- Xavfsizlik: origin check, Helmet, rate limits, maskalangan Pino loglar, request ID.
- SEO: Next.js metadata, sitemap va robots; mahsulot ulashilganda Open Graph preview to‘liq chiqadi.

## Public web funksiyalari

- Bosh sahifa: hero, aksiya mahsulotlari, yangi mahsulotlar, katalogga yo‘l, yetkazish/to‘lov va kontaktlar.
- Katalog: qidiruv (300 ms debounce), saralash, aksiya filtri, mavjud kategoriya filtri, URL’da saqlanadigan pagination, skeleton/empty/error holatlari.
- Mahsulot: galereya, narx va chegirma, tavsif, 1..50 miqdor, savatga qo‘shish toast’i, mobilda sticky action bar.
- Savat: `localStorage`dagi faqat `{ productId, quantity }`, ochilganda serverdan joriy narx/mavjudlikni yangilash, tablararo sinxronlash, nofaol mahsulotni olib tashlash oqimi.
- OTP login: qat’iy +998 maska, 6 xonali kod UX’i, resend timer, xato kodlarini tarjima qilingan xabarlarga aylantirish.
- Checkout: ism, faqat-o‘qish telefon, qabul qiluvchi telefoni, manzil (10..300), ixtiyoriy izoh (≤500), yetkazish bepul va naqd to‘lov xulosasi.
- Mijoz profili: buyurtmalar ro‘yxati va buyurtma tafsiloti.
- Statik sahifalar: biz haqimizda, yetkazish va to‘lov, maxfiylik siyosati.

## Admin funksiyalari

- `/login`, dashboard, buyurtmalar, mahsulotlar, mijozlar yo‘llari; barcha himoyalangan yo‘llar auth talab qiladi va `noindex` bo‘ladi.
- Dashboard: yangi buyurtmalar soni, bugungi buyurtmalar va summa, oxirgi 10 buyurtma.
- Buyurtmalar: status/sana/telefon/raqam filtrlari, tafsilot, telefon/manzilni nusxalash, faqat ruxsat etilgan status o‘zgarishlari. Yangi buyurtma soni 30 soniyada tekshiriladi.
- Mahsulotlar: qidiruv va holat/kategoriya filtri, active toggle, inline narx tahriri, yaratish/tahrirlash/o‘chirish, drag-and-drop rasm tartibi, rasm oldindan ko‘rish va tekshiruvlar.
- Mijozlar: ism, telefon, ro‘yxatdan o‘tgan sana va buyurtmalar soni; profilida barcha buyurtmalari.
- Har bir xavfli amal `ConfirmDialog`; har bir so‘rov uchun loading, empty, error hamda toast holatlari.

## Majburiy custom komponentlar

`Button`, `IconButton`, `TextField`, `PhoneField`, `NumberField`, `SearchField`, `Select`, `DropdownMenu`, `Checkbox`, `Switch`, `Tabs`, `Modal`, `Drawer`, `ConfirmDialog`, `Toast`, `Tooltip`, `Pagination`, `Table`, `StatusBadge`, `ProductCard`, `QuantityPicker`, `ImageUploader`, `Skeleton`, `EmptyState`, `ErrorState`, `LanguageSwitcher`.

Ular design tokenlar (rang, spacing, radius, shadow, typography, transition) orqali boshqariladi va web/admin ehtiyojiga qarab shared yoki ilova-level qatlamga joylanadi.

## MVP tashqarisida

Click/Payme/Uzum, yetkazish vaqtini tanlash, status bo‘yicha SMS/Telegram xabarlari, ombor/zaxira hisobi, promokod va bonuslar, sharhlar, Toshkentdan tashqariga yetkazish, mobil ilova, bir nechta xodim roli, admin Telegram bildirishnomasi.

## Keyin tasdiqlanishi kerak bo‘lgan biznes ma’lumotlari

1. Yetkazish manzili va qabul qiluvchi telefoni alohida maydon bo‘lishi.
2. Kategoriyalar ro‘yxati va mahsulot tavsiflari kerakligi.
3. Rus/ingliz nomlari hamda matnlari; bo‘lmaguncha uzbekcha fallback.
4. Soxta buyurtmalarga qarshi minimal buyurtma summasi kerak-kerak emasligi.
5. Logo, mahsulot rasmlari/narxlari, kontaktlar, statik sahifa matnlari va domen.
6. Production SMS provayderi hamda deploy/hosting keyingi bosqichda tanlanishi.
