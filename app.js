/* JINDEVINESIA - ตรรกะของร้าน (app.js) โหลดโดย firebase.js */

var CACHE = window.PRE || {}, LOCALK = ['cart', 'fav'], GLOB = ['nt', 'info', 'ft', 'wl', 'th', 'open', 'gr', 'cp', 'rm', 'bl', 'py', 'ac', 'qa', 'sv_list'];

// ===== ข้อมูลตัวอย่างและบริการแบบปรับแต่งได้ =====
let SV = L('sv_list') || {
  cash: { key: 'cash', n: 'ซื้อสด', m: 0, dp: 100, lo: 100, hi: 100 },
  down: { key: 'down', n: 'วางดาวน์', m: 0.2, dp: 30, lo: 10, hi: 50 },
  full: { key: 'full', n: 'ผ่อนครบรับของ', m: 0.15, dp: 0, lo: 0, hi: 100 },
  go: { key: 'go', n: 'ผ่อนไปใช้ไป', m: 0.25, dp: 20, lo: 10, hi: 50 },
  chill: { key: 'chill', n: 'ผ่อนสบายๆ', m: 0.18, dp: 10, lo: 5, hi: 40 },
  fast: { key: 'fast', n: 'อนุมัติไว', m: 0.22, dp: 40, lo: 20, hi: 60 }
};

const getALL = () => Object.keys(SV);
let P = [
  { id: 'A001', n: 'iPhone 13', s: '128GB', c: 'ดำ', h: 2, p: 11900, qty: 5, b: 'ลดราคา', t: '#442E23', k: '#2a1c15', sv: ['cash', 'down', 'full', 'go'] },
  { id: 'A002', n: 'iPhone 13', s: '128GB', c: 'ขาว', h: 1, p: 17900, qty: 2, b: 'ขายดี', t: '#5E3A31', k: '#e6d9d0', sv: ['cash', 'down', 'full'] },
  { id: 'A003', n: 'iPhone 14', s: '128GB', c: 'ม่วง', h: 2, p: 15900, qty: 8, b: 'ใหม่', t: '#6B4656', k: '#a98f9c', sv: ['cash', 'down', 'go'] },
  { id: 'A004', n: 'iPhone 15', s: '128GB', c: 'ชมพู', h: 1, p: 25900, qty: 1, b: 'ลดราคา', t: '#7a4a4f', k: '#f5c6cb', sv: ['cash', 'down', 'full', 'go'] }
];

const BN = [['linear-gradient(120deg, #442E23, #8a5a44)', 'โปรโมชั่นประจำเดือน', 'ดูโปรทั้งหมด']];

// ===== state =====
const $ = s => document.querySelector(s);
function L(k) { try { return JSON.parse(localStorage.getItem('jv_' + k)); } catch (e) { return null; } }
function W(k, v) { try { localStorage.setItem('jv_' + k, JSON.stringify(v)); } catch (e) {} }

let U = L('u') || {}, me = L('me'), cart = L('cart') || [], fav = L('fav') || [];
const S = { sel: [], v: 'welcome', a: null, q: '', h: '0', sv: 'all', m: 'in', cs: 'cash', mo: 12, dp: 30, mq: '', lateDays: 7, edSvc: null };

const fm = n => ' ฿' + Math.round(n).toLocaleString('en-US');
const pd = id => P.find(x => x.id === id);
const $MO = [3, 5, 6, 9, 10, 12, 15];

let PX = L('px') || {}, BNR = L('bn') || [], OPEN = L('open') !== false; P = L('pr') || P;
let INFO = L('info') || 'ร้านโทรศัพท์ JINDEVINESIA มีทั้งมือ 1 และมือ 2 ซื้อสดหรือผ่อนได้';
let AC = L('ac') || [['', 'เคสโทรศัพท์', 199], ['', 'ฟิล์มกระจก', 99], ['', 'หัวชาร์จ', 350]];
let QA = L('qa') || [['ซื้อสด ต่างจากผ่อนยังไง?', 'ซื้อสดคือจ่ายเต็มจำนวนรับเครื่องทันที'], ['ผ่อนครบรับของ?', 'ผ่อนครบจำนวนแล้วมารับเครื่องได้เลย']];

