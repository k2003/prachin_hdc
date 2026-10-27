// fetch_engine.js
// ระบบดึงข้อมูล MOPH HDC API + Cache + Background Refresh
// ==========================================================

const FetchEngine = (() => {

  // ---- In-memory cache ----
  const _cache = new Map();
  const _fetchLog = [];
  let _silentTimer = null;
  let _onUpdate = null;  // callback เมื่อข้อมูลอัปเดต

  // ==========================================
  // PUBLIC API
  // ==========================================

  /**
   * ดึงข้อมูล KPI ระดับจังหวัด
   * @param {string} year - ปีงบประมาณ เช่น '2568'
   * @param {boolean} force - บังคับ fetch ใหม่ (ข้ามแคช)
   */
  async function fetchProvinceKpi(year = '2568', force = false) {
    const cacheKey = `province_kpi_${year}`;
    if (!force) {
      const cached = _getCache(cacheKey, API_CONFIG.cacheTTL.province);
      if (cached) { _log(`[CACHE] province KPI year=${year}`); return cached; }
    }
    _log(`[FETCH] province KPI year=${year}${force ? ' (force)' : ''}`);
    const url = buildApiUrl('provinceKpi', { yr: year });
    return await _request(url, cacheKey);
  }

  /**
   * ดึงข้อมูล KPI ระดับอำเภอ
   * @param {string} areacode - รหัสอำเภอ เช่น '2501'
   * @param {string} year
   * @param {boolean} force
   */
  async function fetchDistrictKpi(areacode, year = '2568', force = false) {
    const cacheKey = `district_kpi_${areacode}_${year}`;
    if (!force) {
      const cached = _getCache(cacheKey, API_CONFIG.cacheTTL.district);
      if (cached) { _log(`[CACHE] district KPI areacode=${areacode}`); return cached; }
    }
    _log(`[FETCH] district KPI areacode=${areacode} year=${year}`);
    const url = buildApiUrl('districtKpi', { pv: API_CONFIG.provinceCode, am: areacode, yr: year });
    return await _request(url, cacheKey);
  }

  /**
   * ดึงข้อมูล KPI ระดับหน่วยบริการ
   * @param {string} hospcode
   * @param {string} year
   * @param {boolean} force
   */
  async function fetchHospitalKpi(hospcode, year = '2568', force = false) {
    const cacheKey = `hosp_kpi_${hospcode}_${year}`;
    if (!force) {
      const cached = _getCache(cacheKey, API_CONFIG.cacheTTL.hospital);
      if (cached) { _log(`[CACHE] hospital KPI hospcode=${hospcode}`); return cached; }
    }
    _log(`[FETCH] hospital KPI hospcode=${hospcode} year=${year}`);
    const url = buildApiUrl('hospitalKpi', { hcode: hospcode, yr: year });
    return await _request(url, cacheKey);
  }

  /**
   * ดึง KPI Catalog ทั้งหมด
   * @param {boolean} force
   */
  async function fetchKpiCatalog(force = false) {
    const cacheKey = 'kpi_catalog';
    if (!force) {
      const cached = _getCache(cacheKey, API_CONFIG.cacheTTL.catalog);
      if (cached) { _log('[CACHE] KPI catalog'); return cached; }
    }
    _log('[FETCH] KPI catalog');
    const url = buildApiUrl('kpiCatalog');
    return await _request(url, cacheKey);
  }

  /**
   * ดึงข้อมูลตัวชี้วัดเฉพาะรายการ
   * @param {string} kpiCode
   * @param {string} scope - 'province' | 'district' | 'hospital'
   * @param {string} scopeCode - rหัสพื้นที่/หน่วยบริการ
   * @param {string} year
   */
  async function fetchSingleKpi(kpiCode, scope, scopeCode, year = '2568') {
    const cacheKey = `kpi_${kpiCode}_${scope}_${scopeCode}_${year}`;
    const cached = _getCache(cacheKey, API_CONFIG.cacheTTL.province);
    if (cached) return cached;

    _log(`[FETCH] KPI ${kpiCode} (${scope}=${scopeCode})`);
    let url;
    switch (scope) {
      case 'district':
        url = buildApiUrl('districtKpi', { ind: kpiCode, am: scopeCode, yr: year });
        break;
      case 'hospital':
        url = buildApiUrl('hospitalKpi', { ind: kpiCode, hcode: scopeCode, yr: year });
        break;
      default:
        url = buildApiUrl('provinceKpi', { ind: kpiCode, yr: year });
    }
    return await _request(url, cacheKey);
  }

  /**
   * เริ่ม Silent Auto-Refresh
   * @param {Function} callback - fn ที่จะถูกเรียกเมื่อมีข้อมูลใหม่
   * @param {string} year
   */
  function startSilentRefresh(callback, year = '2568') {
    _onUpdate = callback;
    stopSilentRefresh();
    _silentTimer = setInterval(async () => {
      _log(`[AUTO-REFRESH] background refresh...`);
      try {
        const data = await fetchProvinceKpi(year, false);
        if (data && _onUpdate) _onUpdate({ type: 'province', data, year });
      } catch (e) {
        _log(`[AUTO-REFRESH] error: ${e.message}`);
      }
    }, API_CONFIG.refreshInterval);
    _log(`[AUTO-REFRESH] started (interval=${API_CONFIG.refreshInterval / 1000}s)`);
  }

  /** หยุด Auto-Refresh */
  function stopSilentRefresh() {
    if (_silentTimer) { clearInterval(_silentTimer); _silentTimer = null; }
  }

  /** ล้าง cache ทั้งหมด */
  function clearCache() {
    _cache.clear();
    _log('[CACHE] cleared all');
  }

  /** ดึง fetch log */
  function getLog(limit = 30) {
    return _fetchLog.slice(0, limit);
  }

  /** ตรวจสอบสถานะ API endpoints */
  async function checkApiHealth() {
    const results = [];
    const endpoints = [
      { name: 'MOPH HDC Service', url: 'https://hdcservice.moph.go.th' },
      { name: 'hcode.moph.go.th', url: 'https://hcode.moph.go.th' },
    ];
    for (const ep of endpoints) {
      const start = Date.now();
      try {
        const res = await fetch(ep.url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        results.push({ name: ep.name, status: res.ok ? 'ok' : 'warn', latency: Date.now() - start });
      } catch {
        results.push({ name: ep.name, status: 'err', latency: null });
      }
    }
    return results;
  }

  // ==========================================
  // DATA PARSERS
  // ==========================================

  /**
   * แปลง response จาก API เป็น array ที่ใช้งานได้
   * (format ขึ้นกับ endpoint จริง — ปรับได้ตามความจำเป็น)
   */
  function parseKpiResponse(raw) {
    if (!raw) return [];
    // รองรับทั้ง array และ object ที่มี key 'rows' / 'data' / 'result'
    if (Array.isArray(raw)) return raw;
    if (raw.rows) return raw.rows;
    if (raw.data) return Array.isArray(raw.data) ? raw.data : [raw.data];
    if (raw.result) return raw.result;
    return [];
  }

  /**
   * คำนวณ % ผลงาน
   * @param {number} numerator
   * @param {number} denominator
   * @returns {number} 0–100
   */
  function calcPercent(numerator, denominator) {
    if (!denominator || denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100 * 10) / 10;
  }

  /**
   * จัดกลุ่มข้อมูลรายอำเภอ
   * @param {Array} rows - rows จาก API
   * @returns {Object} key = areacode
   */
  function groupByDistrict(rows) {
    return rows.reduce((acc, row) => {
      const code = row.areacode || row.area_code || row.amphoe_code;
      if (code) { if (!acc[code]) acc[code] = []; acc[code].push(row); }
      return acc;
    }, {});
  }

  /**
   * จัดกลุ่มข้อมูลรายหน่วยบริการ
   * @param {Array} rows
   * @returns {Object} key = hospcode
   */
  function groupByHospital(rows) {
    return rows.reduce((acc, row) => {
      const code = row.hospcode || row.hcode;
      if (code) { if (!acc[code]) acc[code] = []; acc[code].push(row); }
      return acc;
    }, {});
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  async function _request(url, cacheKey) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);
    try {
      const res = await fetch(url, {
        headers: getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _setCache(cacheKey, data);
      _log(`[OK] ${url.split('?')[0].split('/').pop()} → ${JSON.stringify(data).length} bytes`);
      return data;
    } catch (err) {
      clearTimeout(timer);
      _log(`[ERR] ${url.split('?')[0].split('/').pop()} → ${err.message}`);
      // คืน mock data เมื่อ API ไม่ตอบสนอง (development mode)
      return _getMockData(cacheKey);
    }
  }

  function _setCache(key, value) {
    _cache.set(key, { value, ts: Date.now() });
  }

  function _getCache(key, ttl) {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > ttl) { _cache.delete(key); return null; }
    return entry.value;
  }

  function _log(msg) {
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = `[${time}] ${msg}`;
    _fetchLog.unshift(entry);
    if (_fetchLog.length > 100) _fetchLog.pop();
    console.log(`FetchEngine: ${msg}`);
  }

  // Mock data สำหรับ development (เมื่อไม่มี token จริง)
  function _getMockData(cacheKey) {
    if (cacheKey.startsWith('district_kpi')) {
      return { mock: true, rows: getAllDistricts().map(d => ({
        areacode: d.code,
        district_name: d.name,
        numerator: Math.floor(Math.random() * 800 + 100),
        denominator: Math.floor(Math.random() * 200 + 1000),
      }))};
    }
    if (cacheKey.startsWith('hosp_kpi') || cacheKey.startsWith('province_kpi')) {
      return { mock: true, rows: [] };
    }
    return { mock: true, rows: [] };
  }

  // ==========================================
  // EXPORT
  // ==========================================
  return {
    fetchProvinceKpi,
    fetchDistrictKpi,
    fetchHospitalKpi,
    fetchKpiCatalog,
    fetchSingleKpi,
    startSilentRefresh,
    stopSilentRefresh,
    clearCache,
    getLog,
    checkApiHealth,
    parseKpiResponse,
    calcPercent,
    groupByDistrict,
    groupByHospital,
  };

})();
