const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id),
  rp = (n) => "Rp " + n.toLocaleString("id-ID"),
  cl = (v) => Math.min(1, Math.max(0, v)),
  WA = "https://wa.me/6285872189172";

/* ===== TOGGLE TEMA (DARK / LIGHT MODE) ===== */
const themeToggleBtn = $("theme-toggle"),
  themeIcon = $("theme-icon");
const ICON_SUN =
  '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>';
const ICON_MOON = '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>';

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeIcon && themeToggleBtn) {
    const toLight = theme !== "light"; // aksi berikutnya
    themeIcon.innerHTML = toLight ? ICON_SUN : ICON_MOON;
    const label = toLight ? "Aktifkan mode terang" : "Aktifkan mode gelap";
    themeToggleBtn.setAttribute("aria-label", label);
    themeToggleBtn.title = label;
  }
}

// Deteksi simpanan pengguna atau sistem bawaan
const savedTheme = localStorage.getItem("theme");
const prefersLight = matchMedia("(prefers-color-scheme: light)").matches;
const defaultTheme = savedTheme || (prefersLight ? "light" : "dark");
applyTheme(defaultTheme);

if (themeToggleBtn) {
  themeToggleBtn.onclick = () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || defaultTheme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };
}

/* ===== PRODUK (data contoh; ganti dengan data toko asli) ===== */
const D = [
  ["Lampu LED 5 watt", "rumah", 12000, "lamp", 5, "Lampu"],
  ["Lampu LED 10 watt", "rumah", 18000, "lamp", 10, "Lampu"],
  ["Lampu LED 18 watt", "rumah", 32000, "lamp", 18, "Lampu"],
  [
    "Kipas angin berdiri 16 inci",
    "rumah",
    285000,
    "fan",
    16,
    "Kipas angin",
  ],
  [
    "Kipas angin dinding 12 inci",
    "rumah",
    165000,
    "fan",
    12,
    "Kipas angin",
  ],
  ["Kipas angin meja 10 inci", "rumah", 120000, "fan", 10, "Kipas angin"],
  [
    "Setrika listrik 350 watt",
    "rumah",
    85000,
    "qty",
    350,
    "Perlengkapan rumah",
  ],
  [
    "Teko listrik 1,8 liter",
    "rumah",
    120000,
    "qty",
    18,
    "Perlengkapan rumah",
  ],
  ["Kabel NYM 2x1,5 mm, per meter", "listrik", 9500, "cable", 2, "Kabel"],
  [
    "Kabel NYM 3x1,5 mm, per meter",
    "listrik",
    13500,
    "cable",
    3,
    "Kabel",
  ],
  [
    "Kabel serabut 1x1,5 mm, per meter",
    "listrik",
    4500,
    "cable",
    1,
    "Kabel",
  ],
  ["Saklar tunggal", "listrik", 15000, "switch", 1, "Saklar"],
  ["MCB 6 ampere", "listrik", 38000, "switch", 6, "Pengaman"],
  ["Stopkontak 3 lubang", "listrik", 22000, "qty", 3, "Stopkontak"],
  ["Terminal kabel 4 lubang", "listrik", 55000, "qty", 4, "Stopkontak"],
  [
    "Bor listrik 10 mm",
    "tukang",
    285000,
    "drill",
    10,
    "Perkakas listrik",
  ],
  [
    "Gerinda tangan 4 inci",
    "tukang",
    320000,
    "drill",
    4,
    "Perkakas listrik",
  ],
  [
    "Meteran gulung 5 meter",
    "tukang",
    22000,
    "tape",
    5,
    "Perkakas tangan",
  ],
  ["Obeng set 6 pcs", "tukang", 45000, "qty", 6, "Perkakas tangan"],
  ["Tang kombinasi 8 inci", "tukang", 48000, "qty", 8, "Perkakas tangan"],
  ["Palu kambing", "tukang", 55000, "qty", 1, "Perkakas tangan"],
  ["Waterpass 60 cm", "tukang", 65000, "qty", 60, "Perkakas tangan"],
];
const ICON = {
  lamp: "M14 28h12M16 33h8M20 5a10 10 0 0 0-5 18.5V28h10v-4.5A10 10 0 0 0 20 5z",
  cable: "M4 24c8-14 14 14 22 0s8-6 10-6",
  fan: "M20 20m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M20 17c0-8-3-11-7-9s-1 8 7 9zM23 20c8 0 11-3 9-7s-8-1-9 7zM20 23c0 8 3 11 7 9s1-8-7-9zM17 20c-8 0-11 3-9 7s8 1 9-7z",
  drill: "M6 12h20v9H6zM26 15h9M11 21v13h7V21",
  tape: "M20 20m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0M20 20m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M32 20h6",
  switch: "M11 6h18v28H11zM20 12v8",
  qty: "M7 13l13-7 13 7v15l-13 7-13-7zM7 13l13 7 13-7M20 20v15",
};
const PER = 6;
let cat = "all",
  qs = "",
  page = 1;
