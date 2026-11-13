/* =====================================================================
   account.js — ระบบบัญชีผู้ใช้: สมัครสมาชิก, เข้าสู่ระบบ, Library, ให้ดาว

   ⚠ ตอนนี้ยังไม่มีฐานข้อมูล → เก็บข้อมูลทั้งหมดไว้ใน localStorage ของเบราว์เซอร์ชั่วคราว
     (สไลด์ Week 6: LocalStorage, Week 8: JSON)
     ข้อจำกัด: - ข้อมูลอยู่แค่ในเบราว์เซอร์เครื่องนี้ เปิดจากเครื่องอื่นจะไม่เห็น
               - ยังไม่ปลอดภัยพอสำหรับเว็บจริง (ใครเปิด DevTools ก็แก้ข้อมูลได้)

   ขั้นต่อไป: ย้ายไปเก็บในฐานข้อมูลบน server (Week 10–12)
     แก้ "ข้างใน" ฟังก์ชันของไฟล์นี้ ให้ใช้ fetch() คุยกับ server แทน localStorage

   ข้อมูลที่เก็บใน localStorage (ชื่อ key → หน้าตาข้อมูล):
     "ssyba-users"         [ { username, email, passwordHash }, ... ]   รายชื่อสมาชิก
     "ssyba-current-user"  "a@mail.com"                                  อีเมลของคนที่ล็อกอินอยู่
     "ssyba-library"       { "a@mail.com": [3, 1], ... }                 เกมใน Library ของแต่ละคน
     "ssyba-ratings"       { "1": { "a@mail.com": 5, ... }, ... }        ดาวที่แต่ละคนให้แต่ละเกม
   ===================================================================== */


const USERS_KEY = "ssyba-users";
const CURRENT_USER_KEY = "ssyba-current-user";
const LIBRARY_KEY = "ssyba-library";
const RATINGS_KEY = "ssyba-ratings";


/* ---------- ฟังก์ชันช่วยอ่าน/เขียน localStorage ---------- */

// localStorage เก็บได้แค่ "ข้อความ" → ตอนอ่านต้องแปลงข้อความ JSON กลับเป็น Array/Object
// ถ้ายังไม่เคยเก็บอะไรไว้ (ได้ null) → ใช้ค่าเริ่มต้น emptyValue แทน
function readData(key, emptyValue) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return emptyValue;
  }
  return JSON.parse(text);
}

// แปลง Array/Object เป็นข้อความ JSON แล้วเก็บลง localStorage
function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


/* ---------- 1) สมาชิก: สมัคร / เข้าสู่ระบบ / ออกจากระบบ ---------- */

// ผู้ใช้ที่ล็อกอินอยู่ → { username, email }    ยังไม่ล็อกอิน → null
function getCurrentUser() {
  const email = localStorage.getItem(CURRENT_USER_KEY);
  if (email === null) {
    return null;
  }

  const user = findUserByEmail(email);
  if (user === null) {
    return null;
  }
  return { username: user.username, email: user.email };
}

// หาสมาชิกจากอีเมล → เจอ: ได้ข้อมูลสมาชิก, ไม่เจอ: null
function findUserByEmail(email) {
  const users = readData(USERS_KEY, []);
  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// สมัครสมาชิก แล้วเข้าสู่ระบบให้เลย
// สำเร็จ → คืนค่า null,  ไม่สำเร็จ → คืนข้อความบอกสาเหตุ (เอาไปแสดงใต้ฟอร์ม)
async function registerUser(username, email, password) {
  username = username.trim();
  email = cleanEmail(email);

  if (username.length < 3 || username.length > 30) {
    return "ชื่อผู้ใช้ต้องยาว 3–30 ตัวอักษร";
  }
  if (!isEmail(email)) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (password.length < 6) {
    return "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร";
  }
  if (findUserByEmail(email) !== null) {
    return "อีเมลนี้สมัครสมาชิกไว้แล้ว";
  }

  const users = readData(USERS_KEY, []);
  users.push({
    username: username,
    email: email,
    passwordHash: await hashPassword(password) // ไม่เก็บรหัสผ่านจริง
  });
  writeData(USERS_KEY, users);

  localStorage.setItem(CURRENT_USER_KEY, email); // สมัครเสร็จ = ล็อกอินเลย
  return null;
}

// เข้าสู่ระบบ: สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ
async function loginUser(email, password) {
  email = cleanEmail(email);
  const user = findUserByEmail(email);
  const passwordHash = await hashPassword(password);

  // ไม่บอกว่าผิดที่อีเมลหรือที่รหัสผ่าน คนอื่นจะได้เดาไม่ได้ว่าอีเมลไหนมีบัญชี
  if (user === null || user.passwordHash !== passwordHash) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  localStorage.setItem(CURRENT_USER_KEY, email);
  return null;
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ตัดช่องว่างหน้า/หลัง และทำเป็นตัวพิมพ์เล็ก: " A@Mail.com " → "a@mail.com"
function cleanEmail(email) {
  return email.trim().toLowerCase();
}

// เช็ครูปแบบอีเมลแบบง่าย ๆ: มีข้อความ @ ข้อความ . ข้อความ และไม่มีช่องว่าง
function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// แปลงรหัสผ่านเป็นรหัสที่ถอดกลับไม่ได้ (SHA-256) ก่อนเก็บ ใน localStorage จะไม่มีรหัสผ่านจริงอยู่
// เช่น "123456" → "8d969eef6ecad3c2..."
// (เว็บจริงต้องทำขั้นนี้ที่ server ด้วยวิธีที่ช้ากว่าและปลอดภัยกว่า เช่น bcrypt)
async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);           // ข้อความ → ชุดตัวเลข
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);

  // แปลงผลลัพธ์ (ตัวเลข 0–255 จำนวน 32 ตัว) เป็นเลขฐาน 16 ต่อกันเป็นข้อความ
  let hex = "";
  for (const byte of new Uint8Array(hashBuffer)) {
    hex = hex + byte.toString(16).padStart(2, "0");
  }
  return hex;
}


