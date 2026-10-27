// api_config.js
// ตั้งค่า MOPH HDC Open Data API สำหรับจังหวัดปราจีนบุรี
// ========================================================
// ⚠️ ใส่ token จริงก่อน deploy

const API_CONFIG = {
  // ---- ข้อมูลจังหวัด ----
  provinceCode: '25',
  provinceName: 'ปราจีนบุรี',
  healthRegion: '6',

  // ---- Auth ----
  // token: ขอจากระบบ HDC Service หรือผู้ดูแล สสจ.ปราจีนบุรี
  token: '',  // << ใส่ token จริงตรงนี้

  // ---- Base URL ----
  baseUrl: 'https://hdcservice.moph.go.th/hdc/reports',

  // ---- Endpoints ----
  endpoints: {
    // ดึง KPI ทั้งหมดระดับจังหวัด
    provinceKpi:     '/area/area_province.php',
    // ดึง KPI ระดับอำเภอ
    districtKpi:     '/area/area_amphoe.php',
    // ดึง KPI ระดับหน่วยบริการ
    hospitalKpi:     '/area/area_hosp.php',
    // รายการตัวชี้วัดทั้งหมด
    kpiCatalog:      '/page/kpi_catalog.php',
    // ข้อมูลโรงพยาบาล
    hospitalList:    'https://hcode.moph.go.th/api/hosp',
  },

  // ---- Query Parameters (ตัวอย่าง) ----
  // ?pv=25&yr=2568&cat=&ind=
  defaultParams: {
    pv: '25',           // รหัสจังหวัด
    yr: '2568',         // ปีงบประมาณ
    cat: '',            // หมวดหมู่ (ว่าง = ทั้งหมด)
    ind: '',            // รหัสตัวชี้วัด (ว่าง = ทั้งหมด)
  },

  // ---- Cache TTL (มิลลิวินาที) ----
  cacheTTL: {
    province:  5 * 60 * 1000,   // 5 นาที
    district:  5 * 60 * 1000,   // 5 นาที
    hospital: 10 * 60 * 1000,   // 10 นาที
    catalog:  60 * 60 * 1000,   // 1 ชั่วโมง
  },

  // ---- Auto-refresh interval ----
  refreshInterval: 60 * 1000,    // 60 วินาที

  // ---- Timeout ----
  requestTimeout: 15000,          // 15 วินาที
};

// ตรวจสอบ config
function validateConfig() {
  const warnings = [];
  if (!API_CONFIG.token) warnings.push('⚠️ ยังไม่ได้ตั้งค่า API token');
  if (API_CONFIG.provinceCode !== '25') warnings.push('⚠️ รหัสจังหวัดไม่ถูกต้อง (ต้องเป็น 25)');
  return warnings;
}

// สร้าง URL สำหรับ request
function buildApiUrl(endpoint, extraParams = {}) {
  const base = API_CONFIG.baseUrl + (API_CONFIG.endpoints[endpoint] || endpoint);
  const params = new URLSearchParams({ ...API_CONFIG.defaultParams, ...extraParams });
  return `${base}?${params.toString()}`;
}

// Headers สำหรับ request
function getHeaders() {
  return {
    'Authorization': `Bearer ${API_CONFIG.token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
