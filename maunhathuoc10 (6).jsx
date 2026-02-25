import { useState, createContext, useContext, useCallback, useRef, useEffect } from "react";

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ── Medicine Image System ─────────────────────────────────────────────────────
const GROUP_THEMES = {
  "Kháng sinh": {
    bg: "#EFF6FF", accent: "#3B82F6", text: "#1D4ED8",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#DBEAFE"/><rect x="34" y="18" width="12" height="44" rx="6" fill="#3B82F6"/><rect x="18" y="34" width="44" height="12" rx="6" fill="#3B82F6"/><circle cx="40" cy="40" r="6" fill="white"/></svg>)
  },
  "Giảm đau - Hạ sốt": {
    bg: "#FFF7ED", accent: "#F97316", text: "#C2410C",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#FFEDD5"/><ellipse cx="40" cy="40" rx="18" ry="10" fill="#F97316"/><ellipse cx="40" cy="40" rx="10" ry="18" fill="#FB923C" opacity="0.7"/><circle cx="40" cy="40" r="5" fill="white"/></svg>)
  },
  "Tim mạch": {
    bg: "#FFF1F2", accent: "#F43F5E", text: "#BE123C",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#FFE4E6"/><path d="M40 56 C40 56 22 45 22 33 C22 26 28 22 34 24 C37 25 40 28 40 28 C40 28 43 25 46 24 C52 22 58 26 58 33 C58 45 40 56 40 56Z" fill="#F43F5E"/><path d="M30 38 L36 38 L38 33 L41 44 L44 36 L46 38 L52 38" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>)
  },
  "Vitamin & Thực phẩm chức năng": {
    bg: "#F0FDF4", accent: "#22C55E", text: "#15803D",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#DCFCE7"/><polygon points="40,20 46,34 62,34 49,44 54,58 40,49 26,58 31,44 18,34 34,34" fill="#22C55E"/><circle cx="40" cy="40" r="8" fill="white" opacity="0.8"/></svg>)
  },
  "Tiêu hóa": {
    bg: "#FEFCE8", accent: "#EAB308", text: "#A16207",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#FEF9C3"/><path d="M28 30 Q40 20 52 30 Q60 38 52 48 Q44 58 40 54 Q36 58 28 48 Q20 38 28 30Z" fill="#EAB308"/><path d="M32 38 Q40 32 48 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="34" cy="42" r="2" fill="white"/><circle cx="46" cy="42" r="2" fill="white"/></svg>)
  },
  "Dị ứng - Hô hấp": {
    bg: "#F5F3FF", accent: "#8B5CF6", text: "#6D28D9",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#EDE9FE"/><path d="M28 50 Q40 20 52 50" stroke="#8B5CF6" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M34 44 Q40 28 46 44" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="40" cy="52" r="4" fill="#8B5CF6"/></svg>)
  },
  "Thần kinh - Tâm thần": {
    bg: "#FDF4FF", accent: "#D946EF", text: "#A21CAF",
    svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#FAE8FF"/><circle cx="40" cy="38" r="14" fill="#D946EF" opacity="0.8"/><circle cx="34" cy="34" r="3" fill="white"/><path d="M30 44 Q40 52 50 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>)
  },
};

const DEFAULT_THEME = { bg: "#F8FAFC", accent: "#64748B", text: "#475569",
  svg: (<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="30" fill="#F1F5F9"/><rect x="30" y="24" width="20" height="32" rx="4" fill="#94A3B8"/><rect x="24" y="30" width="32" height="20" rx="4" fill="#CBD5E1"/></svg>)
};

