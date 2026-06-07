# ClothingCorp Central Hub - ERP, CRM, & WMS Full-Stack Tizimi

Ushbu loyiha kiyim-kechak ulgurji savdo korxonalari uchun maxsus ishlab chiqilgan **Enterprise Resource Planning (ERP)**, **Customer Relationship Management (CRM)** va **Warehouse Management System (WMS)** tizimlarining to'liq integratsiyalashtirilgan va bulutli platformalarga tayyorlangan yechimidir.

Loyiha professional **Clean Architecture** (Sof Arxitektura) tamoyillari asosida qayta qurilgan bo'lib, Frontend (React) va Backend (Node.js/Express) qismlari o'zaro to'laqonli ajratilgan. Bu arxitektura bulutli muhitlarda (xususan, AWS platformasida) yuqori kengayuvchanlik, barqarorlik va xavfsizlik darajasini ta'minlaydi.

---

## 🚀 1. Mahalliy Kompyuterda Ishga Tushirish (Local Run Guide)

Loyiha **React (TypeScript)**, **Vite**, **Express (Node.js)** va **esbuild/tsx** ekotizimida barpo etilgan.

### 1. Tizim Talablari (Prerequisites)
Kompyuteringizda quyidagi dasturlar o'rnatilgan bo'lishi kerak:
- **Node.js** (v18 yoki undan yuqori)
- **npm** (paket menejeri)

### 2. Bog'liqliklar va Kutubxonalarni O'rnatish
Loyiha joylashgan asosiy papkada terminal ochib, quyidagi buyruqni bosing:
```bash
npm install
```

### 3. Ishlab Chiqish Rejimida Yoqish (Development Mode)
Frontend va Backend-ni bir vaqtda parallel ishga tushiruvchi dev-serverni yoqish uchun:
```bash
npm run dev
```
Tizim muvaffaqiyatli ishga tushgach, brauzeringiz orqali **`http://localhost:3000`** manziliga kiring.
*(Eslatma: Dev rejimida Express backend-serveri Vite bilan middleware rejimida integratsiyalashib ishlaydi va CORS muammolarini bartaraf etadi).*

### 4. Ishlab Chiqarish Rejimiga Yig'ish (Production Build & Run)
Mahalliy kompyuterda yoki AWS-ga yuklashdan oldin dasturni optimallashtirilgan yig'ma holatiga keltirish:
```bash
# 1. Kodlarni yig'ish (Vite React + esbuild Node)
npm run build

# 2. Ishlab chiqarish mantiqida serverni yoqish
npm run start
```
Yig'ma fayllar `/dist` papkasida shakllanadi. Server `dist/server.cjs` orqali ishga tushadi va statik frontend fayllarini o'ta tezkor tezlikda serve qiladi.

---

## 🔐 2. Tizim Keys / Kirish Ma'lumotlari

Xavfsiz va toza tizim integratsiyasini sinash uchun foydalaniladigan yagona ma'lumotlar:
- **E-mail (IAM Account Email):** `admin@clothingcorp.com`
- **Parol (Access Token):** `Password123`

---

## 🏗️ 3. Tizim Arxitekturasi (Clean Architecture Splitting)

Loyiha quyidagi qatlamlar asosida qat'iy ajratilgan:

1. **Domain Entities (Sohaviy Tiplar)**: `/src/types.ts` qatlamida joylashgan bo'lib, mijozlar (Customer), tovarlar (Product) va buyurtmalar (Order) modellarini belgilaydi.
2. **Repository Layer (Ma'lumotlar Qatlami)**: `/server/repositories/repositories.ts` va `dbStore.ts` fayllarida amalga oshirilgan. Ma'lumotlarni server-side faylli JSON bazada xavfsiz saqlaydi va boshqaradi.
3. **Service Use-Cases (Biznes Logika Qatlami)**: `/server/services/services.ts` da jamlangan. Ombordagi mahsulot qoldig'ini real vaqtda tekshirish (WMS Validation), buyurtma bekor qilinganda tovarlarni avtomatlashtirilgan holda qayta hisobdan o'tkazish (WMS Rollback) kabi barcha qoidalar shu yerda bajariladi.
4. **Controller Layer (API Gateway Qatlami)**: `/server.ts` da joylashgan Express routing kontrolyorlari hisoblanadi. Request/Response chegaralarini boshqarib, frontend-ning so'rovlariga javob qaytaradi.
5. **Frontend API Client (Darvoza)**: `/src/services/api.ts` orqali frontend-dan kelayotgan so'rovlarni backend-ning tegishli API nuqtalariga bog'laydi.

---

## ☁️ 4. AWS Bulutli Tarmoq Arxitekturasi (BTEC Assignment Brief Aligned)

**Mavzu: CRM, WMS va ERP tizimlarini AWS bulutli xavfsiz tarmoq infratuzilmasiga migratsiya qilish.**

Loyiha AWS muhitiga joylashtirilganda, BTEC mezonlariga ("Bulutda Tarmoq" fanining barcha talablariga) javob berish uchun quyidagi arxitekturada loyihalashtirilishi shart:

```
                            [ Foydalanuvchilar / Brauzerlar ]
                                          │  (Internet HTTPS)
                                          ▼
                                 [ Route 53 (DNS) ]
                                          │
                                          ▼
                                [ CloudFront (CDN) ]
                                          │
                                          ▼
                               [ Internet Gateway ]
                                          │
      ┌───────────────────────────────────┼──────────────────────────────────┐
      │ AWS VPC (10.0.0.0/16)             │                                  │
      │                                                                      │
      │  [ Public Subnet A - 10.0.1.0/24 ] [ Public Subnet B - 10.0.2.0/24 ]  │
      │  ┌──────────────────────────────┐  ┌──────────────────────────────┐  │
      │  │ Application Load Balancer   │  │                              │  │
      │  │ (ALB - Traffic Distributor) ◄──┼──────────────────────────────┤  │
      │  └──────────────┬───────────────┘  └──────────────────────────────┘  │
      │                 │                                                    │
      │                 └─────────────────┐                                  │
      │                                   ▼                                  │
      │  [ Private Subnet A - 10.0.10.0/24 ] [ Private Subnet B - 10.0.11.0/24 ]
      │  ┌───────────────────────────────┐  ┌───────────────────────────────┐│
      │  │ ECS Fargate (Frontend+Backend)│  │ ECS Fargate (Autoscaled Res)  ││
      │  │ [Docker App Container]        │  │ [Docker App Container]        ││
      │  └──────────────┬────────────────┘  └──────────────┬────────────────┘│
      │                 │                                  │                 │
      │                 ▼                                  ▼                 │
      │          [ NAT Gateway ]                    [ NAT Gateway ]          │
      └─────────────────┼──────────────────────────────────┼─────────────────┘
                        │                                  │
                        └─────────► [ Internet ] ◄─────────┘
```

### 1. VPC (Virtual Private Cloud) va Subnet-lar
Kompaniyaning xavfsizligi va ishonchliligini ta'minlash uchun tarmoq izolyatsiya qilinadi:
- **VPC CIDR block:** `10.0.0.0/16` - Kompaniya uchun ajratilgan virtual xususiy tarmoq.
- **Public Subnets (Ochiq tarmoq segmentlari):** `10.0.1.0/24` va `10.0.2.0/24`. Bu yerda faqat **Application Load Balancer (ALB)** joylashadi. Tizim foydalanuvchilaridan (ijrochi direktorlar va mijozlar) kelayotgan barcha tashqi HTTPS so'rovlar birinchi bo'lib shu Load Balancer tomonidan qabul qilinadi.
- **Private Subnets (Yopiq tarmoq segmentlari):** `10.0.10.0/24` va `10.0.11.0/24`. Bizning Dockerizatsiya qilingan Full-Stack ERP/CRM/WMS ilovamiz (ECS Fargate konteynerlari) va ma'lumotlar ombori (JSON fayllar yoki AWS RDS bazalari) faqat shu yopiq subbyektlarda joylashadi. Ularga tashqi dunyodan to'g'ridan-to'g'ri ulanib bo'lmaydi, bu xavfsizlikni 100% kafolatlaydi.

### 2. Internet Gateway va NAT Gateway
- **Internet Gateway (IGW):** Tashqi olamdan kelayotgan so'rovlarni Load Balancer-ga o'tkazish va tarmoq trafigini VPC-ga kiritish/chiqarish uchun xizmat qiladi.
- **NAT Gateway:** Yopiq tarmoqdagi (Private Subnet) konteynerlarimizga faqatgina tashqariga chiqish imkonini beradi (masalan, tizim kutubxonalarini yangilash yoki tashqi kiyim yetkazib beruvchilar API-lariga so'rov yuborish uchun). Ammo tashqaridan yopiq tarmoq segmentiga hech qanday so'rov kira olmaydi.

### 3. Route Tables va Security Groups (Xavfsizlik Devorlari)
- **Route Tables:** VPC-dagi ma'lumotlar oqimining to'g'ri yo'nalish bo'yicha harakatlanishini boshqaradi.
- **Security Groups (Konteyner sathi):**
  - **ALB Security Group:** Faqat `80` (HTTP) va `443` (HTTPS) portlarini barcha tashqi IP-lar uchun ochiq qoldiradi.
  - **App Container Security Group:** Tashqi olamdan kirishni to'liq taqiqlaydi. Faqatgina bizning ALB-dan kelayotgan va maqsadli `3000` portiga yo'naltirilgan ichki tarmoq trafigigagina ruxsat beradi.

### 4. Load Balancing va Auto Scaling (Yuklamani Muvozanatlash va Kengaytirish)
- **Application Load Balancer (ALB):** Kelayotgan barcha foydalanuvchi so'rovlarini tahlil qilib, ularni bir tekisda private subnet-lardagi bir nechta ishchi konteynerlarga taqsimlaydi.
- **Auto Scaling Group:** Kompaniyada mavsumiy yuklamalar ko'payganda (masalan, kiyim-kechak buyurtmalari oqimi keskin o'sib ketganda) yoki CPU yuklamasi 70% dan oshganda, avtomat ravishda qo'shimcha Docker konteynerlarini (ECS Tasks) ishga tushiradi va ALB-ga ulaydi. Yuklama kamayganda esa xarajatlarni tejash uchun konteynerlar sonini kamaytiradi.

### 5. Masofaviy Ulanish (Site-to-Site va Client-to-Site VPN)
- **Site-to-Site VPN:** Kompaniyaning bosh ofisi hamda kiyim-kechak saqlanadigan hududiy omborxonalarini (WMS skanerlash terminallarini) AWS VPC private segmenti bilan shifrlangan IPSec tunnel orqali uzluksiz bog'laydi.
- **Client-to-Site (AWS Client VPN):** Korxona administratorlari va buxgalterlarining istalgan joydan turib maxsus VPN mijoz darslari orqali yopiq tarmoq bilan ulanishini taminlaydi.

---

## 🚀 5. AWS-ga Joylashtirish Qo'llanmasi (AWS Step-by-Step Deployment)

Bizning Docker Dockerfile faylimiz yordamida ilovani AWS-ning turli xizmatlariga osongina joylashtirishingiz mumkin.

### Yondashuv A: AWS App Runner (Eng tez va sodda yo'l)
AWS App Runner - build, deployment va auto-scaling mantiqlarini o'z muvozanatida saqlaydigan zamonaviy AWS xizmatidir.

1. AWS Console-da **AWS App Runner** xizmatiga kiring.
2. **Create Service** tugmasini bosing.
3. Source qismida **Source code repository**-ni tanlang va o'zingizning GitHub hisobingiz orqali ushbu loyiha omborini (repository) bog'lang.
4. **Deployment settings** bandida **Automatic** (CI/CD avtomatlashtirish) tanlang.
5. Konfiguratsiya bosqichida:
   - Runtime: `Python` emas, balki **Docker** deb belgilang.
   - Port: `3000` deb yozing.
6. Service ishlashini yakunlovchi **Create & Deploy** buyrug'ini bosing. Tizim avtomatik ravishda Docker-imageni build qiladi va sizga tayyor xavfsiz HTTPS domen manzilini taqdim etadi.

### Yondashuv B: AWS Elastic Beanstalk (Docker Platformasi)
Elastic Beanstalk butun AWS VPC, ECS va ALB qatlamlarini bitta klik orqali avtomat qurib beradi.

1. Loyihangiz papkasida turib barcha fayllarni `.zip` arxiv shakliga keltiring (fayllar orasida `Dockerfile` va `package.json` bo'lishi shart).
2. AWS Console-da **Elastic Beanstalk** bo'limiga kiring.
3. **Create Application** tugmasini bosing:
   - Name: `ClothingCorp-ERP`
   - Platform: **Docker** deb tanlang.
   - Platform branch: **Docker running on 64bit Al2** (yoki eng oxirgi barqaror versiya).
4. Application code qismida **Upload your code** bandini tanlang va tayyorlagan `.zip` arxiv faylingizni yuklang.
5. Configuration bosqichida xohishingizga ko'ra yuklamalarni boshqarish uchun **High Availability** (ALB va Autoscaling) yoki faqat test qilish uchun **Single Instance** rejimlarini tanlang.
6. **Create App** tugmasini bosing. 3-5 daqiqadan so'ng infratuzilma to'liq barpo etilib, saytingiz bulutda foydalanishga tozo holatda tayyor bo'ladi!

---

## 🐳 6. Mahalliy Docker Orqali Sinash

Agar loyihani mahalliy sharoitda konteyner ko'rinishida sinamoqchi bo'lsangiz:

```bash
# 1. Image-ni yig'ish (Build)
docker build -t clothingcorp-app .

# 2. Konteynerni ishga tushirish (Run)
docker run -p 3000:3000 clothingcorp-app
```
Keyin esa brauzeringizdan `http://localhost:3000` manziliga tashrif buyurib, tizimni to'laqonli sinab ko'rishingiz mumkin. All mantiqlar va arxiv ma'lumotlar real vaqtda server sathida Docker konteynerida saqlanadi!