function render() {
  const L = D.map((d, i) => [d, i]).filter(
      ([d]) =>
        (cat === "all" || d[1] === cat) &&
        d[0].toLowerCase().includes(qs),
    ),
    n = L.length,
    pages = Math.max(1, Math.ceil(n / PER));
  page = Math.min(page, pages);
  const s = (page - 1) * PER,
    part = L.slice(s, s + PER);
  $("grid").innerHTML = part.length
    ? part
        .map(
          ([d, i]) =>
            `<article class="card"><div class="ph"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="${ICON[d[3]]}"/></svg></div><small class="sub">${d[5]}</small><h3>${d[0]}</h3><div class="price">${rp(d[2])}</div><button class="btn" data-i="${i}">Lihat detail dan live view</button></article>`,
        )
        .join("")
    : "<p>Produk tidak ditemukan. Coba kata kunci lain atau tanya lewat chat.</p>";
  $("cnt").textContent = n
    ? `Menampilkan ${s + 1} sampai ${s + part.length} dari ${n} produk`
    : "Menampilkan 0 dari 0 produk";
  let h = `<button data-p="${page - 1}" ${page < 2 ? "disabled" : ""}>Sebelumnya</button>`;
  for (let p = 1; p <= pages; p++)
    h += `<button data-p="${p}" ${p === page ? 'aria-current="page"' : ""}>${p}</button>`;
  h += `<button data-p="${page + 1}" ${page >= pages ? "disabled" : ""}>Berikutnya</button>`;
  $("pg").innerHTML = pages > 1 ? h : "";
}
document.querySelectorAll(".chips button").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".chips button")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      cat = b.dataset.f;
      page = 1;
      render();
    }),
);
document
  .querySelectorAll(".cat")
  .forEach(
    (a) =>
      (a.onclick = () =>
        document
          .querySelector('.chips button[data-f="' + a.dataset.g + '"]')
          .click()),
  );
$("qs").oninput = (e) => {
  qs = e.target.value.trim().toLowerCase();
  page = 1;
  render();
};
$("pg").onclick = (e) => {
  const b = e.target.closest("[data-p]");
  if (!b || b.disabled) return;
  page = +b.dataset.p;
  render();
  $("produk").scrollIntoView({ block: "start" });
};
$("grid").onclick = (e) => {
  const b = e.target.closest("[data-i]");
  if (b) openDetail(+b.dataset.i);
};
render();
/* ===== DETAIL + LIVE VIEW ===== */
const dlg = $("dlg"),
  KT = [
    ["Hangat 3000K", "#ffb46b"],
    ["Netral 4000K", "#ffe1b8"],
    ["Putih 6500K", "#d9e8ff"],
  ];
const svgW = (inner, l) =>
  `<svg viewBox="0 0 320 260" role="img" aria-label="${l}"><rect width="320" height="260" fill="#14110f"/>${inner}</svg>`;
