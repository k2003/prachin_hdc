# HDC OpenData — จังหวัดปราจีนบุรี 📊

แดชบอร์ดรายงานข้อมูลสาธารณสุข จังหวัดปราจีนบุรี  
ระบบแสดงผลตัวชี้วัดด้านสุขภาพเชื่อมโยง MOPH Open Data API

**Live Demo:** `https://<your-username>.github.io/prachin_hdc/`

---

## 🗂️ โครงสร้างไฟล์

```
prachin_hdc/
├── index.html          ← แดชบอร์ดหลัก (Single-Page App)
├── districts_db.js     ← ฐานข้อมูลรหัสอำเภอ 7 อำเภอ
├── hospitals_db.js     ← ฐานข้อมูลรหัสโรงพยาบาล/รพ.สต.
├── api_config.js       ← ตั้งค่า API endpoints & token
├── fetch_engine.js     ← ระบบดึงข้อมูล + cache + auto-refresh
└── README.md
```

---

## 🚀 วิธี Deploy บน GitHub Pages

### ขั้นตอนที่ 1 — สร้าง Repository
```bash
git init
git add .
git commit -m "init: HDC OpenData Prachinburi"
git branch -M main
git remote add origin https://github.com/<username>/prachin_hdc.git
git push -u origin main
```

### ขั้นตอนที่ 2 — เปิด GitHub Pages
1. ไปที่ **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. กด **Save**

เว็บจะขึ้นที่ `https://<username>.github.io/prachin_hdc/` ภายใน 2-3 นาที

---

## ⚙️ ตั้งค่า API (api_config.js)

```js
// ใส่ข้อมูลจาก สสจ.ปราจีนบุรี หรือ MOPH HDC
API_CONFIG.token = 'YOUR_TOKEN_HERE';
API_CONFIG.provinceCode = '25'; // ปราจีนบุรี
```

> **หมายเหตุ:** token ขอได้จากระบบ HDC Service (hdc.moph.go.th)  
> หรือผ่านผู้ดูแลระบบ สสจ.ปราจีนบุรี

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Charts | Chart.js v4 |
| Data | MOPH HDC Open Data API |
| Hosting | GitHub Pages |
| Fonts | Sarabun, IBM Plex Mono |

---

## 📋 ฟีเจอร์

- ✅ แผนที่ SVG แบบโต้ตอบ 7 อำเภอ
- ✅ KPI Explorer 945+ ตัวชี้วัด
- ✅ ตารางหน่วยบริการพร้อม progress bar
- ✅ Bar chart + Donut chart แบบ real-time
- ✅ ระบบ cache + silent auto-refresh
- ✅ API health check & fetch log
- ✅ รองรับการเปลี่ยนปีงบประมาณ (Force Pull)
- ✅ Toast notification & loading overlay
- ✅ Responsive (มือถือ/แท็บเล็ต/เดสก์ท็อป)

---

## 📞 ติดต่อ

สำนักงานสาธารณสุขจังหวัดปราจีนบุรี  
เขตสุขภาพที่ 6