function MedicineAvatar({ medicine, size = "md" }) {
  const sizes = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20", xl: "w-28 h-28" };
  const theme = GROUP_THEMES[medicine.group] || DEFAULT_THEME;
  if (medicine.image) {
    return (<div className={`${sizes[size]} rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm`}><img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" /></div>);
  }
  return (
    <div className={`${sizes[size]} rounded-2xl flex items-center justify-center flex-shrink-0`} style={{ background: theme.bg }}>
      <div className={size === "sm" ? "w-7 h-7" : size === "md" ? "w-10 h-10" : size === "lg" ? "w-14 h-14" : "w-20 h-20"}>{theme.svg}</div>
    </div>
  );
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_MEDICINES = [
  { id: 1,  name: "Amoxicillin 500mg",    price: 8500,  unit: "viên", group: "Kháng sinh",                     stock: 240, supplier: "DHG Pharma",             importPrice: 6800,  image: null, components: "Amoxicillin trihydrate 574mg (tương đương Amoxicillin 500mg)", expiry: "2026-08-01" },
  { id: 2,  name: "Azithromycin 250mg",   price: 15000, unit: "viên", group: "Kháng sinh",                     stock: 80,  supplier: "Mega Lifesciences",       importPrice: 12000, image: null, components: "Azithromycin dihydrate 262mg (tương đương Azithromycin 250mg)", expiry: "2026-05-15" },
  { id: 3,  name: "Ciprofloxacin 500mg",  price: 12000, unit: "viên", group: "Kháng sinh",                     stock: 120, supplier: "Công ty Dược Trung ương", importPrice: 9500,  image: null, components: "Ciprofloxacin hydrochloride 582mg (tương đương Ciprofloxacin 500mg)", expiry: "2027-02-28" },
  { id: 4,  name: "Paracetamol 500mg",    price: 1200,  unit: "viên", group: "Giảm đau - Hạ sốt",              stock: 800, supplier: "Traphaco",                importPrice: 900,   image: null, components: "Paracetamol (Acetaminophen) 500mg", expiry: "2027-06-30" },
  { id: 5,  name: "Ibuprofen 400mg",      price: 3500,  unit: "viên", group: "Giảm đau - Hạ sốt",              stock: 350, supplier: "DHG Pharma",             importPrice: 2700,  image: null, components: "Ibuprofen 400mg, tá dược vừa đủ 1 viên", expiry: "2026-12-31" },
  { id: 6,  name: "Aspirin 81mg",         price: 800,   unit: "viên", group: "Giảm đau - Hạ sốt",              stock: 600, supplier: "Traphaco",                importPrice: 600,   image: null, components: "Acetylsalicylic acid 81mg", expiry: "2026-09-30" },
  { id: 7,  name: "Amlodipine 5mg",       price: 5500,  unit: "viên", group: "Tim mạch",                       stock: 200, supplier: "Mega Lifesciences",       importPrice: 4200,  image: null, components: "Amlodipine besylate 6.944mg (tương đương Amlodipine 5mg)", expiry: "2027-03-31" },
  { id: 8,  name: "Atorvastatin 20mg",    price: 18000, unit: "viên", group: "Tim mạch",                       stock: 90,  supplier: "Công ty Dược Trung ương", importPrice: 14000, image: null, components: "Atorvastatin calcium trihydrate 21.68mg (tương đương Atorvastatin 20mg)", expiry: "2026-11-30" },
  { id: 9,  name: "Metoprolol 50mg",      price: 9000,  unit: "viên", group: "Tim mạch",                       stock: 150, supplier: "DHG Pharma",             importPrice: 7200,  image: null, components: "Metoprolol tartrate 95.24mg (tương đương Metoprolol 50mg)", expiry: "2027-01-31" },
  { id: 10, name: "Vitamin C 1000mg",     price: 6000,  unit: "viên", group: "Vitamin & Thực phẩm chức năng", stock: 500, supplier: "Traphaco",                importPrice: 4500,  image: null, components: "Acid ascorbic (Vitamin C) 1000mg", expiry: "2026-07-31" },
  { id: 11, name: "Vitamin D3 2000IU",    price: 9500,  unit: "viên", group: "Vitamin & Thực phẩm chức năng", stock: 300, supplier: "Mega Lifesciences",       importPrice: 7500,  image: null, components: "Cholecalciferol (Vitamin D3) 50mcg (2000IU)", expiry: "2026-10-31" },
  { id: 12, name: "Canxi D3",             price: 7200,  unit: "viên", group: "Vitamin & Thực phẩm chức năng", stock: 260, supplier: "DHG Pharma",             importPrice: 5600,  image: null, components: "Canxi carbonat 1250mg (tương đương Ca2+ 500mg), Cholecalciferol 200IU", expiry: "2027-04-30" },
  { id: 13, name: "Omeprazole 20mg",      price: 4500,  unit: "viên", group: "Tiêu hóa",                       stock: 400, supplier: "Công ty Dược Trung ương", importPrice: 3400,  image: null, components: "Omeprazole 20mg (dạng vi cầu bao tan trong ruột)", expiry: "2026-08-31" },
  { id: 14, name: "Domperidone 10mg",     price: 3200,  unit: "viên", group: "Tiêu hóa",                       stock: 280, supplier: "Traphaco",                importPrice: 2400,  image: null, components: "Domperidone maleate 12.72mg (tương đương Domperidone 10mg)", expiry: "2027-05-31" },
  { id: 15, name: "Smecta 3g",            price: 8000,  unit: "gói",  group: "Tiêu hóa",                       stock: 180, supplier: "Mega Lifesciences",       importPrice: 6200,  image: null, components: "Diosmectite 3g, Glucose 0.749g, Saccharin natri 2.5mg, Hương vani tự nhiên", expiry: "2026-06-30" },
  { id: 16, name: "Cetirizine 10mg",      price: 4000,  unit: "viên", group: "Dị ứng - Hô hấp",               stock: 220, supplier: "DHG Pharma",             importPrice: 3100,  image: null, components: "Cetirizine dihydrochloride 10mg", expiry: "2027-02-28" },
  { id: 17, name: "Salbutamol 2mg",       price: 2500,  unit: "viên", group: "Dị ứng - Hô hấp",               stock: 160, supplier: "Traphaco",                importPrice: 1900,  image: null, components: "Salbutamol sulfate 2.4mg (tương đương Salbutamol 2mg)", expiry: "2026-09-30" },
];

const SEED_CUSTOMERS = [
  { id: 1, name: "Nguyễn Văn An",  phone: "0901234567", dob: "1975-04-12", address: "123 Lê Lợi, Q1, TP.HCM",
    allergies: "Penicillin, Aspirin", note: "Bệnh nhân tim mạch, huyết áp cao. Uống thuốc đều đặn.",
    history: [
      { date: "2025-01-15", type: "lẻ",    orderName: "Bán lẻ 15/01/2025", items: [{ name: "Paracetamol 500mg", qty: 10, price: 1200 }], total: 12000 },
      { date: "2025-02-20", type: "toa",   orderName: "Đơn tim mạch - tăng huyết áp", items: [{ name: "Amlodipine 5mg", qty: 30, price: 5500 }, { name: "Atorvastatin 20mg", qty: 30, price: 18000 }], total: 705000 },
    ]
  },
  { id: 2, name: "Trần Thị Bích",  phone: "0912345678", dob: "1990-08-22", address: "45 Nguyễn Huệ, Q1, TP.HCM",
    allergies: "", note: "Khách thân thiết, mua thuốc dạ dày định kỳ.",
    history: [
      { date: "2025-02-01", type: "toa",   orderName: "Đơn dạ dày cơ bản", items: [{ name: "Omeprazole 20mg", qty: 30, price: 4500 }, { name: "Domperidone 10mg", qty: 30, price: 3200 }], total: 231000 },
    ]
  },
  { id: 3, name: "Lê Hoàng Minh",  phone: "0923456789", dob: "1965-03-18", address: "78 Điện Biên Phủ, Q3, TP.HCM",
    allergies: "Sulfonamide", note: "Tiểu đường type 2. Cần tư vấn kỹ trước khi bán kháng sinh.",
    history: []
  },
  { id: 4, name: "Phạm Thị Lan",   phone: "0934567890", dob: "1988-11-05", address: "12 Pasteur, Q3, TP.HCM",
    allergies: "", note: "",
    history: [
      { date: "2025-02-10", type: "lẻ", orderName: "Vitamin tổng hợp 02/2025", items: [{ name: "Vitamin C 1000mg", qty: 30, price: 6000 }, { name: "Vitamin D3 2000IU", qty: 30, price: 9500 }], total: 465000 },
    ]
  },
];

const DEFAULT_PRESCRIPTIONS = [
  { id: 1, name: "Đơn cảm cúm người lớn", description: "Điều trị triệu chứng cảm cúm thông thường",
    items: [{ medId: 4, qty: 15, price: null, note: "3 lần/ngày" }, { medId: 16, qty: 7, price: null, note: "1 lần/ngày tối" }]
  },
  { id: 2, name: "Đơn viêm họng - kháng sinh 7 ngày", description: "Điều trị viêm họng do vi khuẩn",
    items: [{ medId: 1, qty: 14, price: null, note: "2 lần/ngày" }, { medId: 4, qty: 21, price: null, note: "3 lần/ngày khi đau" }]
  },
  { id: 3, name: "Đơn dạ dày cơ bản", description: "Viêm loét dạ dày nhẹ",
    items: [{ medId: 13, qty: 30, price: null, note: "Uống trước ăn 30 phút" }, { medId: 14, qty: 30, price: null, note: "Uống trước ăn 15 phút" }]
  },
  { id: 4, name: "Đơn tim mạch - tăng huyết áp", description: "Huyết áp cao kết hợp rối loạn mỡ máu",
    items: [{ medId: 7, qty: 30, price: null, note: "1 lần/ngày buổi sáng" }, { medId: 8, qty: 30, price: null, note: "1 lần/ngày buổi tối" }]
  },
  { id: 5, name: "Đơn vitamin tổng hợp", description: "Bổ sung vitamin và khoáng chất",
    items: [{ medId: 10, qty: 30, price: null, note: "1 lần/ngày sau ăn" }, { medId: 11, qty: 30, price: null, note: "1 lần/ngày sau ăn" }, { medId: 12, qty: 30, price: null, note: "1 lần/ngày trước khi ngủ" }]
  },
];

const ALL_GROUPS    = ["Kháng sinh", "Giảm đau - Hạ sốt", "Tim mạch", "Vitamin & Thực phẩm chức năng", "Tiêu hóa", "Dị ứng - Hô hấp", "Thần kinh - Tâm thần"];
const ALL_SUPPLIERS = ["Công ty Dược Trung ương", "Mega Lifesciences", "DHG Pharma", "Traphaco"];
const ALL_UNITS     = ["viên", "gói", "lọ", "ống", "tuýp", "hộp", "vỉ", "chai"];
let _savedUnits = [...ALL_UNITS];

const SEED_SUPPLIERS_DATA = [
  { id: 1, name: "Công ty Dược Trung ương", code: "DTWU", phone: "024 3825 6789", email: "info@duoctrunguong.vn", address: "48 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",      contact: "Nguyễn Thị Hoa",  taxCode: "0100100985", note: "Nhà phân phối thuốc nhà nước uy tín" },
  { id: 2, name: "Mega Lifesciences",        code: "MEGA", phone: "028 3812 5678", email: "vn@megalife.com.th",   address: "Lim Tower, 9-11 Tôn Đức Thắng, Q1, TP.HCM", contact: "Trần Văn Nam",    taxCode: "0312345678", note: "Tập đoàn dược Thái Lan, vitamin & TPCN" },
  { id: 3, name: "DHG Pharma",               code: "DHG",  phone: "0292 3891 433", email: "dhg@dhgpharma.com.vn",address: "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",  contact: "Lê Thị Bích",    taxCode: "1800156801", note: "Công ty CP Dược Hậu Giang" },
  { id: 4, name: "Traphaco",                 code: "TPC",  phone: "024 3827 5959", email: "traphaco@traphaco.vn", address: "75 Yên Ninh, Ba Đình, Hà Nội",               contact: "Phạm Quốc Bình", taxCode: "0100107740", note: "Chuyên đông dược và vitamin" },
];

const fmt   = (n) => (n || 0).toLocaleString("vi-VN") + "đ";
const genId = () => Date.now() + Math.random();
const EMPTY_FORM = { name: "", group: ALL_GROUPS[0], price: "", importPrice: "", stock: "", unit: "viên", supplier: ALL_SUPPLIERS[0], image: null, components: "", expiry: "", packaging: "" };

function parsePackaging(str) {
  if (!str || !str.trim()) return {};
  const pairs = {};
  for (const p of str.split(",").map(s => s.trim()).filter(Boolean)) {
    const m = p.match(/^([^\s=]+)\s*=\s*(\d+)\s*([^\s]+)$/);
    if (m) pairs[m[1]] = { qty: Number(m[2]), sub: m[3] };
  }
  const getMulti = (unit, visited = new Set()) => {
    if (visited.has(unit)) return 1;
    visited.add(unit);
    if (!pairs[unit]) return 1;
    return pairs[unit].qty * getMulti(pairs[unit].sub, new Set(visited));
  };
  const result = {};
  for (const u of Object.keys(pairs)) result[u] = getMulti(u);
  for (const p of Object.values(pairs)) if (!result[p.sub]) result[p.sub] = 1;
  return result;
}

function getPriceForUnit(basePrice, baseUnit, targetUnit, packagingStr) {
  if (targetUnit === baseUnit) return basePrice;
  if (!packagingStr) return basePrice;
  // Build ordered chain from packaging string e.g. "viên=10vỉ,vỉ=2hộp"
  // Result: [{unit, qty, sub}] chain
  const pairs = {};
  for (const p of packagingStr.split(",").map(s => s.trim()).filter(Boolean)) {
    const m = p.match(/^([^\s=]+)\s*=\s*(\d+)\s*([^\s]+)$/);
    if (m) pairs[m[1]] = { qty: Number(m[2]), sub: m[3] };
  }
  // Build ordered units list (smallest first)
  const getAbsMulti = (u, visited = new Set()) => {
    if (visited.has(u)) return 1;
    visited.add(u);
    if (!pairs[u]) return 1;
    return pairs[u].qty * getAbsMulti(pairs[u].sub, new Set(visited));
  };
  // Get multiplier relative to baseUnit
  const allUnits = new Set([...Object.keys(pairs), ...Object.values(pairs).map(p => p.sub)]);
  const absMultis = {};
  for (const u of allUnits) absMultis[u] = getAbsMulti(u);
  const baseAbs  = absMultis[baseUnit]   ?? 1;
  const targetAbs = absMultis[targetUnit] ?? 1;
  return Math.round(basePrice * targetAbs / baseAbs);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const icons = {
  pos:       "M3 3h18v4H3zM3 10h18v11H3zM8 14h8M8 17h5",
  group:     "M4 6h16M4 10h16M4 14h10M4 18h6",
  customer:  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  price:     "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  inventory: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  cart:      "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  trash:     "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2",
  plus:      "M12 5v14M5 12h14",
  minus:     "M5 12h14",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0",
  check:     "M20 6L9 17l-5-5",
  close:     "M18 6L6 18M6 6l12 12",
  edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  history:   "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 3",
  warning:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  box:       "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  image:     "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5zM6.5 8a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  receipt:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  allergy:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  pill:      "M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7.5M8 12h8M12 8v8M16 19h6M19 16v6",
  note:      "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  phone:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  calendar:  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  stats:     "M18 20V10M12 20V4M6 20v-6",
  location:  "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  save:      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  copy:      "M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2",
  print:     "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z",
  supplier:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  procure:   "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12v4M10 14h4",
  back:      "M19 12H5M12 5l-7 7 7 7",
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ color, children }) => {
  const colors = { green: "bg-emerald-100 text-emerald-700", blue: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700", purple: "bg-violet-100 text-violet-700", rose: "bg-rose-100 text-rose-700", slate: "bg-slate-100 text-slate-600", teal: "bg-teal-100 text-teal-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>{children}</span>;
};

const inp = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl z-[100] flex items-center gap-2 transition-all ${toast.color === "rose" ? "bg-rose-500" : toast.color === "amber" ? "bg-amber-500" : "bg-teal-500"}`}>
      {toast.color === "rose" ? <Icon path={icons.trash} size={16}/> : <Icon path={icons.check} size={16}/>}
      {toast.msg}
    </div>
  );
}

// ── Image Upload Widget ───────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };
  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
      className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-teal-400 transition-colors group"
      style={{ height: 120 }} onClick={() => fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      {value ? (
        <div className="relative w-full h-full">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold flex items-center gap-1"><Icon path={icons.upload} size={14} /> Đổi ảnh</span>
          </div>
          <button className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-10"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}>
            <Icon path={icons.close} size={10} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
          <Icon path={icons.upload} size={24} />
          <span className="text-xs text-center px-4">Kéo thả hoặc nhấn để tải ảnh lên<br/><span className="text-slate-300">PNG, JPG, WEBP</span></span>
        </div>
      )}
    </div>
  );
}

// ── Unit Dropdown (for packaging rows) ───────────────────────────────────────
function UnitDropdown({ value, onChange, units, onAddUnit, placeholder }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const select = (u) => { onChange(u); setOpen(false); setCustom(""); };
  const addNew = () => {
    const t = custom.trim();
    if (!t) return;
    onAddUnit(t);
    select(t);
  };
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={()=>setOpen(o=>!o)}
        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-slate-700 font-semibold text-left bg-white flex items-center justify-between gap-1 hover:border-teal-300">
        <span className={value ? "text-slate-700" : "text-slate-300"}>{value || placeholder || "Chọn..."}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden" style={{minWidth:110}}>
          <div className="max-h-36 overflow-y-auto">
            {units.map(u=>(
              <button key={u} type="button" onClick={()=>select(u)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 transition-colors ${value===u ? "bg-teal-50 text-teal-600 font-bold" : "text-slate-600"}`}>
                {u}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-1.5 flex gap-1">
            <input value={custom} onChange={e=>setCustom(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addNew()}
              placeholder="Tự nhập..."
              className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
            {custom.trim() && (
              <button type="button" onClick={addNew} className="px-2 py-1 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600">✓</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Medicine Modal ─────────────────────────────────────────────────────────────
function MedicineModal({ initial, onSave, onClose }) {

  const initLevels = (pkgStr) => {
    if (!pkgStr) return [];
    const pairs = {};
    for (const p of pkgStr.split(",").map(s=>s.trim()).filter(Boolean)) {
      const m = p.match(/^([^\s=]+)\s*=\s*(\d+)\s*([^\s]+)$/);
      if (m) pairs[m[1]] = { qty: Number(m[2]), sub: m[3] };
    }
    const subValues = new Set(Object.values(pairs).map(v=>v.sub));
    const tops = Object.keys(pairs).filter(u => !subValues.has(u));
    const result = []; let cur = tops[0];
    while (cur && pairs[cur]) { result.push({ unit: cur, qty: pairs[cur].qty, sub: pairs[cur].sub }); cur = pairs[cur].sub; }
    return result;
  };

  const initPackState = (ini) => {
    if (!ini?.packaging) { const b = ini?.unit || "viên"; return { units: [b], qtys: [], baseIdx: 0 }; }
    const levels = initLevels(ini.packaging);
    if (!levels.length) { const b = ini?.unit || "viên"; return { units: [b], qtys: [], baseIdx: 0 }; }
    const units = levels.map(l=>l.unit);
    const lastSub = levels[levels.length-1].sub;
    if (!units.includes(lastSub)) units.push(lastSub);
    const qtys = levels.map(l=>l.qty);
    // First unit is always base unit
    return { units, qtys, baseIdx: 0 };
  };

  const { units: initUnits, qtys: initQtys, baseIdx: initBaseIdx } = initPackState(initial);

  const [form, setForm]             = useState(initial ? { ...initial, price: String(initial.price), importPrice: String(initial.importPrice||""), stock: String(initial.stock) } : { ...EMPTY_FORM });
  const [packUnits, setPackUnits]   = useState(initUnits);
  const [packQtys, setPackQtys]     = useState(initQtys);
  const [baseUnitIdx, setBaseUnitIdx] = useState(initBaseIdx);

  const [lastEditedSell, setLastEditedSell]     = useState(null);
  const [lastEditedImport, setLastEditedImport] = useState(null);
  const [lastEditedStock, setLastEditedStock]   = useState(null);
  const [sellInputs, setSellInputs]             = useState({});
  const [importInputs, setImportInputs]         = useState({});
  const [stockInputs, setStockInputs]           = useState({});

  const [savedUnits, setSavedUnits]     = useState(() => { try { return [..._savedUnits]; } catch { return [...ALL_UNITS]; } });
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [newUnitInput, setNewUnitInput] = useState("");
  const unitPickerRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const bu = packUnits[baseUnitIdx] || packUnits[0] || "viên";
    set("unit", bu);
    if (packUnits.length <= 1) { set("packaging", ""); return; }
    set("packaging", packUnits.slice(0,-1).map((u,i) => `${u}=${packQtys[i]||1}${packUnits[i+1]}`).join(","));
  }, [packUnits, packQtys, baseUnitIdx]);

  const baseUnit = packUnits[baseUnitIdx] || packUnits[0] || "";

  // Tính hệ số nhân của mỗi đơn vị so với packUnits[0] (nhỏ nhất)
  const getAbsoluteMulti = (unitIdx) => {
    if (unitIdx <= 0) return 1;
    let m = 1;
    for (let i = 0; i < unitIdx; i++) m *= (packQtys[i] || 1);
    return m;
  };

  // Hệ số nhân của srcUnit so với baseUnit
  const getMulti = (srcUnit) => {
    if (srcUnit === baseUnit) return 1;
    const srcIdx = packUnits.indexOf(srcUnit);
    if (srcIdx < 0) return 1;
    return getAbsoluteMulti(srcIdx) / getAbsoluteMulti(baseUnitIdx);
  };

  const packMap  = parsePackaging(form.packaging);

  useEffect(() => {
    if (!lastEditedSell) return;
    const raw = sellInputs[lastEditedSell] || "";
    const val = Number(raw);
    if (!raw || val === 0) { set("price", ""); return; }
    set("price", String(Math.round(val / getMulti(lastEditedSell))));
  }, [sellInputs, lastEditedSell, packUnits, packQtys, baseUnitIdx]);

  useEffect(() => {
    if (!lastEditedImport) return;
    const raw = importInputs[lastEditedImport] || "";
    const val = Number(raw);
    if (!raw || val === 0) { set("importPrice", ""); return; }
    set("importPrice", String(Math.round(val / getMulti(lastEditedImport))));
  }, [importInputs, lastEditedImport, packUnits, packQtys, baseUnitIdx]);

  useEffect(() => {
    if (!lastEditedStock) return;
    const raw = stockInputs[lastEditedStock] || "";
    const val = Number(raw);
    if (!raw || val === 0) { set("stock", ""); return; }
    set("stock", String(Math.round(val / getMulti(lastEditedStock))));
  }, [stockInputs, lastEditedStock, packUnits, packQtys, baseUnitIdx]);

  useEffect(() => {
    const h = (e) => { if (unitPickerRef.current && !unitPickerRef.current.contains(e.target)) setShowUnitPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const valid = form.name.trim() && Number(form.price) > 0 && Number(form.stock) >= 0;

  const addUnit = (unitName) => {
    const t = unitName.trim();
    if (!t || packUnits.includes(t)) return;
    const newUnits = [...packUnits, t];
    const newQtys  = [...packQtys, 1];
    setPackUnits(newUnits);
    setPackQtys(newQtys);
    // First unit is always base unit (index 0)
    if (!savedUnits.includes(t)) { const nx = [...savedUnits, t]; setSavedUnits(nx); try { _savedUnits = nx; } catch {} }
    setNewUnitInput(""); setShowUnitPicker(false);
  };

  const removeUnit = (idx) => {
    if (packUnits.length <= 1) return;
    const newUnits = packUnits.filter((_,i) => i !== idx);
    const oldQtys = packUnits.slice(0,-1).map((_,i) => packQtys[i]||1);
    let rebuiltQtys = [];
    for (let i = 0; i < oldQtys.length; i++) {
      if (i === idx - 1 && idx < packUnits.length - 1) {
        rebuiltQtys.push((oldQtys[i]||1) * (oldQtys[idx]||1));
        i++;
      } else if (i === idx) {
        // skip
      } else {
        rebuiltQtys.push(oldQtys[i]);
      }
    }
    while (rebuiltQtys.length < newUnits.length - 1) rebuiltQtys.push(1);
    setPackUnits(newUnits); setPackQtys(rebuiltQtys); setBaseUnitIdx(0);
  };

  const updateQty = (i, val) => { const q = [...packQtys]; q[i] = Number(val)||1; setPackQtys(q); };

  const basePrice  = Number(form.price)       || 0;
  const baseImport = Number(form.importPrice) || 0;

  const displaySell   = (u) => basePrice  > 0 ? Math.round(basePrice  * getMulti(u)) : 0;
  const displayImport = (u) => baseImport > 0 ? Math.round(baseImport * getMulti(u)) : 0;

  const getSellDisplay   = (u) => lastEditedSell   === u ? (sellInputs[u]   ?? "") : (displaySell(u)   > 0 ? String(displaySell(u))   : "");
  const getImportDisplay = (u) => lastEditedImport === u ? (importInputs[u] ?? "") : (displayImport(u) > 0 ? String(displayImport(u)) : "");

  const displayStock   = (u) => { const s = Number(form.stock) || 0; if (!s) return 0; return Math.round(s * getMulti(u)); };
  const getStockDisplay = (u) => lastEditedStock === u ? (stockInputs[u] ?? "") : (displayStock(u) > 0 ? String(displayStock(u)) : "");

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col" style={{maxHeight:"calc(100vh - 24px)"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 rounded-t-3xl">
          <div className="font-bold text-slate-800 text-lg">{initial ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Row 1: Ảnh + tên + nhóm + nhà phân phối */}
          <div className="flex gap-4 items-start">
            <div style={{width:100,flexShrink:0}}>
              <div className="text-xs font-medium text-slate-500 mb-1.5">Ảnh</div>
              <ImageUploader value={form.image} onChange={(v) => set("image", v)} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Tên thuốc *</label>
                <input className={inp} placeholder="VD: Paracetamol 500mg" value={form.name} onChange={e=>set("name",e.target.value)}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nhóm thuốc *</label>
                  <select className={inp+" cursor-pointer"} value={form.group} onChange={e=>set("group",e.target.value)}>
                    {ALL_GROUPS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nhà phân phối</label>
                  <select className={inp+" cursor-pointer"} value={form.supplier} onChange={e=>set("supplier",e.target.value)}>
                    {ALL_SUPPLIERS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Hạn sử dụng */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hạn sử dụng</label>
            <input className={inp} type="date" value={form.expiry||""} onChange={e=>set("expiry",e.target.value)}/>
          </div>

          {/* Row 3: Bảng quy cách — ĐÃ ĐỔI SANG MÀU XANH TEAL */}
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Quy cách đóng gói & Giá</div>
            <div className="overflow-x-auto rounded-2xl border border-teal-200 bg-white">
              <table className="w-full border-collapse" style={{minWidth: 320}}>
                <thead>
                  {/* ✅ ĐÃ ĐỔI: bg-slate-700 → bg-teal-600 */}
                  <tr className="bg-teal-600 text-white">
                    {/* Label col */}
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold whitespace-nowrap w-24 rounded-tl-2xl">Thông số</th>

                    {/* One col per unit */}
                    {packUnits.map((u, idx) => {
                      const isBase = idx === 0;
                      return (
                        <th key={idx} className={`px-2 py-2 text-center`}>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[12px] font-bold text-white">{u}</span>
                              {/* Remove unit — cannot remove first (base) unit if it's the only one */}
                              {packUnits.length > 1 && idx > 0 && (
                                <button type="button" onClick={()=>removeUnit(idx)}
                                  className="text-teal-200 hover:text-rose-300 transition-colors ml-0.5">
                                  <Icon path={icons.close} size={10}/>
                                </button>
                              )}
                            </div>
                            {idx === baseUnitIdx ? (
                              <span
                                className="text-[9px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none border border-teal-300 cursor-default"
                                title="Đang là đơn vị cơ bản">cơ bản</span>
                            ) : (
                              <button type="button" onClick={() => setBaseUnitIdx(idx)}
                                className="text-[9px] bg-white/20 hover:bg-white/40 text-teal-100 hover:text-white px-1.5 py-0.5 rounded-full font-semibold leading-none border border-teal-400/40 transition-colors"
                                title="Đặt làm đơn vị cơ bản">đặt cơ bản</button>
                            )}
                          </div>
                        </th>
                      );
                    })}

                    {/* Add unit col */}
                    <th className="px-2 py-2 rounded-tr-2xl w-10" ref={unitPickerRef}>
                      <div className="relative flex justify-center">
                        <button type="button" onClick={()=>setShowUnitPicker(o=>!o)}
                          className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title="Thêm đơn vị">
                          <Icon path={icons.plus} size={14}/>
                        </button>
                        {showUnitPicker && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 p-2 text-slate-700" style={{minWidth:190}}>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase px-2 mb-1">Thêm đơn vị mới</div>
                            <div className="max-h-32 overflow-y-auto mb-1.5">
                              {savedUnits.filter(u=>!packUnits.includes(u)).map(u=>(
                                <button key={u} type="button" onClick={()=>addUnit(u)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 rounded-lg text-slate-600 hover:text-teal-700 font-medium">
                                  {u}
                                </button>
                              ))}
                              {savedUnits.filter(u=>!packUnits.includes(u)).length===0 && <div className="text-xs text-slate-300 px-3 py-1">Không còn</div>}
                            </div>
                            <div className="border-t border-slate-100 pt-1.5 flex gap-1">
                              <input value={newUnitInput} onChange={e=>setNewUnitInput(e.target.value)}
                                onKeyDown={e=>e.key==="Enter"&&newUnitInput.trim()&&addUnit(newUnitInput)}
                                placeholder="Nhập đơn vị mới..."
                                className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                              {newUnitInput.trim()&&<button type="button" onClick={()=>addUnit(newUnitInput)} className="px-2 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold">✓</button>}
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Row: Số lượng */}
                  <tr className="border-t border-teal-100 bg-teal-50/40">
                    <td className="px-3 py-2.5 text-[11px] font-bold text-teal-700 whitespace-nowrap">Số lượng</td>
                    {packUnits.map((u, idx) => {
                      const isBase = idx === 0;
                      const baseUnitName = packUnits[0];
                      // Cumulative qty in terms of base unit (first/smallest unit)
                      // packQtys[i] = how many units[i] are in units[i+1]
                      const cumulativeQty = isBase ? 1 : Array.from({length: idx}, (_, i) => packQtys[i]||1).reduce((a, b) => a * b, 1);
                      return (
                        <td key={idx} className="px-2 py-2 text-center">
                          {isBase ? (
                            <span className="text-xs font-bold text-teal-600">1</span>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number" min="1"
                                  value={packQtys[idx-1]||1}
                                  onChange={e=>updateQty(idx-1, e.target.value)}
                                  className="w-14 px-1.5 py-1 text-xs border border-teal-200 bg-teal-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-teal-700 font-bold text-center"
                                />
                                <span className="text-[10px] text-slate-400">{packUnits[idx-1]}</span>
                              </div>
                              {packUnits.length > 2 && (
                                <span className="text-[10px] text-teal-500 font-semibold">
                                  = {cumulativeQty} {baseUnitName}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td/>
                  </tr>

                  {/* Row: Tồn kho */}
                  <tr className="border-t border-teal-100 bg-amber-50/30">
                    <td className="px-3 py-2.5 text-[11px] font-bold text-amber-700 whitespace-nowrap">Tồn kho *</td>
                    {packUnits.map((u, idx) => (
                      <td key={idx} className="px-2 py-1.5">
                        <input
                          type="number" min="0"
                          placeholder="0"
                          value={getStockDisplay(u)}
                          onFocus={() => {
                            setLastEditedStock(u);
                            setStockInputs(p => ({ ...p, [u]: getStockDisplay(u) }));
                          }}
                          onChange={e => {
                            setLastEditedStock(u);
                            setStockInputs(p => ({ ...p, [u]: e.target.value }));
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-amber-200 bg-amber-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 text-amber-700 font-bold text-center min-w-0"
                          style={{minWidth:70}}
                        />
                      </td>
                    ))}
                    <td/>
                  </tr>

                  {/* Row: Giá mua */}
                  <tr className="border-t border-teal-100">
                    <td className="px-3 py-2.5 text-[11px] font-bold text-teal-700 whitespace-nowrap">Giá mua</td>
                    {packUnits.map((u, idx) => (
                      <td key={idx} className="px-2 py-1.5">
                        <input
                          type="number" min="0"
                          placeholder={lastEditedImport && lastEditedImport !== u && displayImport(u) > 0 ? String(displayImport(u)) : "0"}
                          value={getImportDisplay(u)}
                          onFocus={() => {
                            setLastEditedImport(u);
                            setImportInputs(p => ({ ...p, [u]: getImportDisplay(u) }));
                          }}
                          onChange={e => {
                            setLastEditedImport(u);
                            setImportInputs(p => ({ ...p, [u]: e.target.value }));
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-violet-200 bg-violet-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 text-violet-700 font-bold text-center min-w-0"
                          style={{minWidth:70}}
                        />
                      </td>
                    ))}
                    <td/>
                  </tr>

                  {/* Row: Giá bán */}
                  <tr className="border-t border-teal-100">
                    <td className="px-3 py-2.5 text-[11px] font-bold text-teal-700 whitespace-nowrap rounded-bl-2xl">Giá bán *</td>
                    {packUnits.map((u, idx) => (
                      <td key={idx} className="px-2 py-1.5" style={idx===packUnits.length-1?{borderRadius:"0 0 1rem 0"}:{}}>
                        <input
                          type="number" min="0"
                          placeholder={lastEditedSell && lastEditedSell !== u && displaySell(u) > 0 ? String(displaySell(u)) : "0"}
                          value={getSellDisplay(u)}
                          onFocus={() => {
                            setLastEditedSell(u);
                            setSellInputs(p => ({ ...p, [u]: getSellDisplay(u) }));
                          }}
                          onChange={e => {
                            setLastEditedSell(u);
                            setSellInputs(p => ({ ...p, [u]: e.target.value }));
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-teal-200 bg-teal-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 text-teal-700 font-bold text-center min-w-0"
                          style={{minWidth:70}}
                        />
                      </td>
                    ))}
                    <td/>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              Nhập giá hoặc tồn kho ở bất kỳ cột nào — tự động quy đổi · Nhấn "đặt cơ bản" để thay đổi đơn vị cơ bản
            </p>
          </div>

          {/* Row 4: Thành phần */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Thành phần hoạt chất</label>
            <textarea className={inp+" resize-none"} rows={2} placeholder="VD: Paracetamol 500mg, tá dược vừa đủ 1 viên..." value={form.components||""} onChange={e=>set("components",e.target.value)}/>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-slate-100 flex-shrink-0 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
          <button disabled={!valid}
            onClick={()=>valid && onSave({...form, price:Number(form.price), importPrice:Number(form.importPrice)||0, stock:Number(form.stock)})}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${valid?"bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            {initial?"Lưu thay đổi":"Thêm thuốc"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PRESCRIPTION EDIT MODAL ──────────────────────────────────────────────────
function PrescriptionEditModal({ pres, medicines, onSave, onCancel }) {
  const [form, setForm] = useState({ ...pres, items: pres.items.map(i => ({ ...i })) });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateItem = (idx, k, v) => setForm(f => ({
    ...f, items: f.items.map((it, i) => i === idx ? { ...it, [k]: v } : it)
  }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { medId: medicines[0]?.id || 0, qty: 1, price: null, note: "" }] }));

  const presTotal = form.items.reduce((s, pi) => {
    const med = medicines.find(m => m.id === Number(pi.medId));
    const p = pi.price != null ? pi.price : (med?.price || 0);
    return s + p * pi.qty;
  }, 0);

  const valid = form.name.trim() && form.items.length > 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl flex-shrink-0">
          <div className="font-bold text-slate-800 text-lg">{pres.id && pres.name ? "Sửa đơn mẫu" : "Tạo đơn mẫu mới"}</div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tên đơn mẫu *</label>
              <input className={inp} placeholder="VD: Đơn cảm cúm người lớn" value={form.name} onChange={e => setField("name", e.target.value)}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mô tả</label>
              <input className={inp} placeholder="Chỉ định, mô tả ngắn..." value={form.description || ""} onChange={e => setField("description", e.target.value)}/>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Danh sách thuốc</label>
              <button onClick={addItem} className="flex items-center gap-1 px-2.5 py-1 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600">
                <Icon path={icons.plus} size={11}/> Thêm thuốc
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((pi, idx) => {
                const med = medicines.find(m => m.id === Number(pi.medId));
                const defaultPrice = med?.price || 0;
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select value={pi.medId} onChange={e => updateItem(idx, "medId", Number(e.target.value))}
                        className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white text-slate-700">
                        {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-400 flex-shrink-0">
                        <Icon path={icons.trash} size={14}/>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 mb-0.5">Số lượng</div>
                        <input type="number" min={1} value={pi.qty} onChange={e => updateItem(idx, "qty", Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 mb-0.5">Giá (đ) — để trống = giá gốc</div>
                        <input type="number" min={0} placeholder={String(defaultPrice)}
                          value={pi.price != null ? pi.price : ""}
                          onChange={e => updateItem(idx, "price", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-teal-200 bg-teal-50 rounded-lg text-teal-700 font-bold focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 mb-0.5">Ghi chú cách dùng</div>
                        <input placeholder="VD: 3 lần/ngày" value={pi.note || ""} onChange={e => updateItem(idx, "note", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      Thành tiền: <span className="font-bold text-teal-600">{((pi.price != null ? pi.price : defaultPrice) * pi.qty).toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                );
              })}
              {form.items.length === 0 && (
                <div className="text-center text-slate-300 py-6 text-sm border-2 border-dashed border-slate-100 rounded-2xl">Chưa có thuốc nào — nhấn "Thêm thuốc"</div>
              )}
            </div>
          </div>
          {form.items.length > 0 && (
            <div className="flex justify-between items-center bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2.5">
              <span className="text-sm font-bold text-slate-700">Tổng đơn mẫu</span>
              <span className="text-lg font-extrabold text-teal-600">{presTotal.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3 border-t border-slate-50 pt-4 flex-shrink-0">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
          <button disabled={!valid} onClick={() => valid && onSave(form)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${valid ? "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            Lưu đơn mẫu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UNIT PICKER ───────────────────────────────────────────────────────────────
const UNIT_OPTIONS = ["viên", "vỉ", "hộp", "chai", "gói", "ống", "lọ"];
function UnitPicker({ value, onChange, extra = [], onAdd }) {
  const [custom, setCustom] = useState("");
  const all = [...new Set([...UNIT_OPTIONS, ...extra])];
  return (
    <div className="flex flex-wrap gap-1 items-center mt-1.5">
      {all.map(u => (
        <button key={u} type="button" onClick={() => onChange(u)}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${value === u ? "bg-teal-500 border-teal-500 text-white" : "border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 bg-white"}`}>
          {u}
        </button>
      ))}
      <div className="flex gap-1 items-center">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          className="w-16 px-1.5 py-0.5 text-[10px] border border-dashed border-slate-300 rounded-lg focus:outline-none focus:border-teal-400 placeholder-slate-300"
          placeholder="+ đơn vị"/>
        {custom.trim() && (
          <button type="button" onClick={() => { onChange(custom); onAdd && onAdd(custom); setCustom(""); }}
            className="px-1.5 py-0.5 bg-teal-500 text-white rounded-lg text-[10px] font-bold">✓</button>
        )}
      </div>
    </div>
  );
}

// ── POS TAB ───────────────────────────────────────────────────────────────────
function PosTab() {
  const { medicines, customers, addSaleToCustomer, prescriptions, savePrescription, deletePrescription, copyPrescription } = useApp();
  const [search, setSearch]                         = useState("");
  const [cart, setCart]                             = useState([]);
  const [paid, setPaid]                             = useState(false);
  const [selectedGroup, setSelectedGroup]           = useState("Tất cả");
  const [customerMode, setCustomerMode]             = useState("retail");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showPrescriptions, setShowPrescriptions]   = useState(false);
  const [prescEdit, setPrescEdit]                   = useState(null);
  const [showCheckout, setShowCheckout]             = useState(false);
  const [discountPct, setDiscountPct]               = useState(0);
  const [showMedDetail, setShowMedDetail]           = useState(null);
  const [orderName, setOrderName]                   = useState("");
  const [orderType, setOrderType]                   = useState("lẻ");
  const [xtraUnits, setXtraUnits]                   = useState([]);
  const [totalOverride, setTotalOverride]           = useState("");
  const [markupPct, setMarkupPct]                   = useState("");

  const groups   = ["Tất cả", ...ALL_GROUPS];
  const filtered = medicines.filter((m) =>
    (selectedGroup === "Tất cả" || m.group === selectedGroup) &&
    m.name.toLowerCase().includes(search.toLowerCase()) && m.stock > 0
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;
  const allergyWarnings  = selectedCustomer?.allergies
    ? cart.filter((item) => {
        const a = selectedCustomer.allergies.toLowerCase();
        const n = item.name.toLowerCase();
        const c = (item.components || "").toLowerCase();
        return a.split(",").some((al) => al.trim() && (n.includes(al.trim()) || c.includes(al.trim())));
      })
    : [];

  const addToCart = (med) => setCart((prev) => {
    const ex = prev.find((i) => i.id === med.id);
    if (ex) return prev.map((i) => i.id === med.id ? { ...i, qty: i.qty + 1 } : i);
    return [...prev, { ...med, cartPrice: med.price, qty: 1 }];
  });
  const updateQty   = (id, delta) => setCart((prev) =>
    prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );
  const removeItem  = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const upPrice     = (id, v) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, cartPrice: Number(v) || 0 } : i));
  const upUnit      = (id, u) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, unit: u } : i));
  const subtotal    = cart.reduce((s, i) => s + (i.cartPrice || 0) * i.qty, 0);
  const discount    = Math.round(subtotal * discountPct / 100);
  const baseTotal   = subtotal - discount;
  const markupAmt   = markupPct !== "" ? Math.round(baseTotal * Number(markupPct) / 100) : 0;
  const total       = totalOverride !== "" ? Number(totalOverride) : baseTotal + markupAmt;

  const loadPrescription = (pres) => {
    const items = pres.items.flatMap((pi) => {
      const med = medicines.find((m) => m.id === pi.medId);
      if (!med) return [];
      return [{ ...med, cartPrice: pi.price != null ? pi.price : med.price, qty: pi.qty }];
    });
    setCart(items);
    setOrderName(pres.name);
    setOrderType("toa");
    setShowPrescriptions(false);
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    if (selectedCustomer) {
      addSaleToCustomer(selectedCustomer.id, {
        date: new Date().toISOString().split("T")[0],
        type: orderType,
        orderName: orderName.trim() || `Đơn ${new Date().toLocaleDateString("vi-VN")}`,
        items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.cartPrice || i.price })),
        total
      });
    }
    setPaid(true);
    setShowCheckout(false);
    setTimeout(() => { setCart([]); setPaid(false); setDiscountPct(0); setSelectedCustomerId(null); setOrderName(""); setOrderType("lẻ"); setTotalOverride(""); setMarkupPct(""); }, 2200);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16} /></span>
            <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm thuốc…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowPrescriptions(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-all shadow-md shadow-violet-200">
            <Icon path={icons.receipt} size={15} /> Đơn mẫu
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {groups.map((g) => (
            <button key={g} onClick={() => setSelectedGroup(g)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${selectedGroup === g ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"}`}>{g}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto grid gap-2 pr-1 items-start content-start" style={{gridTemplateColumns:"repeat(3, minmax(0, 1fr))"}}>
          {filtered.map((m) => {
            const theme = GROUP_THEMES[m.group] || DEFAULT_THEME;
            const inCart = cart.find((i) => i.id === m.id);
            return (
              <div key={m.id} style={{aspectRatio:"1/1"}} className={`bg-white border-2 rounded-2xl overflow-hidden transition-all group relative flex flex-col ${inCart ? "border-teal-400 shadow-lg shadow-teal-50" : "border-transparent hover:border-teal-200 hover:shadow-md"}`}>
                <button onClick={() => addToCart(m)} className="w-full flex-1 flex flex-col text-left overflow-hidden">
                  <div className="flex-1 flex items-center justify-center relative min-h-0" style={{ background: theme.bg }}>
                    {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover absolute inset-0" /> : <div className="w-10 h-10 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">{theme.svg}</div>}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded-full bg-white/80" style={{ color: theme.accent }}>còn {m.stock}</span>
                    </div>
                    {inCart && <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center"><Icon path={icons.check} size={9}/></div>}
                  </div>
                  <div className="px-2 py-1.5 flex-shrink-0">
                    <div className="font-semibold text-slate-800 text-[11px] leading-tight mb-1 group-hover:text-teal-700 line-clamp-2">{m.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-600 font-bold text-[11px]">{fmt(m.price)}</span>
                      <span className="text-[9px] text-slate-400">/{m.unit}</span>
                    </div>
                  </div>
                </button>
                <button onClick={() => setShowMedDetail(m)} className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-slate-100 hover:bg-teal-100 rounded-md flex items-center justify-center text-slate-400 hover:text-teal-600 transition-colors" title="Chi tiết">
                  <Icon path={icons.pill} size={10}/>
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
              <Icon path={icons.search} size={32} /><span className="text-sm">Không có sản phẩm</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={() => { setCustomerMode("retail"); setSelectedCustomerId(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${customerMode === "retail" ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              Khách lẻ
            </button>
            <button onClick={() => setCustomerMode("existing")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${customerMode === "existing" ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              Khách hàng cũ
            </button>
          </div>
          {customerMode === "existing" && (
            <select value={selectedCustomerId || ""} onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
            </select>
          )}
          {selectedCustomer && (
            <div className="bg-teal-50 rounded-xl px-3 py-2.5 border border-teal-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-200 rounded-xl flex items-center justify-center text-teal-700 font-bold text-xs">{selectedCustomer.name[0]}</div>
                <div>
                  <div className="text-xs font-semibold text-teal-800">{selectedCustomer.name}</div>
                  <div className="text-[10px] text-teal-600">{selectedCustomer.history.length} đơn hàng trước</div>
                </div>
              </div>
            </div>
          )}
          {selectedCustomer?.allergies && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex items-start gap-2">
              <div className="text-rose-500 mt-0.5 flex-shrink-0"><Icon path={icons.allergy} size={14}/></div>
              <div>
                <div className="text-xs font-bold text-rose-700">Cảnh báo dị ứng</div>
                <div className="text-xs text-rose-600">{selectedCustomer.allergies}</div>
              </div>
            </div>
          )}
          {allergyWarnings.length > 0 && (
            <div className="bg-rose-100 border-2 border-rose-400 rounded-xl px-3 py-2 animate-pulse">
              <div className="text-xs font-bold text-rose-700 flex items-center gap-1"><Icon path={icons.warning} size={13}/>⚠ XUNG ĐỘT DỊ ỨNG!</div>
              {allergyWarnings.map((m) => <div key={m.id} className="text-xs text-rose-600">· {m.name}</div>)}
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex gap-2" style={{marginBottom: orderType === "toa" ? 8 : 0}}>
            {[["lẻ","🛒 Bán lẻ"],["toa","📋 Theo toa"]].map(([v,l]) => (
              <button key={v} onClick={() => setOrderType(v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${orderType===v ? "bg-teal-500 text-white border-teal-500" : "border-slate-200 text-slate-500 hover:border-teal-300"}`}>{l}</button>
            ))}
          </div>
          {orderType === "toa" && (
            <input value={orderName} onChange={e => setOrderName(e.target.value)} placeholder="Tên đơn thuốc..."
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700 placeholder-slate-400"/>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
          <Icon path={icons.cart} size={16}/>
          <span className="font-bold text-slate-800 text-sm">Giỏ hàng</span>
          {cart.length > 0 && <span className="ml-auto text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{cart.length}</span>}
        </div>

        <div className="overflow-y-auto px-3 py-3 space-y-2 flex-shrink-0" style={{maxHeight: "calc(5 * 110px)"}}>
          {cart.length === 0
            ? <div className="flex flex-col items-center justify-center py-6 text-slate-300 gap-2"><Icon path={icons.cart} size={36}/><span className="text-sm">Chưa có sản phẩm</span></div>
            : cart.map((item) => (
              <div key={item.id} className={`bg-slate-50 border border-slate-100 rounded-2xl p-3 ${allergyWarnings.find((w) => w.id === item.id) ? "border-rose-200 bg-rose-50" : ""}`}>
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MedicineAvatar medicine={item} size="sm"/>
                    <span className="text-xs font-bold text-slate-700 leading-tight truncate flex items-center gap-1">
                      {allergyWarnings.find((w) => w.id === item.id) && <span className="text-rose-500">⚠</span>}
                      {item.name}
                    </span>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-400 ml-1 flex-shrink-0"><Icon path={icons.trash} size={14}/></button>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-slate-400">Giá:</span>
                  <input type="number" value={item.cartPrice} onChange={e => upPrice(item.id, e.target.value)}
                    className="w-24 text-xs border border-teal-200 bg-teal-50 rounded-lg px-2 py-1 text-teal-700 font-bold focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                  <span className="text-[10px] text-slate-400">đ</span>
                </div>
                <UnitPicker value={item.unit} onChange={u => upUnit(item.id, u)} extra={xtraUnits} onAdd={u => setXtraUnits(p => [...new Set([...p,u])])}/>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id,-1)} className="w-7 h-7 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg flex items-center justify-center"><Icon path={icons.minus} size={12}/></button>
                    <span className="w-7 text-center text-sm font-bold text-slate-700">{item.qty}</span>
                    <button onClick={() => updateQty(item.id,1)} className="w-7 h-7 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-200 rounded-lg flex items-center justify-center"><Icon path={icons.plus} size={12}/></button>
                  </div>
                  <span className="text-sm font-extrabold text-teal-600">{fmt((item.cartPrice||0)*item.qty)}</span>
                </div>
              </div>
            ))}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 space-y-2 bg-slate-50 flex-shrink-0">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Tạm tính</span><span className="font-bold text-slate-700">{fmt(subtotal)}</span></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Giảm giá</span>
            <input type="number" min={0} max={100} value={discountPct} onChange={e => { setDiscountPct(Number(e.target.value)); setTotalOverride(""); }}
              className="w-12 border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-teal-400 text-slate-700"/>
            <span className="text-xs text-slate-400">%</span>
            {discount > 0 && <span className="text-xs text-emerald-600 font-semibold ml-auto">-{fmt(discount)}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Tăng giá</span>
            <input type="number" min={0} value={markupPct} onChange={e => { setMarkupPct(e.target.value); setTotalOverride(""); }}
              placeholder="0"
              className="w-12 border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-400 text-slate-700"/>
            <span className="text-xs text-slate-400">%</span>
            {markupPct !== "" && Number(markupPct) > 0 && <span className="text-xs text-amber-600 font-semibold ml-auto">+{fmt(markupAmt)}</span>}
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-600 w-16">Tổng cộng</span>
            <input type="number" min={0} value={totalOverride !== "" ? totalOverride : total}
              onChange={e => { setTotalOverride(e.target.value); setDiscountPct(0); setMarkupPct(""); }}
              className="flex-1 border-2 border-teal-300 focus:border-teal-500 rounded-xl px-2 py-1.5 text-sm font-bold text-teal-600 text-right focus:outline-none bg-white"/>
            <span className="text-xs text-slate-400">đ</span>
          </div>
          {totalOverride !== "" && <div className="text-[10px] text-amber-500 text-right">✏ Đã chỉnh tổng thủ công</div>}
          <button onClick={() => cart.length && setShowCheckout(true)} disabled={!cart.length}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${paid ? "bg-emerald-500 text-white" : cart.length ? "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            {paid ? <span className="flex items-center justify-center gap-2"><Icon path={icons.check} size={16}/>Thanh toán thành công!</span> : "Thanh toán"}
          </button>
        </div>
      </div>

      {showPrescriptions && !prescEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl flex-shrink-0">
              <div>
                <div className="font-bold text-slate-800 text-lg">Đơn mẫu tham khảo</div>
                <div className="text-xs text-slate-400 mt-0.5">Chọn, sửa, copy hoặc áp dụng đơn vào giỏ hàng</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPrescEdit({ id: Date.now(), name: "", description: "", items: [] })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600">
                  <Icon path={icons.plus} size={12}/> Tạo mới
                </button>
                <button onClick={() => setShowPrescriptions(false)} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
              </div>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              {prescriptions.map((pres) => (
                <div key={pres.id} className="border border-slate-100 rounded-2xl p-4 hover:border-violet-200 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 group-hover:text-violet-700 truncate">{pres.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{pres.description}</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => loadPrescription(pres)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white rounded-xl text-xs font-semibold hover:bg-violet-600">
                        <Icon path={icons.cart} size={11}/> Dùng
                      </button>
                      <button onClick={() => setPrescEdit(JSON.parse(JSON.stringify(pres)))}
                        className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600">
                        <Icon path={icons.edit} size={13}/>
                      </button>
                      <button onClick={() => copyPrescription(pres)}
                        className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600">
                        <Icon path={icons.save} size={13}/>
                      </button>
                      <button onClick={() => deletePrescription(pres.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600">
                        <Icon path={icons.trash} size={13}/>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {pres.items.map((pi, idx) => {
                      const med = medicines.find((m) => m.id === pi.medId);
                      return med ? (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"/>
                          <span className="font-medium">{med.name}</span>
                          <span className="text-slate-400">× {pi.qty} {med.unit}</span>
                          {pi.price != null && <span className="text-teal-600 font-semibold">{(pi.price).toLocaleString("vi-VN")}đ</span>}
                          <span className="ml-auto text-slate-400 italic">{pi.note}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrescriptions && prescEdit && (
        <PrescriptionEditModal
          pres={prescEdit}
          medicines={medicines}
          onSave={(p) => { savePrescription(p); setPrescEdit(null); }}
          onCancel={() => setPrescEdit(null)}
        />
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="font-bold text-slate-800 text-lg">Xác nhận thanh toán</div>
              <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
            </div>
            <div className="px-6 pt-4 pb-2">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tên đơn thuốc</label>
              <input value={orderName} onChange={e => setOrderName(e.target.value)} placeholder={`Đơn ${new Date().toLocaleDateString("vi-VN")}...`}
                className="w-full border-2 border-teal-300 focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none"/>
            </div>
            <div className="px-6 py-4 space-y-2 max-h-48 overflow-y-auto">
              {cart.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate flex-1 mr-2">{i.name} × {i.qty} {i.unit}</span>
                  <span className="text-slate-700 font-medium flex-shrink-0">{fmt((i.cartPrice||i.price) * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-3">
              {selectedCustomer && <div className="text-xs text-slate-500 bg-teal-50 rounded-xl px-3 py-2">Khách: <strong className="text-teal-700">{selectedCustomer.name}</strong></div>}
              {discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Giảm giá {discountPct}%</span><span>-{fmt(discount)}</span></div>}
              <div className="flex justify-between font-bold text-xl text-slate-800">
                <span>Tổng</span><span className="text-teal-600">{fmt(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setShowCheckout(false)} className="py-3 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
                <button onClick={handleCheckout} className="py-3 rounded-xl bg-teal-500 text-white text-sm font-bold hover:bg-teal-600 shadow-lg shadow-teal-200 flex items-center justify-center gap-2">
                  <Icon path={icons.check} size={16}/>Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMedDetail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMedDetail(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800">Chi tiết thuốc</div>
              <button onClick={() => setShowMedDetail(null)} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={18}/></button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <MedicineAvatar medicine={showMedDetail} size="lg"/>
              <div>
                <div className="font-bold text-slate-800">{showMedDetail.name}</div>
                <Badge color="blue">{showMedDetail.group}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Giá bán", fmt(showMedDetail.price) + "/" + showMedDetail.unit, "text-teal-600 font-bold"],
                ["Nhà phân phối", showMedDetail.supplier, ""],
                ["Tồn kho", showMedDetail.stock + " " + showMedDetail.unit, showMedDetail.stock < 50 ? "text-amber-600 font-semibold" : ""],
                ["Hạn sử dụng", showMedDetail.expiry || "—", ""],
              ].map(([l, v, cls]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">{l}</span>
                  <span className={`text-slate-700 ${cls}`}>{v}</span>
                </div>
              ))}
              {showMedDetail.components && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Thành phần hoạt chất</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{showMedDetail.components}</div>
                </div>
              )}
            </div>
            <button onClick={() => { addToCart(showMedDetail); setShowMedDetail(null); }}
              className="w-full mt-4 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── INVENTORY TAB ─────────────────────────────────────────────────────────────
function InventoryTab() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const [search, setSearch]             = useState("");
  const [filterGroup, setFilterGroup]   = useState("Tất cả");
  const [filterSupplier, setFilterSupplier] = useState("Tất cả");
  const [modal, setModal]               = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]               = useState(null);
  const [unitView, setUnitView]         = useState({});

  const showToast = (msg, color = "teal") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };
  const filtered = medicines.filter((m) => {
    const ms = search.toLowerCase();
    return (filterGroup === "Tất cả" || m.group === filterGroup) && (filterSupplier === "Tất cả" || m.supplier === filterSupplier) && (m.name.toLowerCase().includes(ms) || (m.supplier || "").toLowerCase().includes(ms));
  });
  const lowStock   = medicines.filter((m) => m.stock > 0 && m.stock < 50).length;
  const outOfStock = medicines.filter((m) => m.stock === 0).length;
  const totalValue = medicines.reduce((s, m) => s + m.stock * (m.importPrice || 0), 0);
  const handleSave = (form) => {
    if (modal.mode === "add") { addMedicine({ ...form, id: genId() }); showToast(`✓ Đã thêm "${form.name}" vào kho`); }
    else { updateMedicine({ ...modal.data, ...form }); showToast(`✓ Đã cập nhật "${form.name}"`); }
    setModal(null);
  };
  const handleDelete = (med) => { deleteMedicine(med.id); setConfirmDelete(null); showToast(`Đã xoá "${med.name}"`, "rose"); };
  const stockChip = (s) => {
    if (s === 0) return "text-rose-600 bg-rose-50 border border-rose-200";
    if (s < 50) return "text-amber-600 bg-amber-50 border border-amber-200";
    return "text-emerald-600 bg-emerald-50 border border-emerald-200";
  };

  const today = new Date();
  const getExpiryStatus = (expiry) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff < 90) return "soon";
    return "ok";
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng sản phẩm",   value: medicines.length,    color: "text-teal-600",   bg: "bg-teal-50",   icon: icons.box },
          { label: "Giá trị tồn kho", value: fmt(totalValue),      color: "text-violet-600", bg: "bg-violet-50", icon: icons.inventory },
          { label: "Sắp hết hàng",    value: `${lowStock} loại`,   color: lowStock ? "text-amber-600" : "text-slate-400", bg: lowStock ? "bg-amber-50" : "bg-slate-50", icon: icons.warning },
          { label: "Hết hàng",        value: `${outOfStock} loại`, color: outOfStock ? "text-rose-600" : "text-slate-400", bg: outOfStock ? "bg-rose-50" : "bg-slate-50", icon: icons.close },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`${s.color} opacity-60`}><Icon path={s.icon} size={20}/></div>
            <div><div className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</div><div className="text-xs text-slate-500 mt-1">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative w-60">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16}/></span>
          <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm thuốc, nhà phân phối…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option>Tất cả</option>{ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
          <option>Tất cả</option>{ALL_SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setModal({ mode: "add", data: null })} className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all shadow-md shadow-teal-200">
          <Icon path={icons.plus} size={16}/>Thêm thuốc mới
        </button>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur border-b border-slate-100 z-10">
              <tr>
                {[
                  { h: "",               cls: "w-12" },
                  { h: "Tên thuốc",      cls: "min-w-[140px]" },
                  { h: "Đơn vị tính",    cls: "min-w-[110px]" },
                  { h: "Giá bán",        cls: "min-w-[100px]" },
                  { h: "Giá nhập",       cls: "min-w-[100px]" },
                  { h: "Tồn kho",        cls: "min-w-[90px]" },
                  { h: "Nhóm thuốc",     cls: "min-w-[130px]" },
                  { h: "Thành phần",     cls: "min-w-[160px]" },
                  { h: "Nhà phân phối",  cls: "min-w-[150px]" },
                  { h: "Hạn dùng",       cls: "min-w-[100px]" },
                  { h: "",               cls: "w-20" },
                ].map(({ h, cls }, i) => (
                  <th key={i} className={`text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${cls}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-16 text-slate-400"><div className="flex flex-col items-center gap-2"><Icon path={icons.search} size={32}/><span>Không tìm thấy sản phẩm nào</span></div></td></tr>
              ) : filtered.map((m) => {
                const expStatus = getExpiryStatus(m.expiry);
                // Build ordered unit list from packaging string
                const packStr = m.packaging || "";
                const packPairs = {};
                if (packStr) {
                  for (const p of packStr.split(",").map(s => s.trim()).filter(Boolean)) {
                    const pm = p.match(/^([^\s=]+)\s*=\s*(\d+)\s*([^\s]+)$/);
                    if (pm) packPairs[pm[1]] = { qty: Number(pm[2]), sub: pm[3] };
                  }
                }
                // Build ordered units: smallest first
                // Format: viên=10vỉ → packPairs[viên]={qty:10,sub:vỉ} → vỉ chứa 10 viên
                // key = đơn vị nhỏ, sub = đơn vị lớn hơn
                // Smallest = key không là sub của bất kỳ ai
                const allPackUnits = (() => {
                  if (!packStr) return [m.unit];
                  const allKeys = Object.keys(packPairs);
                  const allSubs = new Set(Object.values(packPairs).map(p => p.sub));
                  const smallest = allKeys.find(k => !allSubs.has(k)) || allKeys[0];
                  const chain = [smallest];
                  let cur = smallest;
                  for (let i = 0; i < 20; i++) {
                    const sub = packPairs[cur]?.sub;
                    if (!sub) break;
                    chain.push(sub);
                    cur = sub;
                  }
                  return chain;
                })();
                const selectedUnit = unitView[m.id] || m.unit;

                // chainQtys[i] = số lượng unit[i] trong unit[i+1]
                // packPairs[unit[i]].qty = số lượng unit[i] trong unit[i+1] (vì sub = unit[i+1])
                const chainQtys = allPackUnits.slice(0, -1).map((u) => packPairs[u]?.qty || 1);

                // Hệ số tích lũy của unit so với unit[0] (nhỏ nhất)
                const getChainMulti = (u) => {
                  const idx = allPackUnits.indexOf(u);
                  if (idx <= 0) return 1;
                  let m2 = 1;
                  for (let i = 0; i < idx; i++) m2 *= (chainQtys[i] || 1);
                  return m2;
                };

                // Tỷ lệ giá: selectedUnit / baseUnit (m.unit)
                const ratio = getChainMulti(selectedUnit) / (getChainMulti(m.unit) || 1);
                const displayPrice  = Math.round((m.price || 0) * ratio);
                const displayImport = m.importPrice ? Math.round(m.importPrice * ratio) : null;
                // Tồn kho: m.stock tính theo m.unit, convert sang selectedUnit
                const stockInSelected = m.stock * getChainMulti(m.unit) / (getChainMulti(selectedUnit) || 1);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="pl-3 pr-2 py-2"><MedicineAvatar medicine={m} size="sm"/></td>
                    <td className="px-3 py-2 font-semibold text-slate-800 max-w-[150px]"><div className="truncate">{m.name}</div></td>
                    <td className="px-3 py-2">
                      {allPackUnits.length > 1 ? (
                        <select
                          value={selectedUnit}
                          onChange={e => setUnitView(p => ({ ...p, [m.id]: e.target.value }))}
                          className="px-2 py-1 rounded-lg border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer hover:border-teal-400 transition-colors"
                        >
                          {allPackUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{m.unit}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-bold text-teal-600 whitespace-nowrap">
                      {fmt(displayPrice)}
                      <span className="text-[10px] font-normal text-slate-400">/{selectedUnit}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {displayImport ? (
                        <span className="text-violet-600 font-semibold">{fmt(displayImport)}<span className="text-[10px] font-normal text-slate-400">/{selectedUnit}</span></span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stockChip(m.stock)}`}>
                        {m.stock < 50 && <Icon path={icons.warning} size={11}/>}
                        {Number.isInteger(stockInSelected) ? stockInSelected : stockInSelected.toFixed(1)} {selectedUnit}
                      </span>
                    </td>
                    <td className="px-3 py-2"><Badge color="blue">{m.group}</Badge></td>
                    <td className="px-3 py-2 text-xs text-slate-400 max-w-[160px]"><div className="truncate" title={m.components}>{m.components || "—"}</div></td>
                    <td className="px-3 py-2 text-slate-600 text-xs">{m.supplier || "—"}</td>
                    <td className="px-3 py-2">
                      {m.expiry ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${expStatus === "expired" ? "bg-rose-100 text-rose-600" : expStatus === "soon" ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {expStatus === "expired" ? "Đã hết hạn" : expStatus === "soon" ? "Sắp hết" : new Date(m.expiry).toLocaleDateString("vi-VN")}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2 w-20">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => setModal({ mode: "edit", data: m })} title="Chỉnh sửa" className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"><Icon path={icons.edit} size={15}/></button>
                        <button onClick={() => { addMedicine({ ...m, id: genId(), name: m.name + " (copy)" }); showToast(`✓ Đã sao chép "${m.name}"`); }} title="Sao chép" className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors"><Icon path={icons.copy} size={15}/></button>
                        <button onClick={() => setConfirmDelete(m)} title="Xoá" className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"><Icon path={icons.trash} size={15}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Hiển thị <strong className="text-slate-600">{filtered.length}</strong> / {medicines.length} sản phẩm</span>
          {(filterGroup !== "Tất cả" || filterSupplier !== "Tất cả" || search) && (
            <button className="text-teal-500 hover:underline" onClick={() => { setSearch(""); setFilterGroup("Tất cả"); setFilterSupplier("Tất cả"); }}>Xoá bộ lọc</button>
          )}
        </div>
      </div>
      {modal && <MedicineModal initial={modal.mode === "edit" ? modal.data : null} onSave={handleSave} onClose={() => setModal(null)} />}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Icon path={icons.trash} size={22}/></div>
            <div className="font-bold text-slate-800 mb-1">Xoá thuốc này?</div>
            <div className="text-sm text-slate-500 mb-5">Sản phẩm <strong>"{confirmDelete.name}"</strong> sẽ bị xoá khỏi kho.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast}/>
    </div>
  );
}

// ── GROUPS TAB ────────────────────────────────────────────────────────────────
function GroupsTab() {
  const { medicines } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [detailMed, setDetailMed] = useState(null);
  const byGroup = ALL_GROUPS.reduce((acc, g) => { acc[g] = medicines.filter((m) => m.group === g); return acc; }, {});

  return (
    <div className="space-y-3 overflow-y-auto h-[calc(100vh-140px)] pr-1">
      {ALL_GROUPS.map((group) => {
        const meds  = byGroup[group] || [];
        const theme = GROUP_THEMES[group] || DEFAULT_THEME;
        const isOpen = expanded === group;
        const totalStock = meds.reduce((s, m) => s + m.stock, 0);
        return (
          <div key={group} className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: isOpen ? theme.accent + "40" : "#F1F5F9", background: isOpen ? theme.bg : "#fff" }}>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors" onClick={() => setExpanded(isOpen ? null : group)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 shadow-sm">{theme.svg || DEFAULT_THEME.svg}</div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">{group}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>{meds.length} loại thuốc</span>
                    <span>·</span>
                    <span>Tồn: {totalStock.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {meds.filter((m) => m.stock < 50).length > 0 && <Badge color="amber">{meds.filter((m) => m.stock < 50).length} sắp hết</Badge>}
                <Icon path={isOpen ? icons.minus : icons.plus} size={16}/>
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-4">
                {meds.length === 0
                  ? <div className="text-sm text-slate-400 py-2">Chưa có thuốc trong nhóm này.</div>
                  : <div className="grid grid-cols-3 gap-3">
                    {meds.map((m) => (
                      <button key={m.id} onClick={() => setDetailMed(m)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group">
                        <div className="w-full h-20 flex items-center justify-center relative" style={{ background: theme.bg }}>
                          {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover"/> : <div className="w-12 h-12">{theme.svg}</div>}
                          {m.stock < 50 && <div className="absolute top-1 right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"><Icon path={icons.warning} size={9}/></div>}
                        </div>
                        <div className="p-2.5">
                          <div className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2 group-hover:text-teal-700">{m.name}</div>
                          <div className="text-xs font-bold mt-1" style={{ color: theme.accent }}>{fmt(m.price)}/{m.unit}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Tồn: {m.stock}</div>
                          {m.expiry && (() => { const exp = new Date(m.expiry); const diff = (exp - new Date()) / (1000*60*60*24); return diff < 90 ? <div className={`text-[10px] mt-0.5 font-semibold ${diff < 0 ? "text-rose-500" : "text-amber-500"}`}>{diff < 0 ? "Hết hạn!" : "Sắp hết hạn"}</div> : null; })()}
                        </div>
                      </button>
                    ))}
                  </div>
                }
              </div>
            )}
          </div>
        );
      })}

      {detailMed && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailMed(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-slate-800">Thông tin thuốc</div>
              <button onClick={() => setDetailMed(null)} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={18}/></button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <MedicineAvatar medicine={detailMed} size="lg"/>
              <div>
                <div className="font-bold text-slate-800 text-lg">{detailMed.name}</div>
                <Badge color="blue">{detailMed.group}</Badge>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                ["Giá bán", fmt(detailMed.price) + "/" + detailMed.unit, "text-teal-600 font-bold"],
                ["Giá nhập", detailMed.importPrice ? fmt(detailMed.importPrice) : "—", ""],
                ["Nhà phân phối", detailMed.supplier || "—", ""],
                ["Tồn kho", detailMed.stock + " " + detailMed.unit, detailMed.stock < 50 ? "text-amber-600 font-semibold" : ""],
                ["Hạn sử dụng", detailMed.expiry ? new Date(detailMed.expiry).toLocaleDateString("vi-VN") : "—", ""],
              ].map(([l, v, cls]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">{l}</span>
                  <span className={`text-slate-700 text-right max-w-[200px] ${cls}`}>{v}</span>
                </div>
              ))}
              {detailMed.components && (
                <div className="bg-slate-50 rounded-xl p-3 mt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">Thành phần hoạt chất</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{detailMed.components}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ORDER MODAL ───────────────────────────────────────────────────────────────
function OrderModal({ data, mode, onSave, onClose }) {
  const [order, setOrder] = useState({ ...data, items: data.items.map(i => ({ ...i })) });
  const setField = (k, v) => setOrder(o => ({ ...o, [k]: v }));
  const setItem = (idx, k, v) => setOrder(o => ({ ...o, items: o.items.map((it, i) => i === idx ? { ...it, [k]: v } : it) }));
  const addItem = () => setOrder(o => ({ ...o, items: [...o.items, { name: "", qty: 1, price: 0 }] }));
  const removeItem = (idx) => setOrder(o => ({ ...o, items: o.items.filter((_, i) => i !== idx) }));

  const calcTotal = order.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: "calc(100vh - 32px)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 rounded-t-3xl">
          <div className="font-bold text-slate-800 text-lg">{mode === "add" ? "Thêm đơn hàng" : "Chỉnh sửa đơn hàng"}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Ngày bán *</label>
              <input type="date" className={inp} value={order.date} onChange={e => setField("date", e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Loại đơn</label>
              <div className="flex gap-2 h-[42px]">
                {[["lẻ","🛒 Bán lẻ"],["toa","📋 Theo toa"]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setField("type", v)}
                    className={`flex-1 rounded-xl text-xs font-bold border transition-all ${order.type === v ? "bg-teal-500 text-white border-teal-500" : "border-slate-200 text-slate-500 hover:border-teal-300"}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          {order.type === "toa" && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Tên đơn thuốc</label>
              <input className={inp} placeholder="VD: Đơn tim mạch..." value={order.orderName || ""} onChange={e => setField("orderName", e.target.value)}/>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Danh sách thuốc</label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 px-2.5 py-1 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600">
                <Icon path={icons.plus} size={11}/> Thêm dòng
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid gap-2 text-[10px] font-semibold text-slate-400 uppercase px-1" style={{gridTemplateColumns:"1fr 56px 88px 28px"}}>
                <span>Tên thuốc</span><span className="text-center">SL</span><span className="text-center">Đơn giá (đ)</span><span/>
              </div>
              {order.items.map((it, idx) => (
                <div key={idx} className="grid gap-2 items-center" style={{gridTemplateColumns:"1fr 56px 88px 28px"}}>
                  <input className="px-2.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    placeholder="Tên thuốc..." value={it.name} onChange={e => setItem(idx, "name", e.target.value)}/>
                  <input type="number" min="1" className="px-2 py-2 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    value={it.qty} onChange={e => setItem(idx, "qty", Number(e.target.value) || 1)}/>
                  <input type="number" min="0" className="px-2 py-2 rounded-xl border border-teal-200 bg-teal-50 text-sm text-right font-semibold text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={it.price} onChange={e => setItem(idx, "price", Number(e.target.value) || 0)}/>
                  <button type="button" onClick={() => removeItem(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors">
                    <Icon path={icons.trash} size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-teal-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-teal-100">
            <span className="text-sm font-semibold text-slate-600">Tổng tiền (tự tính)</span>
            <span className="text-lg font-bold text-teal-600">{fmt(calcTotal)}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hoặc nhập tổng thủ công (đ)</label>
            <input type="number" min="0" className={inp} placeholder={String(calcTotal)}
              value={order.total === calcTotal ? "" : order.total}
              onChange={e => setField("total", Number(e.target.value) || calcTotal)}/>
          </div>
        </div>
        <div className="px-6 py-4 flex gap-3 border-t border-slate-100 flex-shrink-0 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
          <button
            onClick={() => onSave({ ...order, total: order.total || calcTotal })}
            disabled={!order.date || order.items.every(it => !it.name.trim())}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${order.date && order.items.some(it => it.name.trim()) ? "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            {mode === "add" ? "Thêm đơn hàng" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMERS TAB ─────────────────────────────────────────────────────────────
function CustomersTab() {
  const { customers, setCustomers } = useApp();
  const [selected, setSelected]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [form, setForm]             = useState({ name: "", phone: "", dob: "", address: "", allergies: "", note: "" });
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("info");
  const [historySearch, setHistorySearch] = useState("");

  const filtered    = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const customer    = customers.find((c) => c.id === selected) || null;
  const set         = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ name: "", phone: "", dob: "", address: "", allergies: "", note: "" }); setShowModal(true); setEditMode(false); };
  const openEdit = () => { setForm({ ...customer }); setEditMode(true); setShowModal(true); };
  const saveCustomer = () => {
    if (!form.name || !form.phone) return;
    if (editMode) {
      setCustomers((prev) => prev.map((c) => c.id === customer.id ? { ...c, ...form } : c));
    } else {
      const nc = { ...form, id: genId(), history: [] };
      setCustomers((prev) => [...prev, nc]);
      setSelected(nc.id);
    }
    setShowModal(false);
  };

  const totalSpent = customer?.history.reduce((s, h) => s + h.total, 0) || 0;
  const lastVisit  = customer?.history.length ? customer.history[customer.history.length - 1].date : null;

  const [orderModal, setOrderModal] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);

  const emptyOrder = () => ({ date: new Date().toISOString().slice(0,10), type: "lẻ", orderName: "", items: [{ name: "", qty: 1, price: 0 }], total: 0 });

  const openAddOrder = () => setOrderModal({ mode: "add", index: null, data: emptyOrder() });
  const openEditOrder = (idx) => {
    const realIdx = customer.history.length - 1 - idx;
    setOrderModal({ mode: "edit", index: realIdx, data: JSON.parse(JSON.stringify(customer.history[realIdx])) });
  };
  const deleteOrder = (idx) => {
    const realIdx = customer.history.length - 1 - idx;
    setCustomers(prev => prev.map(c => c.id === customer.id
      ? { ...c, history: c.history.filter((_, i) => i !== realIdx) }
      : c
    ));
    setConfirmDeleteOrder(null);
  };
  const saveOrder = (data) => {
    const total = data.items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.qty)||0), 0);
    const order = { ...data, total };
    setCustomers(prev => prev.map(c => {
      if (c.id !== customer.id) return c;
      if (orderModal.mode === "add") return { ...c, history: [...c.history, order] };
      const hist = [...c.history];
      hist[orderModal.index] = order;
      return { ...c, history: hist };
    }));
    setOrderModal(null);
  };

  const Field = ({ label, children }) => (<div><label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>{children}</div>);

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      <div className="w-72 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16}/></span>
            <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm khách hàng…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={openAdd} className="px-3 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"><Icon path={icons.plus} size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { setSelected(c.id); setActiveTab("info"); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${selected === c.id ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-200" : "bg-white border-slate-100 hover:border-teal-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${selected === c.id ? "bg-teal-400 text-white" : "bg-teal-100 text-teal-700"}`}>{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${selected === c.id ? "text-white" : "text-slate-800"}`}>{c.name}</div>
                  <div className={`text-xs mt-0.5 ${selected === c.id ? "text-teal-100" : "text-slate-500"}`}>{c.phone}</div>
                </div>
                {c.allergies && <div className={`flex-shrink-0 ${selected === c.id ? "text-rose-200" : "text-rose-400"}`}><Icon path={icons.allergy} size={14}/></div>}
              </div>
              <div className={`flex justify-between text-xs mt-2 ${selected === c.id ? "text-teal-100" : "text-slate-400"}`}>
                <span>{c.history.length} đơn hàng</span>
                <span className={`font-semibold ${selected === c.id ? "text-teal-100" : "text-teal-600"}`}>{fmt(c.history.reduce((s, h) => s + h.total, 0))}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {!customer ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3"><Icon path={icons.user} size={48}/><span>Chọn khách hàng để xem thông tin</span></div>
        ) : (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-2xl">{customer.name[0]}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-xl">{customer.name}</div>
                    <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Icon path={icons.phone} size={13}/>{customer.phone}</span>
                      {customer.dob && <span className="flex items-center gap-1"><Icon path={icons.calendar} size={13}/>{new Date(customer.dob).toLocaleDateString("vi-VN")}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={openEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors">
                  <Icon path={icons.edit} size={15}/> Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Tổng đơn hàng", value: customer.history.length, color: "text-teal-600" },
                  { label: "Tổng chi tiêu", value: fmt(totalSpent), color: "text-violet-600" },
                  { label: "Lần cuối ghé", value: lastVisit ? new Date(lastVisit).toLocaleDateString("vi-VN") : "Chưa có", color: "text-slate-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl px-3 py-2.5 border border-slate-100 text-center">
                    <div className={`font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-1 px-6 pt-4 border-b border-slate-100">
              {[["info","Thông tin",icons.user],["history","Lịch sử nhập",icons.history],["allergy","Dị ứng & Ghi chú",icons.allergy]].map(([id, label, icon]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === id ? "text-teal-600 border-teal-500 bg-teal-50/50" : "text-slate-500 border-transparent hover:text-slate-700"}`}>
                  <Icon path={icon} size={14}/>{label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "info" && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Họ và tên", customer.name],
                    ["Số điện thoại", customer.phone],
                    ["Ngày sinh", customer.dob ? new Date(customer.dob).toLocaleDateString("vi-VN") : "—"],
                    ["Địa chỉ", customer.address || "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 rounded-xl p-3">
                      <div className="text-xs text-slate-400 mb-1">{l}</div>
                      <div className="text-sm font-medium text-slate-700">{v}</div>
                    </div>
                  ))}
                  {customer.note && (
                    <div className="col-span-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <div className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1"><Icon path={icons.note} size={12}/>Ghi chú</div>
                      <div className="text-sm text-amber-700">{customer.note}</div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "history" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={14}/></span>
                      <input
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-slate-300"
                        placeholder="Tìm tên đơn, tên thuốc..."
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                      />
                      {historySearch && (
                        <button onClick={() => setHistorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                          <Icon path={icons.close} size={13}/>
                        </button>
                      )}
                    </div>
                    <button onClick={openAddOrder}
                      className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors shadow-sm shadow-teal-200 flex-shrink-0">
                      <Icon path={icons.plus} size={13}/> Thêm đơn
                    </button>
                  </div>
                  {(() => {
                    const reversed = [...customer.history].reverse();
                    const hs = historySearch.toLowerCase().trim();
                    const filteredH = hs
                      ? reversed.filter(h =>
                          (h.orderName || "").toLowerCase().includes(hs) ||
                          h.items.some(it => it.name.toLowerCase().includes(hs))
                        )
                      : reversed;
                    if (customer.history.length === 0)
                      return <div className="text-center text-slate-400 py-10 border-2 border-dashed border-slate-100 rounded-2xl">Chưa có lịch sử bán hàng</div>;
                    if (filteredH.length === 0)
                      return <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-100 rounded-2xl">Không tìm thấy đơn nào</div>;
                    return filteredH.map((h, hi) => {
                      const realHi = reversed.indexOf(h);
                      return (
                        <div key={hi} className="border border-slate-100 rounded-2xl p-4 hover:border-teal-200 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              {h.orderName && (
                                <div className="font-semibold text-teal-600 text-sm mb-1 truncate">{h.orderName}</div>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString("vi-VN")}</span>
                                <Badge color={h.type === "toa" ? "purple" : "slate"}>{h.type === "toa" ? "📋 Theo toa" : "🛒 Bán lẻ"}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="font-bold text-teal-600 text-sm">{fmt(h.total)}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditOrder(realHi)}
                                  className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors">
                                  <Icon path={icons.edit} size={14}/>
                                </button>
                                <button onClick={() => setConfirmDeleteOrder(realHi)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                                  <Icon path={icons.trash} size={14}/>
                                </button>
                              </div>
                            </div>
                          </div>
                          {h.items.map((item, ii) => (
                            <div key={ii} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className={`text-slate-600 ${hs && item.name.toLowerCase().includes(hs) ? "text-teal-600 font-semibold" : ""}`}>
                                {item.name} × {item.qty}
                              </span>
                              <span className="text-slate-500">{fmt((item.price||0) * (item.qty||0))}</span>
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              {activeTab === "allergy" && (
                <div className="space-y-4">
                  <div className={`rounded-2xl p-4 border ${customer.allergies ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon path={icons.allergy} size={16}/>
                      <div className={`font-semibold text-sm ${customer.allergies ? "text-rose-700" : "text-slate-500"}`}>Dị ứng thuốc</div>
                    </div>
                    {customer.allergies
                      ? <div className="flex flex-wrap gap-2">{customer.allergies.split(",").map((a) => <span key={a} className="bg-rose-200 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">{a.trim()}</span>)}</div>
                      : <div className="text-sm text-slate-400">Không có thông tin dị ứng</div>
                    }
                  </div>
                  {customer.note && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <div className="font-semibold text-sm text-amber-700 mb-2 flex items-center gap-2"><Icon path={icons.note} size={15}/>Ghi chú dược sĩ</div>
                      <div className="text-sm text-amber-800 leading-relaxed">{customer.note}</div>
                    </div>
                  )}
                  <button onClick={openEdit} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-teal-300 hover:text-teal-500 transition-colors flex items-center justify-center gap-2">
                    <Icon path={icons.edit} size={15}/>Cập nhật thông tin dị ứng
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
              <div className="font-bold text-slate-800 text-lg">{editMode ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Họ và tên *"><input className={inp} placeholder="Nguyễn Văn A" value={form.name} onChange={(e) => set("name", e.target.value)}/></Field>
                </div>
                <Field label="Số điện thoại *"><input className={inp} placeholder="0901234567" value={form.phone} onChange={(e) => set("phone", e.target.value)}/></Field>
                <Field label="Ngày sinh"><input type="date" className={inp} value={form.dob} onChange={(e) => set("dob", e.target.value)}/></Field>
                <div className="col-span-2">
                  <Field label="Địa chỉ"><input className={inp} placeholder="123 Đường ABC, Quận 1..." value={form.address || ""} onChange={(e) => set("address", e.target.value)}/></Field>
                </div>
                <div className="col-span-2">
                  <Field label="Dị ứng thuốc">
                    <input className={inp + " border-rose-200 focus:ring-rose-400"} placeholder="VD: Penicillin, Aspirin (phân cách bằng dấu phẩy)" value={form.allergies || ""} onChange={(e) => set("allergies", e.target.value)}/>
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><Icon path={icons.warning} size={11}/>Thông tin này sẽ hiển thị cảnh báo trên POS</p>
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Ghi chú dược sĩ"><textarea className={inp + " resize-none"} rows={3} placeholder="Ghi chú về tình trạng sức khỏe, thuốc đang dùng..." value={form.note || ""} onChange={(e) => set("note", e.target.value)}/></Field>
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3 sticky bottom-0 bg-white border-t border-slate-50 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={saveCustomer} disabled={!form.name || !form.phone}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.name && form.phone ? "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                {editMode ? "Lưu thay đổi" : "Thêm khách hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {orderModal && (
        <OrderModal
          data={orderModal.data}
          mode={orderModal.mode}
          onSave={saveOrder}
          onClose={() => setOrderModal(null)}
        />
      )}

      {confirmDeleteOrder !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Icon path={icons.trash} size={22}/></div>
            <div className="font-bold text-slate-800 mb-1">Xoá đơn hàng này?</div>
            <div className="text-sm text-slate-500 mb-5">Đơn hàng sẽ bị xoá khỏi lịch sử bán của khách hàng.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteOrder(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={() => deleteOrder(confirmDeleteOrder)} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRICE TAB ─────────────────────────────────────────────────────────────────
function initMedSuppliers(medicines) {
  const map = {};
  medicines.forEach((m) => {
    map[m.id] = ALL_SUPPLIERS.map((s, i) => ({
      id: `${m.id}-${i}`,
      name: s,
      active: s === m.supplier,
      price: s === m.supplier && m.importPrice
        ? m.importPrice
        : Math.round((m.importPrice || m.price * 0.7) * (0.82 + ((m.id * 17 + i * 31) % 100) / 220)),
    }));
  });
  return map;
}

function PriceTab() {
  const { medicines } = useApp();
  const [priceMode, setPriceMode]       = useState("supplier");
  const [selectedId, setSelectedId]     = useState(medicines[0]?.id ?? null);
  const [search, setSearch]             = useState("");
  const [medSuppliers, setMedSuppliers] = useState(() => initMedSuppliers(medicines));
  const [editingCell, setEditingCell]   = useState(null);
  const [editVal, setEditVal]           = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [viewMode, setViewMode]         = useState("detail");

  const [compareIds, setCompareIds]     = useState([medicines[0]?.id, medicines[1]?.id].filter(Boolean));
  const [compareSearch, setCompareSearch] = useState("");

  const getSuppliersOf  = (medId) => medSuppliers[medId] || [];
  const setSuppliersOf  = (medId, updater) =>
    setMedSuppliers(prev => ({ ...prev, [medId]: typeof updater==="function" ? updater(prev[medId]||[]) : updater }));
  const updatePrice     = (medId, suppId, val) =>
    setSuppliersOf(medId, list => list.map(s => s.id===suppId ? {...s,price:Number(val)} : s));
  const toggleActive    = (medId, suppId) =>
    setSuppliersOf(medId, list => list.map(s => s.id===suppId ? {...s,active:!s.active} : s));
  const removeSupplier  = (medId, suppId) =>
    setSuppliersOf(medId, list => list.filter(s => s.id!==suppId));
  const addSupplierToMed = (medId) => {
    if (!newSupplierName.trim()) return;
    const med = medicines.find(m=>m.id===medId);
    setSuppliersOf(medId, list => [...list, {
      id:`${medId}-${genId()}`, name:newSupplierName.trim(), active:false,
      price: Math.round((med?.importPrice || med?.price*0.7||0)*0.9)
    }]);
    setNewSupplierName("");
  };

  const filtered       = medicines.filter(m=>m.name.toLowerCase().includes(search.toLowerCase()));
  const sel            = medicines.find(m=>m.id===selectedId) || medicines[0];
  const selSuppliers   = sel ? getSuppliersOf(sel.id) : [];
  const prices         = selSuppliers.map(s=>s.price);
  const minPrice       = prices.length ? Math.min(...prices) : 0;
  const maxPrice       = prices.length ? Math.max(...prices) : 0;

  const compareFiltered = medicines.filter(m=>m.name.toLowerCase().includes(compareSearch.toLowerCase()));
  const toggleCompare   = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x=>x!==id);
      if (prev.length >= 4) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };
  const compareMeds = compareIds.map(id=>medicines.find(m=>m.id===id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 items-center">
        <div className="font-semibold text-slate-700 text-sm mr-2 flex items-center gap-2"><Icon path={icons.price} size={16}/>So sánh giá</div>
        <div className="flex gap-1">
          {[["supplier","🏭 Theo nhà cung cấp"],["compare","⚖️ So sánh thuốc"]].map(([m,l])=>(
            <button key={m} onClick={()=>setPriceMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${priceMode===m?"bg-teal-500 text-white shadow-md shadow-teal-200":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {l}
            </button>
          ))}
        </div>
        {priceMode==="supplier" && (
          <div className="ml-auto flex gap-1">
            {[["detail","Chi tiết"],["table","Bảng"]].map(([m,l])=>(
              <button key={m} onClick={()=>setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode===m?"bg-teal-500 text-white":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {priceMode==="supplier" && viewMode==="detail" && (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-64 flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16}/></span>
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm thuốc…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filtered.map(m=>{
                const supList = getSuppliersOf(m.id);
                return (
                  <button key={m.id} onClick={()=>setSelectedId(m.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${sel?.id===m.id?"bg-teal-500 border-teal-500 shadow-lg shadow-teal-200":"bg-white border-slate-100 hover:border-teal-200"}`}>
                    <MedicineAvatar medicine={m} size="sm"/>
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold text-sm truncate ${sel?.id===m.id?"text-white":"text-slate-800"}`}>{m.name}</div>
                      <div className={`text-xs mt-0.5 ${sel?.id===m.id?"text-teal-100":"text-slate-400"}`}>{supList.length} nhà cung cấp</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {sel ? (
              <>
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-4">
                    <MedicineAvatar medicine={sel} size="lg"/>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-slate-800">{sel.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{sel.group}</div>
                      <div className="text-sm text-teal-600 font-semibold mt-1">Giá bán: {fmt(sel.price)}/{sel.unit}</div>
                    </div>
                    {prices.length>0 && (
                      <div className="flex gap-3">
                        {[{label:"Thấp nhất",v:fmt(minPrice),c:"text-emerald-600",bg:"bg-emerald-50"},{label:"Trung bình",v:fmt(Math.round(prices.reduce((a,b)=>a+b,0)/prices.length)),c:"text-sky-600",bg:"bg-sky-50"},{label:"Cao nhất",v:fmt(maxPrice),c:"text-rose-500",bg:"bg-rose-50"}].map(s=>(
                          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 text-center min-w-[80px]`}>
                            <div className={`text-sm font-bold ${s.c}`}>{s.v}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Icon path={icons.tag} size={13}/>So sánh giá nhập theo nhà cung cấp
                    <span className="ml-auto text-slate-300 font-normal normal-case">Chỉ áp dụng cho thuốc này</span>
                  </div>
                  {selSuppliers.length===0 ? (
                    <div className="text-center text-slate-300 py-10 border-2 border-dashed border-slate-100 rounded-2xl">Chưa có nhà cung cấp — thêm bên dưới</div>
                  ) : (
                    <div className="space-y-4">
                      {selSuppliers.map(supplier=>{
                        const price=supplier.price;
                        const pct=((price-minPrice)/(maxPrice-minPrice||1))*100;
                        const isBest=price===minPrice&&prices.length>1;
                        const isWorst=price===maxPrice&&minPrice!==maxPrice;
                        const isEditing=editingCell?.medId===sel.id&&editingCell?.suppId===supplier.id;
                        return (
                          <div key={supplier.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                <button onClick={()=>toggleActive(sel.id,supplier.id)}
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${supplier.active?"border-teal-500 bg-teal-500":"border-slate-300"}`}>
                                  {supplier.active&&<div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                                </button>
                                <span className="text-sm font-semibold text-slate-700 truncate">{supplier.name}</span>
                                {isBest&&<Badge color="green">★ Rẻ nhất</Badge>}
                                {isWorst&&<Badge color="rose">Đắt nhất</Badge>}
                                {supplier.active&&<Badge color="amber">Đang nhập</Badge>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isEditing ? (
                                  <input autoFocus type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                                    onBlur={()=>{updatePrice(sel.id,supplier.id,editVal);setEditingCell(null);}}
                                    onKeyDown={e=>{if(e.key==="Enter"){updatePrice(sel.id,supplier.id,editVal);setEditingCell(null);}}}
                                    className="w-28 px-2.5 py-1 rounded-lg border-2 border-teal-400 text-sm font-bold text-right focus:outline-none bg-white"/>
                                ) : (
                                  <button onClick={()=>{setEditingCell({medId:sel.id,suppId:supplier.id});setEditVal(String(price));}}
                                    className={`font-bold text-sm hover:underline cursor-pointer ${isBest?"text-emerald-600":isWorst?"text-rose-500":"text-slate-700"}`}>
                                    {fmt(price)} <span className="text-xs text-slate-300">✎</span>
                                  </button>
                                )}
                                <button onClick={()=>removeSupplier(sel.id,supplier.id)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors">
                                  <Icon path={icons.trash} size={13}/>
                                </button>
                              </div>
                            </div>
                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${isBest?"bg-emerald-400":isWorst?"bg-rose-400":"bg-teal-400"}`}
                                style={{width:`${Math.max(8,prices.length>1?pct:100)}%`}}/>
                            </div>
                            {sel.importPrice&&supplier.active&&(
                              <div className="text-xs text-slate-400 mt-1.5">
                                Đang nhập gốc: {fmt(sel.importPrice)} →
                                <span className={price<sel.importPrice?"text-emerald-600 font-semibold":"text-rose-500 font-semibold"}>
                                  {" "}{price<sel.importPrice?"Tiết kiệm":"Đắt hơn"} {fmt(Math.abs(price-sel.importPrice))}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-5 flex gap-2">
                    <input value={newSupplierName} onChange={e=>setNewSupplierName(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addSupplierToMed(sel.id)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                      placeholder={`Thêm NCC cho "${sel.name}"...`}/>
                    <button onClick={()=>addSupplierToMed(sel.id)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors flex items-center gap-2">
                      <Icon path={icons.plus} size={16}/>Thêm
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Icon path={icons.warning} size={11}/>Thêm/xóa NCC ở đây chỉ ảnh hưởng đến thuốc <strong>{sel.name}</strong>.
                  </p>
                </div>
              </>
            ) : <div className="h-full flex items-center justify-center text-slate-300">Chọn thuốc để so sánh giá</div>}
          </div>
        </div>
      )}

      {priceMode==="supplier" && viewMode==="table" && (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          <div className="flex gap-2 items-center">
            <div className="relative w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16}/></span>
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm thuốc…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur border-b border-slate-100 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap min-w-48">Tên thuốc</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nhà cung cấp</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-500 uppercase tracking-wide whitespace-nowrap">Tốt nhất</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Giá bán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(m=>{
                    const supList=getSuppliersOf(m.id);
                    const ps=supList.map(s=>s.price);
                    const best=ps.length?Math.min(...ps):0;
                    const bestSup=supList.find(s=>s.price===best);
                    const activeSup=supList.find(s=>s.active);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={()=>{setSelectedId(m.id);setViewMode("detail");}}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <MedicineAvatar medicine={m} size="sm"/>
                            <div><div className="font-semibold text-slate-800 text-sm">{m.name}</div><div className="text-xs text-slate-400">{m.group}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {supList.map(s=>(
                              <span key={s.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.active?"bg-teal-100 text-teal-700":"bg-slate-100 text-slate-500"}`}>
                                {s.name} · {fmt(s.price)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {bestSup ? (<>
                            <div className="font-bold text-emerald-600">{fmt(best)}</div>
                            <div className="text-[10px] text-slate-400">{bestSup.name}</div>
                            {activeSup&&activeSup.price>best&&<div className="text-xs text-amber-500">-{fmt(activeSup.price-best)}</div>}
                          </>) : "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-teal-600">{fmt(m.price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
              Click vào dòng để xem chi tiết và quản lý NCC riêng
            </div>
          </div>
        </div>
      )}

      {priceMode==="compare" && (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-64 flex flex-col gap-3 flex-shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={16}/></span>
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tìm thuốc…" value={compareSearch} onChange={e=>setCompareSearch(e.target.value)}/>
            </div>
            <div className="text-xs text-slate-400 px-1">Chọn tối đa 4 thuốc để so sánh</div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {compareFiltered.map(m=>{
                const isSelected=compareIds.includes(m.id);
                return (
                  <button key={m.id} onClick={()=>toggleCompare(m.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2 ${isSelected?"bg-teal-500 border-teal-500":"bg-white border-slate-100 hover:border-teal-200"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected?"border-white bg-white":"border-slate-300"}`}>
                      {isSelected&&<div className="w-2 h-2 bg-teal-500 rounded-sm"/>}
                    </div>
                    <MedicineAvatar medicine={m} size="sm"/>
                    <div className="min-w-0">
                      <div className={`font-semibold text-xs truncate ${isSelected?"text-white":"text-slate-700"}`}>{m.name}</div>
                      <div className={`text-[10px] ${isSelected?"text-teal-100":"text-slate-400"}`}>{fmt(m.price)}/{m.unit}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {compareMeds.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/></svg>
                <span className="text-sm">Chọn ít nhất 2 thuốc để so sánh</span>
              </div>
            ) : (
              <div className="overflow-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Tiêu chí</th>
                      {compareMeds.map((m,ci)=>{
                        const colors=["teal","violet","amber","rose"];
                        const c=colors[ci%colors.length];
                        const colorMap={teal:"bg-teal-50 border-teal-200 text-teal-700",violet:"bg-violet-50 border-violet-200 text-violet-700",amber:"bg-amber-50 border-amber-200 text-amber-700",rose:"bg-rose-50 border-rose-200 text-rose-700"};
                        return (
                          <th key={m.id} className="px-4 py-3 min-w-[160px]">
                            <div className={`rounded-xl p-2 border ${colorMap[c]} text-center`}>
                              <MedicineAvatar medicine={m} size="sm"/>
                              <div className="font-bold text-xs mt-1 leading-tight">{m.name}</div>
                              <button onClick={()=>toggleCompare(m.id)} className="text-[10px] opacity-50 hover:opacity-100 mt-0.5">✕ bỏ</button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { label:"Nhóm thuốc",     render: m=><Badge color="blue">{m.group}</Badge> },
                      { label:"Đơn vị",          render: m=><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">{m.unit}</span> },
                      { label:"Giá bán",         render: m=><span className="font-bold text-teal-600 text-sm">{fmt(m.price)}</span>, highlight: true },
                      { label:"Giá nhập",        render: m=><span className="text-slate-600">{m.importPrice?fmt(m.importPrice):"—"}</span> },
                      { label:"Biên lợi nhuận",  render: m=>{
                          if(!m.importPrice) return <span className="text-slate-300">—</span>;
                          const pct=Math.round((m.price-m.importPrice)/m.price*100);
                          return <span className={`font-semibold text-sm ${pct>=30?"text-emerald-600":pct>=15?"text-amber-600":"text-rose-500"}`}>{pct}%</span>;
                        }, highlight: true },
                      { label:"Tồn kho",         render: m=><span className={`font-semibold text-sm ${m.stock===0?"text-rose-500":m.stock<50?"text-amber-600":"text-emerald-600"}`}>{m.stock} {m.unit}</span> },
                      { label:"Nhà cung cấp",    render: m=><span className="text-xs text-slate-600">{m.supplier||"—"}</span> },
                      { label:"Hạn sử dụng",     render: m=>{
                          if(!m.expiry) return <span className="text-slate-300 text-xs">—</span>;
                          const diff=(new Date(m.expiry)-new Date())/(1000*60*60*24);
                          return <span className={`text-xs font-medium ${diff<0?"text-rose-500":diff<90?"text-amber-600":"text-emerald-600"}`}>{diff<0?"Hết hạn":new Date(m.expiry).toLocaleDateString("vi-VN")}</span>;
                        }},
                      { label:"Giá NCC rẻ nhất", render: m=>{
                          const supList=getSuppliersOf(m.id);
                          const ps=supList.map(s=>s.price);
                          if(!ps.length) return <span className="text-slate-300">—</span>;
                          const best=Math.min(...ps);
                          const bestS=supList.find(s=>s.price===best);
                          return <div><span className="font-bold text-emerald-600">{fmt(best)}</span><div className="text-[10px] text-slate-400">{bestS?.name}</div></div>;
                        }, highlight: true },
                      { label:"Quy cách",        render: m=><span className="text-xs text-slate-500">{m.packaging||"—"}</span> },
                      { label:"Thành phần",       render: m=><div className="text-xs text-slate-500 max-w-[160px] line-clamp-2">{m.components||"—"}</div> },
                    ].map(row=>{
                      let bestIdx = -1;
                      if(row.highlight) {
                        const vals = compareMeds.map(m=>{
                          if(row.label==="Giá bán") return m.price;
                          if(row.label==="Biên lợi nhuận") return m.importPrice?Math.round((m.price-m.importPrice)/m.price*100):0;
                          if(row.label==="Giá NCC rẻ nhất") { const ps=getSuppliersOf(m.id).map(s=>s.price); return ps.length?Math.min(...ps):Infinity; }
                          return 0;
                        });
                        if(row.label==="Biên lợi nhuận") bestIdx=vals.indexOf(Math.max(...vals));
                        else bestIdx=vals.indexOf(Math.min(...vals));
                      }
                      return (
                        <tr key={row.label} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{row.label}</td>
                          {compareMeds.map((m,ci)=>(
                            <td key={m.id} className={`px-4 py-3 ${row.highlight&&ci===bestIdx?"bg-emerald-50/60":""}`}>
                              <div className="flex items-center gap-1">
                                {row.render(m)}
                                {row.highlight&&ci===bestIdx&&<span className="text-[10px] text-emerald-500 font-bold">★</span>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ── SUPPLIERS + PROCURE TAB ───────────────────────────────────────────────────
const PROCURE_STATUS = {
  draft:    { label: "Nháp",        color: "bg-slate-100 text-slate-600",    dot: "bg-slate-400"    },
  sent:     { label: "Đã gửi",      color: "bg-sky-100 text-sky-700",        dot: "bg-sky-500"      },
  partial:  { label: "Nhận 1 phần", color: "bg-amber-100 text-amber-700",    dot: "bg-amber-500"    },
  received: { label: "Đã nhận",     color: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"  },
  cancelled:{ label: "Huỷ",         color: "bg-rose-100 text-rose-600",      dot: "bg-rose-400"     },
};
const SUP_COLORS = ["bg-teal-500","bg-violet-500","bg-sky-500","bg-amber-500","bg-rose-500","bg-emerald-500"];
const SUP_LIGHT  = ["bg-teal-50 border-teal-200 text-teal-700","bg-violet-50 border-violet-200 text-violet-700","bg-sky-50 border-sky-200 text-sky-700","bg-amber-50 border-amber-200 text-amber-700","bg-rose-50 border-rose-200 text-rose-700","bg-emerald-50 border-emerald-200 text-emerald-700"];

function SupplierModal({ initial, onSave, onClose }) {
  const EMPTY = { name:"", code:"", phone:"", email:"", address:"", contact:"", taxCode:"", note:"" };
  const [form, setForm] = useState(initial ? {...initial} : {...EMPTY});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp2 = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="font-bold text-slate-800 text-lg">{initial?"Chỉnh sửa NCC":"Thêm nhà cung cấp"}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={20}/></button>
        </div>
        <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Tên nhà cung cấp *</label><input className={inp2} placeholder="VD: DHG Pharma" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Mã NCC</label><input className={inp2} placeholder="VD: DHG" value={form.code} onChange={e=>set("code",e.target.value)}/></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Mã số thuế</label><input className={inp2} placeholder="VD: 0100100985" value={form.taxCode} onChange={e=>set("taxCode",e.target.value)}/></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Số điện thoại</label><input className={inp2} value={form.phone} onChange={e=>set("phone",e.target.value)}/></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Email</label><input className={inp2} type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Người liên hệ</label><input className={inp2} value={form.contact} onChange={e=>set("contact",e.target.value)}/></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Địa chỉ</label><input className={inp2} value={form.address} onChange={e=>set("address",e.target.value)}/></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Ghi chú</label><textarea className={inp2+" resize-none"} rows={2} value={form.note} onChange={e=>set("note",e.target.value)}/></div>
          </div>
        </div>
        <div className="px-6 py-4 flex gap-3 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
          <button disabled={!form.name.trim()} onClick={()=>form.name.trim()&&onSave(form)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${form.name.trim()?"bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            {initial?"Lưu thay đổi":"Thêm NCC"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuppliersProcureTab() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, suppliers, addSupplier, updateSupplier, deleteSupplier, procurements, saveProcurement, deleteProcurement } = useApp();
  const [subTab, setSubTab]         = useState("suppliers"); // "suppliers" | "procure"
  const [supModal, setSupModal]     = useState(null);
  const [confirmDelSup, setConfirmDelSup] = useState(null);
  const [selectedSup, setSelectedSup]     = useState(null); // supplier id → show its medicines
  const [toast, setToast]           = useState(null);
  // Procure state
  const [procView, setProcView]     = useState("list"); // "list" | "create" | "detail"
  const [detailId, setDetailId]     = useState(null);
  const [confirmDelPro, setConfirmDelPro] = useState(null);
  const [medModal, setMedModal]         = useState(null); // null | { mode, data }
  const [confirmDelMed, setConfirmDelMed] = useState(null);

  const handleSaveMed = (form) => {
    if (medModal.mode==="add") { addMedicine({...form, id:genId(), supplier:selSupplier?.name||""}); showToast(`✓ Đã thêm "${form.name}"`); }
    else { updateMedicine({...medModal.data,...form}); showToast(`✓ Đã cập nhật "${form.name}"`); }
    setMedModal(null);
  };

  const showToast = (msg, color="teal") => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const handleSaveSup = (form) => {
    if (supModal.mode==="add") { addSupplier({...form, id:genId()}); showToast(`✓ Đã thêm "${form.name}"`); }
    else { updateSupplier({...supModal.data,...form}); showToast(`✓ Đã cập nhật "${form.name}"`); }
    setSupModal(null);
  };
  const handleDelSup = (s) => {
    deleteSupplier(s.id);
    if (selectedSup===s.id) setSelectedSup(null);
    setConfirmDelSup(null);
    showToast(`Đã xoá "${s.name}"`, "rose");
  };

  const totalProcVal = (pr) => pr.items.reduce((s,i)=>s+(i.qtyOrdered||0)*(i.importPrice||0),0);

  // ── PROCURE: create / detail views ──
  if (subTab==="procure" && procView==="create")
    return <ProcureCreate
      medicines={medicines} suppliers={suppliers}
      onSave={pr=>{ saveProcurement(pr); setProcView("list"); showToast(`✓ Đã lưu phiếu "${pr.name}"`); }}
      onCancel={()=>setProcView("list")}
    />;
  if (subTab==="procure" && procView==="detail" && detailId) {
    const pr = procurements.find(p=>p.id===detailId);
    if (!pr) { setProcView("list"); return null; }
    return <ProcureDetail pr={pr} medicines={medicines} suppliers={suppliers}
      onEdit={updated=>{ saveProcurement(updated); showToast("✓ Đã cập nhật"); }}
      onBack={()=>setProcView("list")}
      onDelete={id=>setConfirmDelPro(id)}
    />;
  }

  const selSupplier  = suppliers.find(s=>s.id===selectedSup);
  const selSupMeds   = selectedSup ? medicines.filter(m=>m.supplier===selSupplier?.name) : [];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      {/* Sub-tab toggle */}
      <div className="flex items-center gap-2">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[["suppliers","🏭  Nhà cung cấp"],["procure","📋  Dự trù thuốc"]].map(([id,label])=>(
            <button key={id} onClick={()=>setSubTab(id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${subTab===id?"bg-white text-teal-600 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
        {subTab==="suppliers" && (
          <button onClick={()=>setSupModal({mode:"add",data:null})}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 shadow-lg shadow-teal-200">
            <Icon path={icons.plus} size={15}/>Thêm NCC
          </button>
        )}
        {subTab==="procure" && (
          <button onClick={()=>setProcView("create")}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 shadow-lg shadow-teal-200">
            <Icon path={icons.plus} size={15}/>Tạo phiếu dự trù
          </button>
        )}
      </div>

      {/* ══ SUPPLIERS SUB-TAB ══ */}
      {subTab==="suppliers" && (
        <div className="flex gap-5 flex-1 overflow-hidden">
          {/* Supplier cards */}
          <div className={`flex flex-col gap-2 overflow-y-auto pr-1 ${selectedSup?"w-80 flex-shrink-0":"flex-1"}`}>
            {suppliers.length===0 ? (
              <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400 py-16">
                <Icon path={icons.supplier} size={36}/>
                <div className="text-sm">Chưa có nhà cung cấp nào</div>
              </div>
            ) : suppliers.map((s,idx) => {
              const badgeCls = SUP_COLORS[idx%SUP_COLORS.length];
              const lightCls = SUP_LIGHT[idx%SUP_LIGHT.length];
              const medCount = medicines.filter(m=>m.supplier===s.name).length;
              const isSel    = selectedSup===s.id;
              return (
                <div key={s.id} onClick={()=>setSelectedSup(isSel?null:s.id)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${isSel?"border-teal-300 ring-2 ring-teal-200":"border-slate-100 hover:border-slate-200 hover:shadow-sm"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 ${badgeCls} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white font-bold text-xs">{(s.code||s.name).slice(0,3).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-800 text-sm truncate">{s.name}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lightCls} whitespace-nowrap`}>{medCount} thuốc</span>
                      </div>
                      {s.contact && <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Icon path={icons.user} size={11}/>{s.contact}</div>}
                      {s.phone   && <div className="text-xs text-slate-400 flex items-center gap-1"><Icon path={icons.phone} size={11}/>{s.phone}</div>}
                      {!selectedSup && s.address && <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5"><Icon path={icons.location} size={11}/>{s.address}</div>}
                      {isSel && s.email && <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">📧 {s.email}</div>}
                      {isSel && s.note  && <div className="text-xs text-slate-400 italic mt-1 border-t border-dashed border-slate-100 pt-1">"{s.note}"</div>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0" onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>setSupModal({mode:"edit",data:s})} className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors" title="Sửa"><Icon path={icons.edit} size={14}/></button>
                      <button onClick={()=>setConfirmDelSup(s)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" title="Xoá"><Icon path={icons.trash} size={14}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medicines panel */}
          {selectedSup && selSupplier && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2"><Icon path={icons.box} size={15}/>Thuốc từ {selSupplier.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selSupMeds.length} sản phẩm</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setMedModal({mode:"add",data:null})}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600 shadow-md shadow-teal-200">
                    <Icon path={icons.plus} size={13}/>Thêm thuốc
                  </button>
                  <button onClick={()=>setSelectedSup(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Icon path={icons.close} size={15}/></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {selSupMeds.length===0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-16">
                    <Icon path={icons.box} size={36}/>
                    <div className="text-sm">Chưa có thuốc nào từ NCC này</div>
                    <button onClick={()=>setMedModal({mode:"add",data:null})}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl text-xs font-semibold hover:bg-teal-100">
                      <Icon path={icons.plus} size={13}/>Thêm thuốc đầu tiên
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                      <tr>{["","Tên thuốc","Nhóm","Đơn vị","Giá bán","Giá nhập",""].map((h,i)=>(
                        <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selSupMeds.map(m=>(
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="pl-3 pr-2 py-2"><MedicineAvatar medicine={m} size="sm"/></td>
                          <td className="px-3 py-2"><div className="font-semibold text-slate-700 text-xs">{m.name}</div>{m.components&&<div className="text-[10px] text-slate-400 truncate max-w-[180px]">{m.components}</div>}</td>
                          <td className="px-3 py-2"><Badge color="blue">{m.group}</Badge></td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{m.unit}</span></td>
                          <td className="px-3 py-2 font-bold text-teal-600 text-xs whitespace-nowrap">{fmt(m.price)}<span className="text-[9px] font-normal text-slate-400">/{m.unit}</span></td>
                          <td className="px-3 py-2 text-xs">{m.importPrice?<span className="text-violet-600 font-semibold">{fmt(m.importPrice)}</span>:<span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1 justify-end">
                              <button onClick={()=>setMedModal({mode:"edit",data:m})} title="Chỉnh sửa" className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 border border-slate-100 transition-colors"><Icon path={icons.edit} size={13}/></button>
                              <button onClick={()=>{ addMedicine({...m,id:genId(),name:m.name+" (copy)"}); showToast(`✓ Đã sao chép "${m.name}"`); }} title="Sao chép" className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-500 border border-slate-100 transition-colors"><Icon path={icons.copy} size={13}/></button>
                              <button onClick={()=>setConfirmDelMed(m)} title="Xoá" className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 transition-colors"><Icon path={icons.trash} size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                <span><strong className="text-slate-700">{selSupMeds.length}</strong> sản phẩm</span>
                <span>Giá trị nhập: <strong className="text-violet-600">{fmt(selSupMeds.reduce((s,m)=>s+(m.importPrice||0),0))}</strong>/sp</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ PROCURE SUB-TAB ══ */}
      {subTab==="procure" && procView==="list" && (
        <>
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            {[
              {label:"Tổng phiếu",  value:procurements.length,                               color:"text-teal-600",   bg:"bg-teal-50"},
              {label:"Đang nháp",   value:procurements.filter(p=>p.status==="draft").length,  color:"text-slate-600",  bg:"bg-slate-100"},
              {label:"Đã gửi NCC",  value:procurements.filter(p=>p.status==="sent").length,   color:"text-sky-600",    bg:"bg-sky-50"},
              {label:"Tổng giá trị",value:fmt(procurements.reduce((s,p)=>s+totalProcVal(p),0)),color:"text-violet-600",bg:"bg-violet-50"},
            ].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3`}>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {procurements.length===0 ? (
              <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400 py-20">
                <Icon path={icons.procure} size={44}/>
                <div className="font-medium">Chưa có phiếu dự trù nào</div>
                <div className="text-xs">Nhấn "Tạo phiếu dự trù" để bắt đầu</div>
              </div>
            ) : procurements.slice().reverse().map(pr=>{
              const sup = suppliers.find(s=>s.name===pr.supplier);
              const st  = PROCURE_STATUS[pr.status]||PROCURE_STATUS.draft;
              return (
                <div key={pr.id} onClick={()=>{setDetailId(pr.id);setProcView("detail");}}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-md p-4 cursor-pointer transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 flex-shrink-0"><Icon path={icons.procure} size={18}/></div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{pr.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Icon path={icons.supplier} size={10}/>{pr.supplier||"Chưa chọn NCC"}</span>
                          <span>·</span><span>{pr.items.length} sản phẩm</span>
                          <span>·</span><span>{new Date(pr.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-slate-700 text-sm">{fmt(totalProcVal(pr))}</div>
                        <div className="text-[10px] text-slate-400">ước tính</div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${st.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{st.label}
                      </span>
                      <button onClick={e=>{e.stopPropagation();setConfirmDelPro(pr.id);}}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Icon path={icons.trash} size={14}/>
                      </button>
                    </div>
                  </div>
                  {pr.note&&<div className="mt-2 text-xs text-slate-400 italic truncate">"{pr.note}"</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {supModal&&<SupplierModal initial={supModal.mode==="edit"?supModal.data:null} onSave={handleSaveSup} onClose={()=>setSupModal(null)}/>}
      {confirmDelSup&&(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Icon path={icons.trash} size={22}/></div>
            <div className="font-bold text-slate-800 mb-1">Xoá nhà cung cấp?</div>
            <div className="text-sm text-slate-500 mb-5"><strong>"{confirmDelSup.name}"</strong> sẽ bị xoá. Thuốc liên kết vẫn được giữ lại.</div>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelSup(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={()=>handleDelSup(confirmDelSup)} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelPro&&(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Icon path={icons.trash} size={22}/></div>
            <div className="font-bold text-slate-800 mb-1">Xoá phiếu dự trù?</div>
            <div className="text-sm text-slate-500 mb-5">Thao tác này không thể hoàn tác.</div>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelPro(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={()=>{deleteProcurement(confirmDelPro);setConfirmDelPro(null);showToast("Đã xoá phiếu","rose");}} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
      {medModal && (
        <MedicineModal
          initial={medModal.mode==="edit" ? medModal.data : (selSupplier ? {...EMPTY_FORM, supplier: selSupplier.name} : null)}
          onSave={handleSaveMed}
          onClose={()=>setMedModal(null)}
        />
      )}
      {confirmDelMed && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4"><Icon path={icons.trash} size={22}/></div>
            <div className="font-bold text-slate-800 mb-1">Xoá thuốc này?</div>
            <div className="text-sm text-slate-500 mb-5">Sản phẩm <strong>"{confirmDelMed.name}"</strong> sẽ bị xoá khỏi kho.</div>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelMed(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Hủy</button>
              <button onClick={()=>{deleteMedicine(confirmDelMed.id);setConfirmDelMed(null);showToast(`Đã xoá "${confirmDelMed.name}"`,"rose");}} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast}/>
    </div>
  );
}

// ── PROCURE CREATE ─────────────────────────────────────────────────────────────
function ProcureCreate({ onSave, onCancel, medicines, suppliers }) {
  const [name, setName]     = useState("Phiếu dự trù "+new Date().toLocaleDateString("vi-VN"));
  const [supId, setSupId]   = useState(null);
  const [note, setNote]     = useState("");
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState("");
  const supplier   = suppliers.find(s=>s.id===supId);
  const supMeds    = supId ? medicines.filter(m=>m.supplier===supplier?.name) : [];
  const filtered   = supMeds.filter(m=>m.name.toLowerCase().includes(search.toLowerCase()));
  const inOrder    = id => items.find(i=>i.medId===id);
  const toggleItem = (med) => inOrder(med.id)?setItems(p=>p.filter(i=>i.medId!==med.id)):setItems(p=>[...p,{medId:med.id,name:med.name,unit:med.unit,importPrice:med.importPrice||0,qtyOrdered:1,note:""}]);
  const updateItem = (medId,k,v) => setItems(p=>p.map(i=>i.medId===medId?{...i,[k]:v}:i));
  const totalVal   = items.reduce((s,i)=>s+(i.qtyOrdered||0)*(i.importPrice||0),0);
  const canSave    = name.trim() && items.length>0;
  const inp3       = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
  return (
    <div className="flex gap-5 h-[calc(100vh-140px)]">
      <div className="flex flex-col gap-3 w-[400px] flex-shrink-0">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div className="font-semibold text-slate-700 text-sm flex items-center gap-2"><Icon path={icons.supplier} size={14}/>Chọn nhà cung cấp</div>
          <div className="grid grid-cols-2 gap-2">
            {suppliers.map((s,idx)=>(
              <button key={s.id} onClick={()=>{setSupId(s.id);setSearch("");setItems([]);}}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${supId===s.id?"border-teal-400 bg-teal-50":"border-slate-100 hover:border-slate-200"}`}>
                <div className={`w-8 h-8 ${SUP_COLORS[idx%SUP_COLORS.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-[10px] font-bold">{(s.code||s.name).slice(0,3).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{medicines.filter(m=>m.supplier===s.name).length} thuốc</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {supId && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
              <div className="font-semibold text-slate-700 text-xs mb-2">Thuốc của {supplier?.name} <span className="text-slate-400 font-normal">({supMeds.length})</span></div>
              <div className="relative"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon path={icons.search} size={13}/></span>
              <input className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" placeholder="Tìm..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filtered.length===0 ? <div className="text-center py-8 text-slate-400 text-xs">{supMeds.length===0?"NCC này chưa có thuốc nào":"Không tìm thấy"}</div>
              : filtered.map(med=>{
                const sel=!!inOrder(med.id);
                return (
                  <button key={med.id} onClick={()=>toggleItem(med)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${sel?"border-teal-300 bg-teal-50":"border-slate-100 hover:border-teal-200 hover:bg-slate-50"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${sel?"bg-teal-500 border-teal-500":"border-slate-300"}`}>{sel&&<Icon path={icons.check} size={9}/>}</div>
                    <MedicineAvatar medicine={med} size="sm"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 truncate">{med.name}</div>
                      <div className="text-[10px] text-slate-400">Tồn: {med.stock} · Giá nhập: {fmt(med.importPrice||0)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Tên phiếu *</label><input className={inp3} value={name} onChange={e=>setName(e.target.value)}/></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Ghi chú</label><input className={inp3} placeholder="Ghi chú..." value={note} onChange={e=>setNote(e.target.value)}/></div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="font-semibold text-slate-700 text-sm flex items-center gap-2"><Icon path={icons.cart} size={14}/>Danh sách dự trù{items.length>0&&<span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{items.length}</span>}</div>
            <div className="text-sm font-bold text-violet-600">{fmt(totalVal)}</div>
          </div>
          {items.length===0
            ?<div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400"><Icon path={icons.procure} size={32}/><div className="text-sm">Chọn thuốc từ danh sách bên trái</div></div>
            :<div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                  <tr>{["Thuốc","ĐV","Tồn","SL đặt","Giá nhập","Thành tiền","Ghi chú",""].map((h,i)=><th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map(item=>{
                    const med=medicines.find(m=>m.id===item.medId);
                    return (<tr key={item.medId} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-xs font-medium text-slate-700 max-w-[130px] truncate">{item.name}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{item.unit}</td>
                      <td className="px-3 py-2"><span className={`text-xs font-semibold ${(med?.stock||0)<50?"text-amber-600":"text-emerald-600"}`}>{med?.stock||0}</span></td>
                      <td className="px-3 py-2"><input type="number" min="1" value={item.qtyOrdered} onChange={e=>updateItem(item.medId,"qtyOrdered",Number(e.target.value)||1)} className="w-14 px-2 py-1 text-xs border border-teal-200 bg-teal-50 rounded-lg text-center font-bold text-teal-700 focus:outline-none"/></td>
                      <td className="px-3 py-2"><input type="number" min="0" value={item.importPrice} onChange={e=>updateItem(item.medId,"importPrice",Number(e.target.value)||0)} className="w-22 px-2 py-1 text-xs border border-violet-200 bg-violet-50 rounded-lg text-center font-bold text-violet-700 focus:outline-none"/></td>
                      <td className="px-3 py-2 text-xs font-bold text-slate-700 whitespace-nowrap">{fmt((item.qtyOrdered||0)*(item.importPrice||0))}</td>
                      <td className="px-3 py-2"><input value={item.note} onChange={e=>updateItem(item.medId,"note",e.target.value)} placeholder="..." className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none text-slate-600"/></td>
                      <td className="px-3 py-2"><button onClick={()=>toggleItem({id:item.medId})} className="p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400"><Icon path={icons.trash} size={12}/></button></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          }
          <div className="px-4 py-3 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50/50">
            <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
            <button disabled={!canSave} onClick={()=>onSave({id:genId(),name:name.trim(),supplier:supplier?.name||"",supplierId:supId,note,items,status:"draft",createdAt:new Date().toISOString()})}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border ${canSave?"border-slate-300 text-slate-600 hover:bg-slate-100":"opacity-40 cursor-not-allowed border-slate-200 text-slate-400"}`}>Lưu nháp</button>
            <button disabled={!canSave} onClick={()=>onSave({id:genId(),name:name.trim(),supplier:supplier?.name||"",supplierId:supId,note,items,status:"sent",createdAt:new Date().toISOString()})}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${canSave?"bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>Gửi NCC</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PROCURE DETAIL ─────────────────────────────────────────────────────────────
function ProcureDetail({ pr, medicines, suppliers, onEdit, onBack, onDelete }) {
  const [items, setItems]   = useState(pr.items.map(i=>({...i})));
  const [status, setStatus] = useState(pr.status);
  const [dirty, setDirty]   = useState(false);
  const supplier  = suppliers.find(s=>s.name===pr.supplier);
  const st        = PROCURE_STATUS[status]||PROCURE_STATUS.draft;
  const updateItem= (medId,k,v) => { setItems(p=>p.map(i=>i.medId===medId?{...i,[k]:v}:i)); setDirty(true); };
  const totalVal  = items.reduce((s,i)=>s+(i.qtyOrdered||0)*(i.importPrice||0),0);
  const totalRec  = items.reduce((s,i)=>s+(i.qtyReceived||0)*(i.importPrice||0),0);
  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><Icon path={icons.back} size={18}/></button>
        <div className="flex-1">
          <div className="font-bold text-slate-800 text-lg">{pr.name}</div>
          <div className="text-xs text-slate-400">{pr.supplier} · {new Date(pr.createdAt).toLocaleDateString("vi-VN")} · {pr.items.length} sản phẩm</div>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setDirty(true);}}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer ${st.color}`}>
          {Object.entries(PROCURE_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        {dirty&&<button onClick={()=>{onEdit({...pr,items,status});setDirty(false);}} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 shadow-md shadow-teal-200"><Icon path={icons.save} size={14}/>Lưu</button>}
        <button onClick={()=>onDelete(pr.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon path={icons.trash} size={15}/></button>
      </div>
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[{l:"Mặt hàng",v:pr.items.length,c:"text-teal-600",bg:"bg-teal-50"},{l:"Giá trị đặt",v:fmt(totalVal),c:"text-violet-600",bg:"bg-violet-50"},{l:"Đã nhận",v:fmt(totalRec),c:"text-emerald-600",bg:"bg-emerald-50"},{l:"Còn thiếu",v:fmt(Math.max(0,totalVal-totalRec)),c:"text-amber-600",bg:"bg-amber-50"}].map(s=>(
          <div key={s.l} className={`${s.bg} rounded-2xl px-4 py-3`}><div className={`text-base font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-slate-500">{s.l}</div></div>
        ))}
      </div>
      {supplier&&(
        <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-xs">{(supplier.code||supplier.name).slice(0,3).toUpperCase()}</span></div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-xs">
            <div><span className="text-slate-400">Liên hệ: </span><span className="text-slate-600">{supplier.contact||"—"}</span></div>
            <div><span className="text-slate-400">SĐT: </span><span className="text-slate-600">{supplier.phone||"—"}</span></div>
            <div><span className="text-slate-400">Email: </span><span className="text-slate-600 truncate">{supplier.email||"—"}</span></div>
          </div>
        </div>
      )}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>{["Thuốc","ĐV","Tồn kho","SL đặt","Giá nhập","Đặt (₫)","SL nhận","Nhận (₫)","Ghi chú"].map((h,i)=><th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(item=>{
                const med=medicines.find(m=>m.id===item.medId);
                const pct=item.qtyOrdered?Math.min(100,Math.round((item.qtyReceived||0)/item.qtyOrdered*100)):0;
                return (<tr key={item.medId} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5"><div className="text-xs font-medium text-slate-700">{item.name}</div>{item.note&&<div className="text-[10px] text-slate-400 italic">{item.note}</div>}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{item.unit}</td>
                  <td className="px-3 py-2.5"><span className={`text-xs font-semibold ${(med?.stock||0)<50?"text-amber-500":"text-emerald-600"}`}>{med?.stock||0}</span></td>
                  <td className="px-3 py-2.5"><input type="number" min="1" value={item.qtyOrdered} onChange={e=>updateItem(item.medId,"qtyOrdered",Number(e.target.value)||1)} className="w-14 px-2 py-1 text-xs border border-teal-200 bg-teal-50 rounded-lg text-center font-bold text-teal-700 focus:outline-none"/></td>
                  <td className="px-3 py-2.5"><input type="number" min="0" value={item.importPrice} onChange={e=>updateItem(item.medId,"importPrice",Number(e.target.value)||0)} className="w-22 px-2 py-1 text-xs border border-violet-200 bg-violet-50 rounded-lg text-center font-bold text-violet-700 focus:outline-none"/></td>
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-700 whitespace-nowrap">{fmt((item.qtyOrdered||0)*(item.importPrice||0))}</td>
                  <td className="px-3 py-2.5"><input type="number" min="0" max={item.qtyOrdered} value={item.qtyReceived||0} onChange={e=>updateItem(item.medId,"qtyReceived",Number(e.target.value)||0)} className="w-14 px-2 py-1 text-xs border border-emerald-200 bg-emerald-50 rounded-lg text-center font-bold text-emerald-700 focus:outline-none"/></td>
                  <td className="px-3 py-2.5"><div className="text-xs font-semibold text-emerald-600">{fmt((item.qtyReceived||0)*(item.importPrice||0))}</div><div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-emerald-400 rounded-full transition-all" style={{width:pct+"%"}}/></div></td>
                  <td className="px-3 py-2.5"><input value={item.note||""} onChange={e=>updateItem(item.medId,"note",e.target.value)} placeholder="..." className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none text-slate-600"/></td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        {pr.note&&<div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 italic">Ghi chú: {pr.note}</div>}
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "pos",       label: "POS Bán hàng",     icon: icons.pos },
  { id: "customers", label: "Khách hàng",       icon: icons.customer },
  { id: "price",     label: "So sánh giá",      icon: icons.price },
  { id: "inventory", label: "Quản lý kho",      icon: icons.inventory },
  { id: "suppliers", label: "NCC & Dự trù",     icon: icons.supplier },
  { id: "groups",    label: "Nhóm thuốc",       icon: icons.group },
];

export default function PharmacyApp() {
  const [tab, setTab]                   = useState("pos");
  const [medicines, setMedicines]       = useState(SEED_MEDICINES);
  const [customers, setCustomers]       = useState(SEED_CUSTOMERS);
  const [prescriptions, setPrescriptions] = useState(DEFAULT_PRESCRIPTIONS);
  const [suppliers, setSuppliers]       = useState(SEED_SUPPLIERS_DATA);
  const [procurements, setProcurements] = useState([]);
  const addSupplier     = useCallback((s) => setSuppliers(p=>[...p,s]),[]);
  const updateSupplier  = useCallback((s) => setSuppliers(p=>p.map(x=>x.id===s.id?s:x)),[]);
  const deleteSupplier  = useCallback((id)=> setSuppliers(p=>p.filter(x=>x.id!==id)),[]);
  const saveProcurement = useCallback((p) => setProcurements(prev=>prev.find(x=>x.id===p.id)?prev.map(x=>x.id===p.id?p:x):[...prev,p]),[]);
  const deleteProcurement=useCallback((id)=> setProcurements(p=>p.filter(x=>x.id!==id)),[]);

  const addMedicine    = useCallback((m) => setMedicines((p) => [...p, m]), []);
  const updateMedicine = useCallback((m) => setMedicines((p) => p.map((x) => x.id === m.id ? m : x)), []);
  const deleteMedicine = useCallback((id) => setMedicines((p) => p.filter((x) => x.id !== id)), []);
  const addSaleToCustomer = useCallback((cid, sale) => setCustomers((p) => p.map((c) => c.id === cid ? { ...c, history: [...c.history, sale] } : c)), []);
  const savePrescription  = useCallback((pres) => setPrescriptions((p) => p.find(x => x.id === pres.id) ? p.map(x => x.id === pres.id ? pres : x) : [...p, pres]), []);
  const deletePrescription = useCallback((id) => setPrescriptions((p) => p.filter(x => x.id !== id)), []);
  const copyPrescription  = useCallback((pres) => setPrescriptions((p) => [...p, { ...pres, id: Date.now(), name: pres.name + " (copy)" }]), []);

  return (
    <AppContext.Provider value={{ medicines, addMedicine, updateMedicine, deleteMedicine, customers, setCustomers, addSaleToCustomer, prescriptions, savePrescription, deletePrescription, copyPrescription, suppliers, addSupplier, updateSupplier, deleteSupplier, procurements, saveProcurement, deleteProcurement }}>
      <div className="min-h-screen bg-slate-50 font-sans">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM12 3v8M8 7h8"/><path d="M3 18a9 9 0 0 0 18 0H3z" opacity="0.6"/></svg>
            </div>
            <div>
              <div className="font-bold text-slate-800 leading-none tracking-tight">NHÀ THUỐC VĂN MINH</div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">Nhà thuốc uy tín</div>
            </div>
          </div>
          <nav className="flex gap-1 ml-6">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}>
                <Icon path={t.icon} size={15}/>{t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-xs">Đang hoạt động</span>
            </div>
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </header>
        <main className="px-6 py-5">
          {tab === "pos"       && <PosTab/>}
          {tab === "inventory" && <InventoryTab/>}
          {tab === "groups"    && <GroupsTab/>}
          {tab === "suppliers" && <SuppliersProcureTab/>}
          {tab === "customers" && <CustomersTab/>}
          {tab === "price"     && <PriceTab/>}
        </main>
      </div>
    </AppContext.Provider>
  );
}