let MB = L('mb') || {};
let DS = L('ds') || [], OH = L('oh') || [], PF = L('pf') || {}, TG = L('tg') || ['ขายดี', 'ลดราคา', 'ใหม่'];

const is0 = p => p.oos || (p.qty != null && p.qty !== '' && +p.qty <= 0);
const GONE = { id: '', n: 'สินค้านี้ถูกลบ', s: '-', c: '-', h: 1, p: 0, k: '#999', sv: ['cash'], oos: 1 };

const hd = (t, to = 'me') => `<div class="bar"><button class="rb" onclick="go('${to}')">${ic('back')}</button><b>${t}</b><div style="width:40px"></div></div>`;

const prow = (p, del, act, gray) => {
  const g = gray && is0(p);
  const lowStock = p.qty != null && p.qty <= 3;
  return `<div class="it ${g ? 'gy' : ''}">
    <div class="th">${art(p.k)}</div>
    <div class="m">
      <b>${p.n} ${p.s || ''}</b>
      <small style="display:block;color:var(--mut)">ราคา ${fm(p.p)} ${p.qty != null ? `| สต็อก: ${p.qty} ชิ้น` : ''}</small>
      ${lowStock ? `<span class="stock-badge stock-low">⚠️ สต็อกใกล้หมด (${p.qty})</span>` : ''}
    </div>
    ${act ? `<button class="bt" style="padding:6px 14px;font-size:12px" onclick="${act}">เลือก</button>` : ''}
  </div>`;
};

// ======================
// 1. ส่งออกข้อมูล CSV/Excel
// ======================
const csvQ = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const csvOut = R => '\ufeff' + R.map(r => r.map(csvQ).join(',')).join('\r\n');

function downloadCSV(filename, csvData) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function expCust() {
  const R = [['ชื่อผู้ใช้/UID', 'ชื่อจริง', 'นามสกุล', 'ชื่อเล่น', 'เบอร์โทร', 'ที่อยู่', 'รหัสไปรษณีย์']];
  names().forEach(n => {
    const f = PF[n] || {};
    R.push([n, f.first || '', f.last || '', f.nick || '', f.tel || '', f.addr || '', f.zip || '']);
  });
  downloadCSV('customers_export.csv', csvOut(R));
}

function expInstallments() {
  const R = [['รหัสสัญญา/ชื่อเครื่อง', 'ชื่อลูกค้า', 'เบอร์โทร', 'ประเภทบริการ', 'ยอดรวมสัญญา', 'ชำระแล้ว', 'คงเหลือ', 'งวดละ', 'สถานะ']];
  names().forEach(n => {
    const items = mb(n).items || [];
    const f = PF[n] || {};
    items.forEach(x => {
      const paid = +x.p || 0;
      const total = +x.t || 0;
      const rem = Math.max(0, total - paid);
      R.push([x.n || x.code || '-', f.nick || f.first || n, f.tel || '-', x.sv || '-', total, paid, rem, x.pm || 0, rem === 0 ? 'ผ่อนครบแล้ว' : 'อยู่ระหว่างผ่อน']);
    });
  });
  downloadCSV('installment_contracts.csv', csvOut(R));
}

// ======================
// 2. สรุปคนขาดผ่อน + คัดลอกข้อความ LINE
// ======================
let RM = L('rm') || 'เรียนคุณ (NAME) จากร้าน (SHOP) ขอแจ้งเตือนยอดผ่อนสินค้า (DEVICE) ยอดค้างชำระ (DUE) บาท (เลยกำหนดมาแล้ว (DAYS) วัน) รบกวนชำระเพื่อรักษาสิทธิ์ ขอบคุณครับ';

const getLateList = () => {
  const list = [];
  const now = new Date();
  names().forEach(n => {
    const items = mb(n).items || [];
    const f = PF[n] || {};
    items.forEach((x, i) => {
      if (x.dd) {
        const dueDate = new Date(x.dd);
        const diffDays = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        const paid = +x.p || 0;
        const total = +x.t || 0;
        if (diffDays > 0 && paid < total) {
          list.push({
            user: n,
            idx: i,
            name: f.nick || f.first || n,
            tel: f.tel || '-',
            device: x.n || x.code || 'เครื่องผ่อน',
            lateDays: diffDays,
            dueAmount: x.pm || 0,
            total: total,
            paid: paid,
            item: x
          });
        }
      }
    });
  });
  return list.sort((a, b) => b.lateDays - a.lateDays);
};