function lvLamp(w, k) {
  const c = KT[k][1],
    r = 36 + w * 3.4,
    o = Math.min(0.8, 0.16 + w / 32);
  return svgW(
    `<defs><linearGradient id="cn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="${o * 0.22}"/></linearGradient><radialGradient id="fl"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><rect y="214" width="320" height="46" fill="#1d1915"/><path d="M160 0V50" stroke="#0b0a09" stroke-width="3"/><path d="M160 80L${160 - r} 214H${160 + r}Z" fill="url(#cn)"/><ellipse cx="160" cy="214" rx="${r}" ry="${r / 6}" fill="url(#fl)"/><rect x="152" y="46" width="16" height="16" rx="2" fill="#a98853"/><circle cx="160" cy="76" r="17" fill="${c}" fill-opacity=".92"/><circle cx="160" cy="76" r="17" fill="none" stroke="rgba(255,255,255,.35)"/>`,
    `Simulasi cahaya lampu ${w} watt ${KT[k][0]}`,
  );
}
function lvCable(d, m) {
  const n = d[4],
    jc = n === 1 ? "#b8392a" : "#cfcac0",
    R = n === 1 ? 30 : 56;
  let c = "";
  if (n === 1)
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI) / 3;
      c += `<circle cx="${160 + (i ? 11 * Math.cos(a) : 0)}" cy="${88 + (i ? 11 * Math.sin(a) : 0)}" r="6" fill="#c9722f" stroke="#7a4518"/>`;
    }
  else
    (n === 2
      ? [
          [138, 90],
          [182, 90],
        ]
      : [
          [160, 64],
          [182.5, 103],
          [137.5, 103],
        ]
    ).forEach(
      (p, i) =>
        (c += `<circle cx="${p[0]}" cy="${p[1]}" r="19" fill="${["#3b78c4", "#7a4a2b", "#222"][i]}"/><circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#c9722f" stroke="#7a4518"/>`),
    );
  return svgW(
    `<circle cx="160" cy="90" r="${R}" fill="${jc}"/>${c}<rect x="20" y="196" width="280" height="10" rx="5" fill="#2a2622"/><rect x="20" y="196" width="${(280 * m) / 50}" height="10" rx="5" fill="#f2b45a"/><text x="160" y="234" text-anchor="middle" fill="#f1ece4" font-size="16">${m} meter</text>`,
    `Penampang kabel dan panjang ${m} meter`,
  );
}
function lvFan(s) {
  const dur = [0, 1.6, 0.9, 0.5][s];
  let b = "";
  [0, 90, 180, 270].forEach(
    (a) =>
      (b += `<ellipse cx="160" cy="76" rx="20" ry="42" transform="rotate(${a} 160 118)" fill="#2b2622" stroke="#6a6258"/>`),
  );
  return svgW(
    `<circle cx="160" cy="118" r="94" fill="none" stroke="#5a5248" stroke-width="2"/><g style="transform-box:fill-box;transform-origin:center;${reduce ? "" : "animation:spinf " + dur + "s linear infinite"}">${b}</g><circle cx="160" cy="118" r="13" fill="#a98853"/><path d="M160 212v28M120 244h80" stroke="#5a5248" stroke-width="5" stroke-linecap="round"/>${[1, 2, 3].map((i) => `<path d="M268 ${100 + i * 14}q22-8 44 0" stroke="#f1ece4" stroke-width="2" fill="none" opacity="${s >= i ? 0.5 : 0.08}"/>`).join("")}`,
    `Kipas berputar kecepatan ${s}`,
  );
}
function lvDrill(s) {
  const dur = [0, 1.4, 0.45][s];
  let k = "";
  for (let a = 0; a < 360; a += 10)
    k += `<path d="M160 52v10" stroke="#6a6258" stroke-width="3" transform="rotate(${a} 160 120)"/>`;
  return svgW(
    `<g style="transform-box:fill-box;transform-origin:center;${reduce ? "" : "animation:spinf " + dur + "s linear infinite"}"><circle cx="160" cy="120" r="68" fill="#2b2622" stroke="#8a8378" stroke-width="3"/>${k}<circle cx="160" cy="120" r="44" fill="#14110f" stroke="#5a5248"/>${[0, 120, 240].map((a) => `<path d="M152 84H168L162 112H158Z" fill="#8f897f" transform="rotate(${a} 160 120)"/>`).join("")}<circle cx="160" cy="120" r="9" fill="#c8c2b6"/><path d="M154 116l12 8M154 124l12-8" stroke="#6a6258"/></g>`,
    "Kepala bor berputar",
  );
}
function lvTape(cm, max) {
  let t = "";
  for (let c = 0; c <= cm; c += 10)
    t += `<path d="M${30 + (260 * c) / max} 104v${c % 50 ? 10 : 18}" stroke="#14110f" stroke-width="1.5"/>`;
  return svgW(
    `<rect x="20" y="40" width="84" height="64" rx="10" fill="#d6a53a"/><circle cx="62" cy="72" r="14" fill="#14110f" opacity=".4"/><rect x="30" y="104" width="${Math.max((260 * cm) / max, 4)}" height="34" fill="#f1ece4"/>${t}<text x="160" y="214" text-anchor="middle" fill="#f1ece4" font-size="22">${cm} cm</text>`,
    "Meteran ditarik " + cm + " sentimeter",
  );
}
function lvSwitch(on) {
  return svgW(
    `<defs><radialGradient id="sg"><stop offset="0" stop-color="#ffd48a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient></defs>${on ? '<circle cx="160" cy="62" r="80" fill="url(#sg)"/>' : ""}<path d="M160 0v44" stroke="#0b0a09" stroke-width="3"/><circle cx="160" cy="62" r="18" fill="${on ? "#ffe9b8" : "#3a3632"}" stroke="rgba(255,255,255,.3)"/><rect x="118" y="130" width="84" height="104" rx="8" fill="#e6e1d6"/><rect x="136" y="148" width="48" height="68" rx="5" fill="#cfc9bc" stroke="#8a8378"/><rect x="142" y="${on ? 152 : 182}" width="36" height="30" rx="4" fill="#f5f1e8" stroke="#9a9488"/>`,
    on ? "Sakelar menyala" : "Sakelar mati",
  );
}
function lvQty(d, q) {
  let c = "";
  for (let i = 0; i < q; i++)
    c += `<rect x="${24 + (i % 10) * 28}" y="${50 + Math.floor(i / 10) * 34}" width="22" height="26" rx="4" fill="#2b2622" stroke="#a98853"/>`;
  return svgW(
    `${c}<text x="160" y="170" text-anchor="middle" fill="#f1ece4" font-size="40">${q}x</text><text x="160" y="208" text-anchor="middle" fill="#a39b8f" font-size="15">${d[0]}</text>`,
    q + " unit " + d[0],
  );
}
function openDetail(i) {
  const d = D[i],
    t = d[3],
    LBL = {
      lamp: "Warna cahaya",
      fan: "Kecepatan",
      drill: "Mode putaran",
      switch: "Aliran listrik",
    },
    RG = {
      cable: ["m", "Panjang", "meter", 1, 50, 5],
      tape: [
        "cm",
        "Tarik pita",
        "cm",
        0,
        d[4] * 100,
        Math.round(d[4] * 30),
      ],
      qty: ["q", "Jumlah", "unit", 1, 20, 1],
    },
    BT = {
      lamp: ["k", KT.map((x) => x[0])],
      fan: ["s", ["Kecepatan 1", "Kecepatan 2", "Kecepatan 3"]],
      drill: ["s", ["Putaran rendah", "Putaran tinggi"]],
      switch: ["o", ["Nyala", "Mati"]],
    },
    v = (j) => (t === "switch" ? (j ? 0 : 1) : t === "lamp" ? j : j + 1),
    st = { k: 1, m: 5, cm: Math.round(d[4] * 30), q: 1, s: 2, o: 1 };
  dlg.innerHTML = `<form method="dialog"><button class="x">Tutup</button></form><div class="dg"><div class="lv"><span class="live">Live view</span><div id="lvs"></div><p class="lvn" id="lvn"></p></div><div class="dd"><small class="sub">${d[5]}</small><h2 id="dt">${d[0]}</h2><div class="price" id="dp"></div><div id="ctl"></div><p class="stk">Stok: cek langsung lewat WhatsApp.</p><div class="row"><a class="btn" id="dwa" href="#">Pesan lewat WhatsApp</a><button class="btn o" id="dchat" type="button">Tanya AI</button></div></div></div>`;
  const ctl = $("ctl");
  if (BT[t]) {
    const [key, L] = BT[t];
    ctl.innerHTML =
      '<p class="lbl">' +
      LBL[t] +
      '</p><div class="chips">' +
      L.map(
        (x, j) =>
          `<button data-j="${j}" aria-pressed="${st[key] === v(j)}">${x}</button>`,
      ).join("") +
      "</div>";
  }
  if (RG[t]) {
    const [key, l, u, mn, mx, df] = RG[t];
    st[key] = df;
    ctl.innerHTML = `<label class="lbl" for="rg1">${l}: <b id="rv">${df}</b> ${u}</label><input id="rg1" type="range" min="${mn}" max="${mx}" value="${df}">`;
  }
  const upd = () => {
    let ex = "",
      note = "",
      svg = "",
      price = d[2];
    if (t === "lamp") {
      svg = lvLamp(d[4], st.k);
      note =
        "Perkiraan terang sekitar " +
        Math.round(d[4] * 90) +
        " lumen. Ilustrasi, bukan foto produk.";
      ex = " warna " + KT[st.k][0];
    } else if (t === "cable") {
      svg = lvCable(d, st.m);
      price = d[2] * st.m;
      note =
        "Penampang dan meteran ilustrasi. Harga dihitung sesuai panjang.";
      ex = ", " + st.m + " meter";
    } else if (t === "fan") {
      svg = lvFan(st.s);
      note =
        "Putaran ilustrasi. Pilih kecepatan untuk melihat perbedaannya.";
      ex = ", kecepatan " + st.s;
    } else if (t === "drill") {
      svg = lvDrill(st.s);
      note = "Putaran ilustrasi, bukan angka putaran sebenarnya.";
      ex = st.s === 2 ? ", putaran tinggi" : ", putaran rendah";
    } else if (t === "tape") {
      svg = lvTape(st.cm, d[4] * 100);
      note = "Pita ilustrasi. Geser untuk melihat panjang yang ditarik.";
    } else if (t === "switch") {
      svg = lvSwitch(st.o);
      note = "Simulasi sakelar, bukan foto produk.";
    } else {
      svg = lvQty(d, st.q);
      price = d[2] * st.q;
      note = "Jumlah dan total harga dihitung langsung.";
      ex = ", " + st.q + " unit";
    }
    $("lvs").innerHTML = svg;
    $("dp").textContent = rp(price);
    $("lvn").textContent = note;
    $("dwa").href =
      WA +
      "?text=" +
      encodeURIComponent("Halo, saya mau pesan " + d[0] + ex);
  };
  ctl.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b || !BT[t]) return;
    ctl
      .querySelectorAll("button")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
    st[BT[t][0]] = v(+b.dataset.j);
    upd();
  };
  const r = $("rg1");
  if (r)
    r.oninput = () => {
      st[RG[t][0]] = +r.value;
      $("rv").textContent = r.value;
      upd();
    };
  $("dchat").onclick = () => {
    dlg.close();
    openChat("Saya mau tanya tentang " + d[0]);
  };
  upd();
  dlg.showModal();
}
dlg.addEventListener("click", (e) => {
  if (e.target === dlg) dlg.close();
});
/* ===== SOSIAL MEDIA ===== */
/* GANTI dengan link toko Shopee Sadewa Elektronik yang asli */
const SHOPEE_URL = "https://shopee.co.id/";
const SOSMED = [
  {
    n: "Instagram",
    h: "@sadewaelektronik",
    u: "https://www.instagram.com/sadewaelektronik/",
    d: "Produk terbaru dan promo.",
    i: '<rect x="5" y="5" width="30" height="30" rx="9"/><circle cx="20" cy="20" r="7"/><circle cx="29" cy="11" r=".8"/>',
  },
  {
    n: "WhatsApp",
    h: "+62 858-7218-9172",
    u: WA,
    d: "Tanya stok dan pesan langsung.",
    i: '<path d="M6 34l2.5-8A14 14 0 1 1 14 31.5z"/><path d="M14 15c0 6 5 11 11 11l2-2.5-3.5-1.8-1.5 1.5c-2-1-3.5-2.5-4.5-4.5l1.5-1.5-1.8-3.5z"/>',
  },
  {
    n: "Shopee",
    h: "Sadewa Elektronik",
    u: SHOPEE_URL,
    d: "Belanja online, cek ulasan dan promo toko.",
    i: '<path d="M8 13h24l-2 22H10z"/><path d="M14 17v-3a6 6 0 0 1 12 0v3"/><path d="M23 21.5c-1-1-4.5-1.2-4.5 1.2 0 2.8 5 1.6 5 4.2 0 2.4-3.8 2.3-5.3.8"/>',
  },
];
$("soc").innerHTML = SOSMED.filter((x) => x.u)
  .map(
    (x) =>
      `<a href="${x.u}" target="_blank" rel="noopener"><svg viewBox="0 0 40 40" aria-hidden="true">${x.i}</svg><span><b>${x.n}</b><small>${x.h}. ${x.d}</small></span><span class="go" aria-hidden="true">&rarr;</span></a>`,
  )
  .join("");
{
  const as = [...document.querySelectorAll(".soc a")];
  if (reduce || !("IntersectionObserver" in window))
    as.forEach((a) => a.classList.add("on"));
  else {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.7 },
    );
    as.forEach((a, i) => {
      a.querySelector("a");
      a.style.setProperty("--d", i * 0.2 + "s");
      io.observe(a);
    });
  }
}
/* ===== AI CHAT ===== */
const chat = $("chat"),
  cm = $("cm");
