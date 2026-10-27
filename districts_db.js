// districts_db.js - รหัสพื้นที่อำเภอจังหวัดปราจีนบุรี (geocode)
// รหัสอ้างอิง: กระทรวงมหาดไทย / MOPH HDC areacode format

const DISTRICTS_DB = {
  "2501": "อำเภอเมืองปราจีนบุรี",
  "2502": "อำเภอกบินทร์บุรี",
  "2503": "อำเภอนาดี",
  "2506": "อำเภอบ้านสร้าง",
  "2507": "อำเภอประจันตคาม",
  "2508": "อำเภอศรีมหาโพธิ",
  "2509": "อำเภอศรีมโหสถ"
};

// รหัสจังหวัด
const PROVINCE_CODE = "25";
const PROVINCE_NAME = "ปราจีนบุรี";
const PROVINCE_NAME_EN = "Prachin Buri";
const HEALTH_REGION = "เขตสุขภาพที่ 6";

// ฟังก์ชันช่วย
function getDistrictName(areacode) {
  return DISTRICTS_DB[String(areacode)] || `อำเภอ (${areacode})`;
}

function getAllDistricts() {
  return Object.entries(DISTRICTS_DB).map(([code, name]) => ({ code, name }));
}