function copyNotice(item) {
  let msg = RM.replace('(NAME)', item.name)
              .replace('(SHOP)', WL.name || 'JINDEVINESIA')
              .replace('(DEVICE)', item.device)
              .replace('(DUE)', fm(item.dueAmount))
              .replace('(DAYS)', item.lateDays);
  cpy(msg);
  toast('คัดลอกข้อความทวงส่ง LINE แล้ว');
}

const admLateSummary = () => {
  const lates = getLateList();
  const limit = S.lateDays || 7;
  return `<div class="pg">
    <b>สรุปคนขาดผ่อน (เลยกำหนดชำระ)</b>
    <div style="display:flex;gap:8px;align-items:center;margin:10px 0">
      <small style="color:var(--mut)">ไฮไลต์สีแดงเมื่อขาดผ่อนเกิน:</small>
      <input type="number" id="lateLimit" value="${limit}" style="width:70px;padding:4px 8px" onchange="S.lateDays=+this.value;render(true)">
      <small>วัน</small>
    </div>
    ${lates.length === 0 ? '<p style="color:var(--mut)">ไม่มีรายการขาดผ่อนในขณะนี้</p>' : lates.map(x => {
      const isCritical = x.lateDays >= limit;
      return `<div class="late-card ${isCritical ? 'highlight' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b>👤 ${x.name} (${x.tel})</b>
          <span style="color:var(--red);font-weight:600">เกินกำหนด ${x.lateDays} วัน</span>
        </div>
        <div style="font-size:12px;margin:6px 0;color:var(--mut)">
          สินค้า: <b>${x.device}</b> | ยอดงวดนี้: <b style="color:var(--ink)">${fm(x.dueAmount)}</b><br>
          จ่ายแล้ว: ${fm(x.paid)} / ยอดเต็ม: ${fm(x.total)}
        </div>
        <button class="bt" style="width:100%;padding:8px;font-size:12px;margin-top:4px" onclick='copyNotice(${JSON.stringify(x)})'>
          📋 คัดลอกข้อความทวงสุภาพ (ส่ง LINE)
        </button>
      </div>`;
    }).join('')}
  </div>`;
};

// ======================
// 3. ระบบจัดการบริการ (เพิ่ม/แก้ไข/ลบ)
// ======================
function svSaveService() {
  const k = $('#svc_key').value.trim();
  const n = $('#svc_n').value.trim();
  const m = +$('#svc_m').value || 0;
  const dp = +$('#svc_dp').value || 0;
  if (!k || !n) return toast('กรุณากรอกรหัสและชื่อบริการ');
  
  SV[k] = { key: k, n, m, dp, lo: dp, hi: 100 };
  W('sv_list', SV);
  S.edSvc = null;
  render(true);
  toast('บันทึกบริการสำเร็จ');
}

function svDelService(k) {
  if (k === 'cash') return toast('ไม่สามารถลบบริการซื้อสดได้');
  delete SV[k];
  W('sv_list', SV);
  render(true);
  toast('ลบบริการเรียบร้อย');
}