async function askBot(t) {
  const s = t.toLowerCase(),
    has = (r) => r.test(s);
  if (has(/produk apa|sedia|jual|kategori/))
    return "Kami menyediakan peralatan rumah tangga (kipas, lampu, dan lainnya), peralatan listrik, dan peralatan pertukangan. Cari produknya di daftar produk pada halaman ini.";
  if (has(/sosial|instagram|shopee|follow|ikuti/))
    return "Ikuti kami di Instagram @sadewaelektronik untuk produk terbaru dan promo. Kami juga ada di Shopee kalau kamu mau belanja online.";
  if (has(/halo|hai|selamat/))
    return "Halo, selamat datang di Sadewa Elektronik. Mau cari lampu, kabel, atau kipas angin?";
  if (has(/pesanan|order|invoice/))
    return "Untuk cek pesanan, kirim nomor invoice atau nama pemesan lewat WhatsApp +62 858-7218-9172. Admin akan cek statusnya.";
  if (has(/promo|diskon/))
    return "Promo terbaru kami umumkan di Instagram @sadewaelektronik dan WhatsApp. Stok promo terbatas.";
  if (has(/pengiriman|kirim|ongkir|antar|kurir/))
    return "Kami mengirim lewat JNE, J&T, Pos Indonesia, dan AnterAja. Ongkir dihitung saat checkout setelah alamat diisi.";
  if (has(/garansi/))
    return "Garansi berbeda untuk tiap produk. Sebutkan produknya, admin akan konfirmasi lewat WhatsApp.";
  if (has(/bayar|qris|transfer/))
    return "Pembayaran lewat transfer BRI atau QRIS. Setelah membayar, unggah bukti transfer.";
  if (has(/buka|jam|alamat|lokasi/))
    return "Kami buka setiap hari 08.00 sampai 20.00 di Cidahu, Sukabumi.";
  const w = s.split(/\s+/).filter((x) => x.length > 3),
    hit = D.filter((d) =>
      w.some((x) => d[0].toLowerCase().includes(x)),
    ).slice(0, 3);
  if (hit.length)
    return (
      "Beberapa pilihan: " +
      hit.map((d) => d[0] + " (" + rp(d[2]) + ")").join(", ") +
      ". Kamu bisa buka detailnya di daftar produk."
    );
  return "Saya belum menemukan jawabannya. Coba tanya lewat WhatsApp supaya admin bisa membantu langsung.";
}
function msg(t, w) {
  const e = document.createElement("div");
  e.className = "b " + w;
  e.textContent = t;
  cm.appendChild(e);
  cm.scrollTop = cm.scrollHeight;
  return e;
}
async function send(t) {
  t = t.trim();
  if (!t) return;
  msg(t, "u");
  const tp = msg("Mengetik...", "a");
  const a = await askBot(t);
  setTimeout(
    () => {
      tp.textContent = a;
      cm.scrollTop = cm.scrollHeight;
    },
    reduce ? 0 : 450,
  );
}
function openChat(t) {
  chat.hidden = false;
  $("cf").hidden = true;
  if (!cm.children.length)
    msg(
      "Halo, saya asisten Sadewa Elektronik. Ada yang bisa dibantu?",
      "a",
    );
  if (t) send(t);
  else $("ci").focus();
}
$("cf").onclick = () => openChat();
$("cx").onclick = () => {
  chat.hidden = true;
  $("cf").hidden = false;
  $("cf").focus();
};
$("cq").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) send(b.textContent);
};
$("cf2").onsubmit = (e) => {
  e.preventDefault();
  const v = $("ci").value;
  $("ci").value = "";
  send(v);
};
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !chat.hidden) $("cx").click();
});
/* ===== HERO: dinding, lampu HD, kabel HD ===== */
const st = $("stage"),
  halo = $("halo"),
  ww = $("ww"),
  wm = $("warm");
