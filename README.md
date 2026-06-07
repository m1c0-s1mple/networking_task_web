# ClothingCorp Central Hub - ERP, CRM, & WMS System

Ushbu loyiha kiyim-kechak korxonalari uchun mo'ljallangan Enterprise Resource Planning (ERP), Customer Relationship Management (CRM) va Warehouse Management System (WMS) tizimining to'liq va modulli integratsiyalashtirilgan yechimidir.

Siz ushbu tizim orqali korporativ mijozlar ro'yxatini boshqarishingiz, omborxonadagi tovarlar (SKU) qoldig'ini real vaqt rejimida nazorat qilishingiz, hamda mijozlar uchun yangi savdo buyurtmalarini shakllantirishingiz mumkin.

---

## 🚀 Mahalliy kompyuterda ishga tushirish (Local Run Guide)

Loyiha **React (TypeScript)** va **Vite** asosida qurilgan bo'lib, o'ta tezkor yuklanish va optimallashtirilgan ishlash tezligiga ega. Mahalliy kompyuteringizda loyihani ishga tushirish uchun quyidagi tartibda amallarni bajaring:

### 1. Tizim talablari (Prerequisites)
Kompyuteringizda quyidagi dasturlar o'rnatilgan bo'lishi lozim:
- **Node.js** (v18 yoki undan yuqori)
- **npm** (Node Package Manager)

### 2. Loyiha bog'liqliklarini o'rnatish (Installation)
Loyihaning asosiy papkasiga o'tib, terminal (cmd/terminal) orqali barcha zaruriy kutubxonalarni yuklab oling:
```bash
npm install
```

### 3. Dasturni mahalliylashtirib (Development Mode) ishga tushirish
Dasturni mahalliy kompyuteringizda sinab ko'rish va ishlab chiqish rejimida yoqish uchun quyidagi buyruqni bosing:
```bash
npm run dev
```
Tizim ishga tushgach, brauzeringiz orqali terminalda ko'rsatilgan manzilga (odatda `http://localhost:3000` yoki `http://localhost:5173`) kiring.

### 4. Loyihani ishlab chiqarish rejimiga yig'ish (Production Build)
Saytning tayyor statik fayllarini server yoki hostingga yuklash uchun quyidagi buyruq orqali optimallashtirilgan yig'mani hosil qiling:
```bash
npm run build
```
Hosil bo'lgan tayyor mahsulot fayllari `/dist` jildida (directory) joylashadi.

---

## 🔐 Tizimga kirish ma'lumotlari (Access Credentials)

Demo-ma'lumotlarni o'chirgach ham xavfsizlikni ta'minlash maqsadida tizimga kirish uchun quyidagi parametrlardan foydalaniladi:

- **E-mail:** `admin@clothingcorp.com`
- **Parol:** `Password123`

---

## 📁 Loyiha Strukturasi (Project Structure)

Ushbu ilova quyidagi tartiblangan va modulli tuzilishga ega:
- `/src/types.ts` – Tizimdagi ma'lumotlar modellari (Customer, Product, Order, User).
- `/src/App.tsx` – Asosiy mantiq, sahifalar routingi, grafik tahlillar (CRM, WMS, ERP ko'rinishlari).
- `/src/main.tsx` – React ilovaning asosiy kirish nuqtasi.
- `package.json` – Ishlatiladigan kutubxonalar va loyiha buyruqlari.