/* ---------- 2) Library: เกมที่ผู้ใช้เก็บไว้ ---------- */

// id ของเกมใน Library ของคนที่ล็อกอินอยู่ เรียงจากที่เก็บล่าสุด เช่น [3, 1]
// ยังไม่ล็อกอิน → []
function getLibrary() {
  const user = getCurrentUser();
  if (user === null) {
    return [];
  }

  const allLibraries = readData(LIBRARY_KEY, {});
  const myGames = allLibraries[user.email];
  if (myGames === undefined) {
    return [];
  }
  return myGames;
}

// ยังไม่มีเกมนี้ใน Library → เพิ่มเข้าไป,  มีอยู่แล้ว → เอาออก
// คืนค่า true = ตอนนี้เกมอยู่ใน Library,  false = เอาออกแล้ว
// (ต้องล็อกอินก่อนเรียกฟังก์ชันนี้)
function toggleLibrary(gameId) {
  const email = getCurrentUser().email;
  const allLibraries = readData(LIBRARY_KEY, {});
  const myGames = getLibrary();
  const position = myGames.indexOf(gameId); // ไม่เจอ = -1

  if (position === -1) {
    myGames.unshift(gameId);         // ใส่ไว้หน้าสุด → เกมที่เก็บล่าสุดขึ้นก่อน
  } else {
    myGames.splice(position, 1);     // เอาออก
  }

  allLibraries[email] = myGames;
  writeData(LIBRARY_KEY, allLibraries);
  return position === -1;
}


/* ---------- 3) ให้ดาว ---------- */

// สรุปคะแนนของเกม 1 เกม → { average: 4.5, count: 2, mine: 5 }
//   average = คะแนนเฉลี่ย (ทศนิยม 1 ตำแหน่ง)
//   count   = จำนวนคนที่ให้ดาว
//   mine    = ดาวที่เราให้ไว้ (ยังไม่ให้ หรือยังไม่ล็อกอิน = 0)
function getRating(gameId) {
  const allRatings = readData(RATINGS_KEY, {});
  let gameRatings = allRatings[gameId]; // เช่น { "a@mail.com": 5, "b@mail.com": 4 }
  if (gameRatings === undefined) {
    gameRatings = {};
  }

  // รวมดาวของทุกคน (Object.values = เอาเฉพาะค่าใน Object มาเป็น Array: [5, 4])
  let total = 0;
  let count = 0;
  for (const stars of Object.values(gameRatings)) {
    total = total + stars;
    count = count + 1;
  }

  let average = 0;
  if (count > 0) {
    average = Math.round((total / count) * 10) / 10; // ปัดเหลือทศนิยม 1 ตำแหน่ง
  }

  let mine = 0;
  const user = getCurrentUser();
  if (user !== null && gameRatings[user.email] !== undefined) {
    mine = gameRatings[user.email];
  }

  return { average: average, count: count, mine: mine };
}

// ให้ดาว 1–5 กับเกม (ให้ซ้ำ = แก้ดาวเดิม)  — ต้องล็อกอินก่อนเรียกฟังก์ชันนี้
function rateGame(gameId, stars) {
  const email = getCurrentUser().email;
  const allRatings = readData(RATINGS_KEY, {});

  if (allRatings[gameId] === undefined) {
    allRatings[gameId] = {};
  }
  allRatings[gameId][email] = stars;

  writeData(RATINGS_KEY, allRatings);
}