let bf, fil, fg, bl;
function wall() {
  const c = $("wall"),
    dp = Math.min(devicePixelRatio || 1, 1.5),
    W = ww.clientWidth,
    H = ww.clientHeight;
  c.width = W * dp;
  c.height = H * dp;
  const x = c.getContext("2d");
  x.scale(dp, dp);
  let a = 7;
  const R = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  x.fillStyle = "#262120";
  x.fillRect(0, 0, W, H);
  const bw = W < 700 ? 86 : 130,
    bh = W < 700 ? 31 : 45,
    g = W < 700 ? 4 : 5;
  for (let r = 0, y = -bh / 2; y < H; r++, y += bh + g) {
    for (let X = r % 2 ? -bw / 2 : 0; X < W; X += bw + g) {
      const k = R(),
        hu = 8 + R() * 14,
        sa = (k < 0.12 ? 14 : 34) + R() * 16,
        li = (k < 0.12 ? 20 : 25) + R() * 13,
        w = bw + R() * 4 - 2,
        h = bh + R() * 2 - 1;
      x.fillStyle = "hsl(" + hu + "," + sa + "%," + li + "%)";
      x.fillRect(X, y, w, h);
      const gr = x.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, "rgba(255,225,200,.13)");
      gr.addColorStop(0.3, "rgba(255,225,200,0)");
      gr.addColorStop(0.75, "rgba(0,0,0,0)");
      gr.addColorStop(1, "rgba(0,0,0,.3)");
      x.fillStyle = gr;
      x.fillRect(X, y, w, h);
      for (let i = 0; i < 22; i++) {
        x.fillStyle =
          R() < 0.6 ? "rgba(0,0,0,.2)" : "rgba(255,205,170,.09)";
        x.fillRect(
          X + R() * w,
          y + R() * h,
          1 + R() * 1.6,
          1 + R() * 1.2,
        );
      }
      if (R() < 0.07) {
        x.fillStyle = "#262120";
        x.beginPath();
        const cx = X + (R() < 0.5 ? 0 : w),
          cy = y + (R() < 0.5 ? 0 : h);
        x.moveTo(cx, cy);
        x.lineTo(cx + (cx > X ? -1 : 1) * (4 + R() * 7), cy);
        x.lineTo(cx, cy + (cy > y ? -1 : 1) * (4 + R() * 7));
        x.fill();
      }
    }
  }
  for (let i = 0; i < 5; i++) {
    const sx = R() * W,
      sw = 30 + R() * 70,
      len = H * (0.4 + R() * 0.5),
      pk = 0.18 + R() * 0.1;
    for (let j = 0; j < sw; j += 3) {
      const al = pk * Math.sin((Math.PI * j) / sw),
        gv = x.createLinearGradient(0, 0, 0, len);
      gv.addColorStop(0, "rgba(0,0,0," + al + ")");
      gv.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = gv;
      x.fillRect(sx + j, 0, 3, len);
    }
  }
}