const admServiceMgmt = () => {
  const keys = Object.keys(SV);
  return `<div class="pg">
    <b>จัดการประเภทบริการ (ผ่อน / ซื้อสด)</b>
    <p style="color:var(--mut);font-size:12px">กำหนดประเภทการผ่อน วางดาวน์ หรือปรับดอกเบี้ย/เงื่อนไขบริการ</p>
    
    <div class="bx" style="margin:10px 0">
      <b>${S.edSvc ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</b>
      <label>รหัสบริการ (เช่น full, down, my_plan)</label>
      <input id="svc_key" value="${S.edSvc ? S.edSvc.key : ''}" ${S.edSvc ? 'readonly' : ''} placeholder="ภาษาอังกฤษเท่านั้น">
      <label>ชื่อบริการที่แสดงให้ลูกค้าเห็น</label>
      <input id="svc_n" value="${S.edSvc ? S.edSvc.n : ''}" placeholder="เช่น ผ่อนไปใช้ไป 0%">
      <div style="display:flex;gap:8px">
        <div>
          <label>เปอร์เซ็นต์บวกเพิ่ม (มาร์กอัป)</label>
          <input id="svc_m" type="number" step="0.01" value="${S.edSvc ? S.edSvc.m : 0}" placeholder="0.2 = +20%">
        </div>
        <div>
          <label>% ดาวน์เริ่มต้น</label>
          <input id="svc_dp" type="number" value="${S.edSvc ? S.edSvc.dp : 0}" placeholder="30">
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="bt" style="flex:1" onclick="svSaveService()">บันทึกบริการ</button>
        ${S.edSvc ? `<button class="wb2" style="flex:1" onclick="S.edSvc=null;render(true)">ยกเลิก</button>` : ''}
      </div>
    </div>

    <b>รายการบริการปัจจุบัน</b>
    ${keys.map(k => {
      const s = SV[k];
      return `<div class="it" style="margin:8px 0">
        <div class="m">
          <b>${s.n} (${s.key})</b>
          <small style="display:block;color:var(--mut)">บวกเพิ่ม: ${(s.m * 100).toFixed(0)}\% \vert{} ดาวน์ขั้นต่ำ: ${s.dp}%</small>
        </div>
        <button class="bt" style="padding:4px 10px;font-size:12px" onclick='S.edSvc=SV["${k}"];render(true)'>แก้ไข</button>
        ${k !== 'cash' ? `<button class="wb2" style="padding:4px 10px;font-size:12px;color:var(--red)" onclick='svDelService("${k}")'>ลบ</button>` : ''}
      </div>`;
    }).join('')}
  </div>`;
};

// ======================
// 4. หน้า Admin รวมทุกฟังก์ชัน
// ======================
const mb = n => {
  let b = MB[n];
  if (!b) b = MB[n] = { items: [] };
  if (!b.items) b = MB[n] = { items: [] };
  return b;
};

const names = () => [...new Set([...Object.keys(U), ...Object.keys(MB)])];

const memRows = () => {
  const q = (S.mq || '').toLowerCase().trim();
  const ks = names().filter(n => {
    const f = PF[n] || {};
    const items = mb(n).items || [];
    const matchUser = n.toLowerCase().includes(q) || (f.nick || '').toLowerCase().includes(q) || (f.first || '').toLowerCase().includes(q) || (f.tel || '').includes(q);
    const matchContract = items.some(x => (x.n || '').toLowerCase().includes(q) || (x.code || '').toLowerCase().includes(q));
    return matchUser || matchContract;
  });

  return ks.map(n => {
    const f = PF[n] || {};
    return `<div class="it" onclick="S.mv='${n}';render(true)">
      <div class="m">
        <b>${f.nick || f.first || n} (${f.tel || 'ไม่มีเบอร์'})</b>
        <small style="display:block;color:var(--mut)">สัญญา/เครื่องในครอบครอง: ${(mb(n).items || []).length} รายการ</small>
      </div>
      <button class="bt" style="padding:6px 12px;font-size:12px">ดูข้อมูล</button>
    </div>`;
  }).join('') || '<p style="color:var(--mut);padding:10px">ไม่พบข้อมูลที่ค้นหา</p>';
};

const admX = () => `<div class="pg">
  <b>ส่งออกข้อมูล / สรุปย่อ</b>
  <p style="color:var(--mut);font-size:12px">ดาวน์โหลดไฟล์ CSV สำหรับนำไปเปิดใน Excel หรือ Google Sheets</p>
  <button class="bt" style="width:100%;margin-bottom:10px" onclick="expCust()">📥 ส่งออกรายชื่อลูกค้าทั้งหมด (CSV)</button>
  <button class="bt" style="width:100%;background:var(--brand)" onclick="expInstallments()">📥 ส่งออกสัญญาผ่อนชำระทั้งหมด (CSV)</button>
</div>`;