function buildLamp() {
  let h = "";
  h +=
    '<path d="M172 350h16l4 22h-24z" fill="url(#blk)"/><rect x="166" y="372" width="28" height="8" rx="2" fill="url(#brs)"/><rect x="158" y="380" width="44" height="40" rx="3" fill="url(#brs)"/>';
  for (let x = 160; x < 201; x += 2.2)
    h += `<path d="M${x} 396V408" stroke="rgba(0,0,0,.4)" stroke-width=".8"/><path d="M${x + 1.1} 396V408" stroke="rgba(255,235,190,.22)" stroke-width=".7"/>`;
  h +=
    '<path d="M158 396h44M158 408h44" stroke="rgba(0,0,0,.45)"/><path d="M158 397h44M158 409h44" stroke="rgba(255,235,190,.25)"/><circle cx="180" cy="388" r="2.4" fill="#2a2016"/><circle cx="180" cy="387.6" r="1.1" fill="rgba(255,235,190,.4)"/><rect id="bl" x="158" y="380" width="44" height="40" rx="3" fill="url(#wr)" opacity="0"/><rect x="163" y="420" width="34" height="27" fill="url(#nik)"/>';
  for (let k = 0; k < 6; k++) {
    const y = 423 + k * 4;
    h += `<path d="M163 ${y + 2.4}L197 ${y - 2.4}" stroke="rgba(0,0,0,.42)"/><path d="M163 ${y + 3.5}L197 ${y - 1.3}" stroke="rgba(255,255,255,.35)" stroke-width=".7"/>`;
  }
  h +=
    '<rect x="165" y="447" width="30" height="6" rx="1.5" fill="#141110"/><path d="M165 448h30" stroke="rgba(255,255,255,.18)"/>';
  const G =
    "M168 453C158 463 128 479 122 513C116 549 144 577 180 577C216 577 244 549 238 513C232 479 202 463 192 453Z";
  h += `<clipPath id="gc"><path d="${G}"/></clipPath><path d="${G}" fill="url(#gl0)"/>`;
  h +=
    '<path d="M175 453V484Q180 492 185 484V453" fill="rgba(210,225,230,.1)" stroke="rgba(255,255,255,.22)" stroke-width=".8"/><ellipse cx="180" cy="485" rx="7" ry="2.2" fill="rgba(220,235,240,.25)"/><path d="M177 486L171 502M183 486L189 502M171 502V506M189 502V506" stroke="#7b7873" stroke-width=".8" fill="none"/>';
  const P = [];
  for (let y = 506; y <= 532; y += 0.6) P.push([171, y]);
  for (let a = 0; a <= Math.PI; a += 0.05)
    P.push([180 - 9 * Math.cos(a), 532 + 9 * Math.sin(a)]);
  for (let y = 532; y >= 506; y -= 0.6) P.push([189, y]);
  let d = "";
  P.forEach((p, i) => {
    const q = P[Math.min(i + 1, P.length - 1)],
      o = P[Math.max(i - 1, 0)],
      dx = q[0] - o[0],
      dy = q[1] - o[1],
      m = Math.hypot(dx, dy) || 1,
      f = 1.6 * Math.sin(i * 0.9);
    d +=
      (i ? "L" : "M") +
      (p[0] - (dy / m) * f).toFixed(1) +
      " " +
      (p[1] + (dx / m) * f).toFixed(1);
  });
  h += `<path d="${d}" fill="none" stroke="#47423c" stroke-width="1.1"/><path d="${d}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width=".4" transform="translate(-.4 -.4)"/><path id="fg" d="${d}" fill="none" stroke="#ffb347" stroke-width="5" filter="url(#fb)" opacity="0"/><path id="fil" d="${d}" fill="none" stroke="#fff4d2" stroke-width="1.3" opacity="0"/>`;
  h += `<g clip-path="url(#gc)"><path d="${G}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="8"/><circle id="bf" cx="180" cy="518" r="62" fill="url(#hot)" opacity="0"/><g transform="rotate(7 144 515)"><rect x="134" y="486" width="20" height="58" rx="3" fill="rgba(255,255,255,.2)"/><path d="M144 486V544M134 515H154" stroke="rgba(20,16,12,.35)" stroke-width="1.4"/></g><path d="M226 500C230 520 224 542 210 556" stroke="rgba(255,225,180,.3)" stroke-width="3" fill="none"/><ellipse cx="180" cy="566" rx="22" ry="5" fill="rgba(255,255,255,.07)"/></g><path d="${G}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.2"/><path d="M176 576q4 8 8 0z" fill="rgba(200,215,220,.25)" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>`;
  $("lamp").innerHTML = h;
  bf = $("bf");
  fil = $("fil");
  fg = $("fg");
  bl = $("bl");
}
const cv = $("cable"),
  cc = cv.getContext("2d"),
  LH = 352;
let DPR = 1,
  CK = 1,
  OX = 0,
  IT = [],
  PT = [],
  FB = [],
  pc = 0,
  pb = 0;
const bz = (t) => {
  const u = 1 - t;
  return [
    u * u * u * 182 +
      3 * u * u * t * 186 +
      3 * u * t * t * 180 +
      t * t * t * 180,
    u * u * u * -20 +
      3 * u * u * t * 100 +
      3 * u * t * t * 280 +
      t * t * t * LH,
  ];
};
function layout() {
  const r = cv.parentNode.getBoundingClientRect();
  DPR = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(r.width * DPR);
  cv.height = Math.round(r.height * DPR);
  CK = Math.min(r.width / 360, r.height / 640);
  OX = (r.width - 360 * CK) / 2;
  const N = 420,
    cum = [0];
  PT = [];
  for (let i = 0; i <= N; i++) PT.push(bz(i / N));
  for (let i = 1; i <= N; i++)
    cum.push(
      cum[i - 1] +
        Math.hypot(PT[i][0] - PT[i - 1][0], PT[i][1] - PT[i - 1][1]),
    );
  IT = [];
  for (let i = 0; i < N; i++) {
    const a = PT[i],
      b = PT[i + 1],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      m = Math.hypot(dx, dy) || 1,
      nx = -dy / m,
      ny = dx / m;
    for (let j = 0; j < 3; j++) {
      const f1 = 6.2832 * (cum[i] / 22 + j / 3),
        f2 = 6.2832 * (cum[i + 1] / 22 + j / 3),
        o1 = 3.5 * Math.sin(f1),
        o2 = 3.5 * Math.sin(f2);
      IT.push({
        x1: a[0] + nx * o1,
        y1: a[1] + ny * o1,
        x2: b[0] + nx * o2,
        y2: b[1] + ny * o2,
        d: Math.cos((f1 + f2) / 2),
        t: i,
        y: a[1],
      });
    }
  }
  IT.sort((p, q) => p.d - q.d);
  FB = [];
  let sd = 3;
  const R = () => {
    sd = (sd + 0x6d2b79f5) | 0;
    let t = Math.imul(sd ^ (sd >>> 15), 1 | sd);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 150; i++) {
    const p = PT[Math.floor(R() * N)],
      s = R() < 0.5 ? -1 : 1;
    FB.push([
      p[0] + s * (5.8 + R() * 1),
      p[1],
      s * (0.8 + R() * 1.4),
      (R() - 0.5) * 2.6,
    ]);
  }
  drawCable(pc, pb);
}
function drawCable(c, b) {
  const x = cc;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, cv.width, cv.height);
  x.setTransform(DPR * CK, 0, 0, DPR * CK, DPR * OX, 0);
  x.lineCap = "round";
  x.lineJoin = "round";
  const hi = Math.floor(c * (PT.length - 1));
  if (hi > 1) {
    x.save();
    x.beginPath();
    x.moveTo(PT[0][0], PT[0][1]);
    for (let i = 1; i <= hi; i++) x.lineTo(PT[i][0], PT[i][1]);
    x.strokeStyle = "rgba(255,170,70,.28)";
    x.lineWidth = 11;
    x.shadowColor = "rgba(255,150,50,.9)";
    x.shadowBlur = 22 * DPR * CK;
    x.stroke();
    x.strokeStyle = "rgba(255,205,130,.95)";
    x.lineWidth = 3.6;
    x.shadowBlur = 12 * DPR * CK;
    x.stroke();
    x.restore();
  }
  x.lineWidth = 5.4;
  for (const it of IT) {
    const ds = it.d * 0.5 + 0.5,
      pr = Math.max(0, 1 - (LH - it.y) / 430),
      lit = b * (0.12 + 0.88 * pr * pr),
      en = it.t < hi ? 0.55 : 0,
      k = 0.5 + 0.75 * ds,
      w = 0.5 * lit * (0.35 + 0.65 * ds);
    x.strokeStyle = `rgb(${(44 * k + 255 * w + 120 * en * (0.4 + 0.6 * ds)) | 0},${(36 * k + 190 * w + 68 * en * (0.4 + 0.6 * ds)) | 0},${(30 * k + 120 * w + 12 * en) | 0})`;
    x.beginPath();
    x.moveTo(it.x1, it.y1);
    x.lineTo(it.x2, it.y2);
    x.stroke();
  }
  x.lineWidth = 1.3;
  for (const it of IT) {
    if (it.d < 0.3) continue;
    const lit =
      b * (0.12 + 0.88 * Math.pow(Math.max(0, 1 - (LH - it.y) / 430), 2));
    x.strokeStyle = `rgba(255,226,184,${(0.08 + 0.35 * lit) * it.d})`;
    x.beginPath();
    x.moveTo(it.x1 - 1.1, it.y1);
    x.lineTo(it.x2 - 1.1, it.y2);
    x.stroke();
  }
  x.lineWidth = 0.55;
  for (const f of FB) {
    x.strokeStyle = `rgba(${(140 + 90 * b) | 0},${(112 + 60 * b) | 0},90,${0.14 + 0.12 * b})`;
    x.beginPath();
    x.moveTo(f[0], f[1]);
    x.lineTo(f[0] + f[2], f[1] + f[3]);
    x.stroke();
  }
}
let rt,
  tick = false;