const admM = () => {
  if (S.mv && names().includes(S.mv)) return admMd(S.mv);
  return `<div class="pg">
    <b>ค้นหาและจัดการสมาชิก</b>
    <div class="sr" style="margin:10px 0">
      ${ic('search')}
      <input placeholder="ค้นหา ชื่อ, เบอร์โทร, หรือรหัสสัญญา..." value="${S.mq || ''}" oninput="S.mq=this.value;mlist()">
    </div>
    <div id="ml">${memRows()}</div>
  </div>`;
};

function mlist() { const e = $('#ml'); if (e) e.innerHTML = memRows(); }

const admDC = () => `<div class="pg">
  <b>โค้ดส่วนลด (ระบบตัดยอดสุทธิจริง)</b>
  <div class="bx" style="margin:10px 0">
    <label>รหัสโค้ดส่วนลด</label>
    <input id="dc_c" placeholder="เช่น DISCOUNT100">
    <label>จำนวนเงินที่ลด (บาท)</label>
    <input id="dc_v" type="number" placeholder="100">
    <button class="bt" style="width:100%;margin-top:10px" onclick="addDC()">เพิ่มโค้ดส่วนลด</button>
  </div>
  ${DS.map((d, i) => `<div class="it"><div class="m"><b>${d.c}</b><small>ลด ${fm(d.v)}</small></div><button onclick="DS.splice(${i},1);W('ds',DS);render(true)">ลบ</button></div>`).join('')}
</div>`;

// ======================
// 5. ระบบคำนวณส่วนลด & ตัดสต็อก
// ======================
function useDC() {
  const code = ($('#rc_dc') || {}).value.trim().toUpperCase();
  const d = DS.find(x => x.c === code);
  if (d) {
    S.dc_val = d.v;
    toast(`ใช้โค้ดส่วนลดลด ${fm(d.v)} บาทสำเร็จ`);
  } else {
    S.dc_val = 0;
    toast('ไม่พบโค้ดส่วนลดนี้');
  }
  render(true);
}