buildLamp();
wall();
layout();
function draw() {
  tick = false;
  const r = st.getBoundingClientRect(),
    p = reduce ? 1 : cl(-r.top / (r.height - ww.clientHeight)),
    c = cl(p / 0.6),
    b = cl((p - 0.6) / 0.3);
  bf.style.opacity = b * 0.96;
  halo.style.opacity = b * 0.8;
  halo.setAttribute("r", 70 + 120 * b);
  fil.style.opacity = b;
  fg.style.opacity = b * 0.85;
  bl.style.opacity = b * 0.55;
  wm.style.opacity = b;
  if (Math.abs(c - pc) > 0.003 || Math.abs(b - pb) > 0.003) {
    pc = c;
    pb = b;
    drawCable(c, b);
  }
  const q = bf.getBoundingClientRect(),
    o = ww.getBoundingClientRect(),
    w = ww.style;
  w.setProperty("--x", q.left - o.left + q.width / 2 + "px");
  w.setProperty("--y", q.top - o.top + q.height * 0.45 + "px");
  w.setProperty(
    "--r",
    1 + Math.max(innerWidth, innerHeight) * 0.75 * b + "px",
  );
}
function req() {
  if (!tick) {
    tick = true;
    requestAnimationFrame(draw);
  }
}
addEventListener("scroll", req, { passive: true });
addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    wall();
    layout();
    draw();
  }, 150);
});
draw();
/* ===== HEADER: scroll, sub-header, mobile menu ===== */
(function () {
  const hdr = document.getElementById("site-header");
  const subHdr = document.getElementById("sub-header");
  const mobBtn = document.getElementById("mob-menu-btn");
  const mobMenu = document.getElementById("mob-menu");
  const mobClose = document.getElementById("mob-close-btn");
  const hamIcon = document.getElementById("ham-icon");
  const ICON_HAM = '<path d="M3 6h18M3 12h18M3 18h18"/>';
  const ICON_CLOSE = '<path d="M18 6L6 18M6 6l12 12"/>';

  /* Elemen focusable di dalam mob-menu */
  function getFocusable() {
    return Array.from(
      mobMenu.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])")
    ).filter(function (el) { return !el.disabled; });
  }

  /* Hero tinggi: sub-header muncul setelah scroll melewati 80svh */
  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    /* Border bawah navbar */
    if (scrollY > 4) {
      hdr.classList.add("scrolled");
    } else {
      hdr.classList.remove("scrolled");
    }
    /* Sub-header muncul setelah ~80% viewport */
    const threshold = Math.min(
      window.innerHeight * 0.8,
      document.getElementById("produk")
        ? document.getElementById("produk").offsetTop - 120
        : 500
    );
    if (scrollY > threshold) {
      subHdr.hidden = false;
      subHdr.removeAttribute("aria-hidden");
      requestAnimationFrame(function () { subHdr.classList.add("visible"); });
    } else {
      subHdr.classList.remove("visible");
      subHdr.setAttribute("aria-hidden", "true");
      /* sembunyikan setelah transisi selesai */
      setTimeout(function () {
        if (!subHdr.classList.contains("visible")) subHdr.hidden = true;
      }, 250);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); /* jalankan sekali saat load */

  /* Mobile menu: buka */
  function openMenu() {
    mobMenu.hidden = false;
    document.body.style.overflow = "hidden";
    mobBtn.setAttribute("aria-expanded", "true");
    if (hamIcon) hamIcon.innerHTML = ICON_CLOSE;
    /* fokus ke tombol tutup setelah transisi */
    requestAnimationFrame(function () {
      setTimeout(function () { if (mobClose) mobClose.focus(); }, 50);
    });
  }

  /* Mobile menu: tutup */
  function closeMenu() {
    mobMenu.hidden = true;
    document.body.style.overflow = "";
    mobBtn.setAttribute("aria-expanded", "false");
    if (hamIcon) hamIcon.innerHTML = ICON_HAM;
    mobBtn.focus();
  }

  if (mobBtn) mobBtn.addEventListener("click", openMenu);
  if (mobClose) mobClose.addEventListener("click", closeMenu);

  /* Tutup dengan Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mobMenu.hidden) closeMenu();
  });

  /* Tutup saat klik link di dalam mob-menu */
  if (mobMenu) {
    mobMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* Focus trap di dalam mob-menu */
  if (mobMenu) {
    mobMenu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = getFocusable();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
})();