function doOrder() {
  if (!me) { toast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'); return go('auth'); }
  
  // ตัดสต็อกสินค้า
  cart.forEach(c => {
    const p = pd(c.id);
    if (p && p.qty != null) {
      p.qty = Math.max(0, p.qty - 1);
      if (p.qty === 0) p.oos = 1;
    }
  });
  W('pr', P);

  const newOrder = {
    id: 'JV' + Math.floor(1000 + Math.random() * 9000),
    st: 'รอยืนยัน',
    u: me,
    t: new Date().toLocaleDateString('th-TH'),
    it: cart.map(c => ({ ...c, p: pd(c.id) })),
    discount: S.dc_val || 0
  };

  OH.push(newOrder);
  W('oh', OH);
  cart = [];
  W('cart', cart);
  S.dc_val = 0;
  toast('บันทึกออเดอร์เรียบร้อยแล้ว');
  go('hist');
}

// ======================
// Helper & Icons
// ======================
const IC = {
  home: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  back: '<path d="M15 19l-7-7 7-7"/>'
};
const ic = k => `<svg class="i" viewBox="0 0 24 24">${IC[k] || ''}</svg>`;
const art = k => k && k.length > 30 ? `<img src="${k}" style="width:100%;height:100%;object-fit:cover">` : `<div style="background:${k || '#ccc'};width:100%;height:100%"></div>`;

function cpy(t) {
  navigator.clipboard.writeText(t).then(() => toast('คัดลอกลง Clipboard แล้ว')).catch(() => {
    const e = document.createElement('textarea'); e.value = t; document.body.appendChild(e); e.select(); document.execCommand('copy'); document.body.removeChild(e); toast('คัดลอกเรียบร้อย');
  });
}

function toast(t) {
  const e = $('#ts');
  if (!e) return;
  e.textContent = t; e.style.opacity = 1;
  setTimeout(() => { e.style.opacity = 0; }, 2500);
}

function go(v) { S.v = v; scrollTo(0, 0); render(); }

// ======================
// Views Render Main
// ======================
const V = {
  welcome: () => `<div class="wc"><div class="wh"><h1>JINDEVINESIA</h1><p>ร้านขายและผ่อนโทรศัพท์มือถือ</p><button class="wb1" onclick="go('home')">เข้าสู่หน้าหลัก</button></div></div>`,
  home: () => `<div class="bar"><b>JINDEVINESIA</b><button class="rb" onclick="go('admin')">⚙️</button></div>
    <div class="pg">
      <button class="bt" style="width:100%;margin-bottom:10px" onclick="go('shop')">📱 ดูสินค้าทั้งหมด</button>
    </div>`,
  shop: () => `<div class="bar"><button class="rb" onclick="go('home')">${ic('back')}</button><b>เลือกร้านค้า</b></div>
    <div class="pg">
      ${P.map(p => prow(p, false, `go('detail');S.a='${p.id}'`)).join('')}
    </div>`,
  detail: () => {
    const p = pd(S.a);
    if (!p) return `<div class="pg">ไม่พบสินค้า</div>`;
    return `<div class="bar"><button class="rb" onclick="go('shop')">${ic('back')}</button><b>${p.n}</b></div>
      <div class="pg">
        <div class="dim">${art(p.k)}</div>
        <h3>${p.n} ${p.s}</h3>
        <p style="color:var(--red);font-weight:600">ราคา: ${fm(p.p)}</p>
        <p>คงเหลือ: ${p.qty != null ? p.qty + ' ชิ้น' : 'พร้อมส่ง'}</p>
        <button class="bt" style="width:100%" onclick="cart.push({id:'${p.p.id}'});W('cart',cart);toast('เพิ่มลงตระกร้าแล้ว');go('cart')">หยิบใส่ตะกร้า</button>
      </div>`;
  },
  cart: () => {
    const subtotal = cart.reduce((a, c) => a + (pd(c.id) ? pd(c.id).p : 0), 0);
    const discount = S.dc_val || 0;
    const net = Math.max(0, subtotal - discount);
    return `<div class="bar"><button class="rb" onclick="go('shop')">${ic('back')}</button><b>ตะกร้าสินค้า</b></div>
      <div class="pg">
        ${cart.map(c => prow(pd(c.id))).join('')}
        <div class="bx">
          <div class="rw"><span>รวมยอด:</span> <b>${fm(subtotal)}</b></div>
          <div class="rw"><span>ส่วนลด:</span> <b style="color:var(--red)">-${fm(discount)}</b></div>
          <div class="rw" style="font-size:16px"><span>ยอดสุทธิ:</span> <b style="color:var(--brand)">${fm(net)}</b></div>
          <div style="display:flex;gap:4px;margin-top:8px">
            <input id="rc_dc" placeholder="โค้ดส่วนลด">
            <button class="bt" style="padding:6px 12px" onclick="useDC()">ใช้โค้ด</button>
          </div>
          <button class="bt" style="width:100%;margin-top:14px" onclick="doOrder()">ยืนยันการสั่งซื้อ</button>
        </div>
      </div>`;
  },
  admin: () => `<div class="bar"><button class="rb" onclick="go('home')">${ic('back')}</button><b>จัดการหลังบ้าน Admin</b></div>
    <div class="seg">
      <button class="${S.admTab === 'l' ? 'on' : ''}" onclick="S.admTab='l';render(true)">🔴 สรุปขาดผ่อน</button>
      <button class="${S.admTab === 'm' || !S.admTab ? 'on' : ''}" onclick="S.admTab='m';render(true)">👤 ค้นหาสมาชิก</button>
      <button class="${S.admTab === 's' ? 'on' : ''}" onclick="S.admTab='s';render(true)">⚙️ ประเภทบริการ</button>
      <button class="${S.admTab === 'x' ? 'on' : ''}" onclick="S.admTab='x';render(true)">📂 ส่งออกไฟล์</button>
    </div>
    ${S.admTab === 'l' ? admLateSummary() : ''}
    ${S.admTab === 'm' || !S.admTab ? admM() : ''}
    ${S.admTab === 's' ? admServiceMgmt() : ''}
    ${S.admTab === 'x' ? admX() : ''}`
};

function render(keep) {
  const y = window.scrollY;
  const app = $('#app');
  if (app && V[S.v]) app.innerHTML = V[S.v]();
  if (keep) window.scrollTo(0, y);
}

render();
