/* =====================================================================
   account.js — ระบบบัญชีผู้ใช้: สมัครสมาชิก, เข้าสู่ระบบ, Library, ให้ดาว

   ข้อมูลทั้งหมดเก็บในฐานข้อมูล Supabase (ตั้งค่าที่ js/supabase-config.js)
     - อีเมล / รหัสผ่าน            → ระบบ Auth ของ Supabase (เข้ารหัสรหัสผ่านให้เอง)
     - ชื่อผู้ใช้                    → ตาราง profiles (สร้างให้อัตโนมัติตอนสมัคร)
     - Library                     → ตาราง library
     - ดาว                          → ตาราง ratings
     (โครงสร้างตารางและกฎความปลอดภัย ดูใน supabase/schema.sql)

   วิธีทำงาน:
     1) ทุกหน้าเรียก await loadAccount() ครั้งเดียวตอนเปิดหน้า
        → ดึงข้อมูลผู้ใช้ / Library / ดาว จากฐานข้อมูลมาเก็บไว้ในตัวแปร
     2) ตอนสร้างการ์ด อ่านจากตัวแปร (getCurrentUser, getLibrary, getRating) ไม่ต้องรอเน็ต
     3) ตอนกดปุ่ม (toggleLibrary, rateGame) ส่งไปบันทึกที่ฐานข้อมูลก่อน
        บันทึกสำเร็จแล้วค่อยแก้ตัวแปรให้ตรงกัน

   ฟังก์ชันที่ส่งไปฐานข้อมูลจะคืนค่า: สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ (ภาษาไทย)
   ===================================================================== */


/* ---------- เชื่อมต่อ Supabase ---------- */

// supabase.createClient มาจากไฟล์ supabase-js ที่โหลดจาก CDN ในหัว HTML
// ถ้ายังไม่ได้ใส่ key ใน supabase-config.js → db = null (เว็บยังเปิดดูเกมได้ แต่ล็อกอินไม่ได้)
let db = null;
if (globalThis.supabase && (SUPABASE_KEY.startsWith("sb_publishable_") || SUPABASE_KEY.startsWith("eyJ"))) {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn("ระบบบัญชี SSyba ยังไม่พร้อมใช้งาน");
}

const NOT_READY_MESSAGE = "ยังเชื่อมต่อระบบบัญชีไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรชหน้า";


/* ---------- ข้อมูลที่ดึงมาจากฐานข้อมูลตอนเปิดหน้า ---------- */

let currentUser = null; // คนที่ล็อกอินอยู่ { id, username, email }   ยังไม่ล็อกอิน = null
let myLibrary = [];     // id ของเกมใน Library ของเรา เรียงจากที่เก็บล่าสุด เช่น [3, 1]
let allRatings = [];    // ดาวทุกแถวในตาราง ratings เช่น [{ game_id: 1, user_id: "...", stars: 4 }, ...]


/* ---------- 0) โหลดข้อมูลตอนเปิดหน้า ---------- */

async function loadAccount() {
  if (db === null) {
    return;
  }

  try {
    // ใครล็อกอินอยู่ (Supabase จำการล็อกอินไว้ในเบราว์เซอร์ให้เอง ปิดเว็บแล้วเปิดใหม่ก็ยังอยู่)
    const sessionResult = await db.auth.getSession();
    const session = sessionResult.data.session;
    if (session !== null) {
      currentUser = makeUser(session.user);

      // ชื่อผู้ใช้ล่าสุดอยู่ในตาราง profiles
      // เทียบกับ SQL: SELECT username FROM profiles WHERE id = ?
      const profileResult = await db
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .maybeSingle(); // ได้ 1 แถว หรือ null ถ้าไม่เจอ

      if (profileResult.error) {
        console.error("โหลดโปรไฟล์ไม่ได้:", translateError(profileResult.error));
      } else if (profileResult.data !== null) {
        currentUser.username = profileResult.data.username;
      }
    }

    // ดาวของทุกเกม (ทุกคนดูได้ ไม่ต้องล็อกอิน)
    // เทียบกับ SQL: SELECT game_id, user_id, stars FROM ratings
    const ratingsResult = await db.from("ratings").select("game_id, user_id, stars");
    if (ratingsResult.error) {
      console.error("โหลดดาวไม่ได้:", translateError(ratingsResult.error));
    } else {
      allRatings = ratingsResult.data;
    }

    // Library ของเรา (ล็อกอินแล้วเท่านั้น)
    // เทียบกับ SQL: SELECT game_id FROM library WHERE user_id = ? ORDER BY added_at DESC
    if (currentUser !== null) {
      const libraryResult = await db
        .from("library")
        .select("game_id")
        .eq("user_id", currentUser.id)
        .order("added_at", { ascending: false });

      if (libraryResult.error) {
        console.error("โหลด Library ไม่ได้:", translateError(libraryResult.error));
      } else {
        for (const row of libraryResult.data) {
          myLibrary.push(row.game_id);
        }
      }
    }
  } catch (error) {
    // ต่อเน็ตไม่ได้ ฯลฯ → ยังเปิดหน้าเว็บได้ แค่ไม่มีข้อมูลบัญชี
    console.error("ติดต่อ Supabase ไม่ได้:", error);
  }
}

// ข้อมูลผู้ใช้ของ Supabase มีหลายช่อง → เอาแค่ที่เว็บเราใช้
// (ชื่อผู้ใช้ตรงนี้เป็นค่าสำรอง loadAccount จะเปลี่ยนเป็นชื่อจากตาราง profiles ให้)
function makeUser(supabaseUser) {
  let username = supabaseUser.user_metadata.username; // ชื่อที่กรอกตอนสมัคร
  if (!username) {
    username = supabaseUser.email.split("@")[0];       // ไม่มีชื่อ → ใช้ส่วนหน้า @ ของอีเมล
  }
  return { id: supabaseUser.id, username: username, email: supabaseUser.email };
}


/* ---------- 1) สมาชิก: สมัคร / เข้าสู่ระบบ / ออกจากระบบ ---------- */

// ผู้ใช้ที่ล็อกอินอยู่ → { id, username, email }    ยังไม่ล็อกอิน → null
function getCurrentUser() {
  return currentUser;
}

// Verify the cached login before redirecting back to a game that requires an account.
async function hasActiveLogin() {
  if (!db) return false;
  try {
    const { data: { session }, error: sessionError } = await db.auth.getSession();
    if (sessionError || !session?.user?.id) return false;
    const { data: { user }, error } = await db.auth.getUser();
    return Boolean(!error && user && !user.is_anonymous && user.id === session.user.id);
  } catch {
    return false;
  }
}

// สมัครสมาชิก: สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ
// ถ้าใน Supabase เปิด "Confirm email" ไว้ สมัครเสร็จจะยังไม่ล็อกอิน (getCurrentUser() ยังเป็น null)
// จนกว่าผู้ใช้จะกดลิงก์ยืนยันในอีเมล
async function registerUser(username, email, password, emailRedirectTo) {
  if (db === null) {
    return NOT_READY_MESSAGE;
  }

  username = username.trim();
  email = email.trim().toLowerCase();

  if (username.length < 3 || username.length > 30) {
    return "ชื่อผู้ใช้ต้องยาว 3–30 ตัวอักษร";
  }
  if (password.length < 6) {
    return "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร";
  }

  const result = await db.auth.signUp({
    email: email,
    password: password,
    options: { data: { username: username }, emailRedirectTo }
  });

  if (result.error) {
    return translateError(result.error);
  }
  if (result.data.session !== null) {
    currentUser = makeUser(result.data.user); // ไม่ต้องยืนยันอีเมล → ล็อกอินให้เลย
  }
  return null;
}

// เข้าสู่ระบบ: สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ
async function loginUser(email, password) {
  if (db === null) {
    return NOT_READY_MESSAGE;
  }

  const result = await db.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password
  });

  if (result.error) {
    return translateError(result.error);
  }
  currentUser = makeUser(result.data.user);
  return null;
}

async function logoutUser() {
  if (db !== null) {
    await db.auth.signOut();
  }
  currentUser = null;
}


/* ---------- 2) Library: เกมที่ผู้ใช้เก็บไว้ ---------- */

// id ของเกมใน Library ของเรา เช่น [3, 1]  (ยังไม่ล็อกอิน → [])
function getLibrary() {
  return myLibrary;
}

// ยังไม่มีเกมนี้ใน Library → เพิ่มเข้าไป,  มีอยู่แล้ว → เอาออก
// สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ    (ต้องล็อกอินก่อนเรียกฟังก์ชันนี้)
async function toggleLibrary(gameId) {
  const position = myLibrary.indexOf(gameId); // ไม่เจอ = -1
  let result;

  if (position === -1) {
    // เทียบกับ SQL: INSERT INTO library (user_id, game_id) VALUES (?, ?)
    result = await db.from("library").insert({ user_id: currentUser.id, game_id: gameId });
  } else {
    // เทียบกับ SQL: DELETE FROM library WHERE user_id = ? AND game_id = ?
    result = await db.from("library").delete().eq("user_id", currentUser.id).eq("game_id", gameId);
  }

  if (result.error) {
    return translateError(result.error);
  }

  // ฐานข้อมูลบันทึกแล้ว → แก้ตัวแปรในหน้าเว็บให้ตรงกัน
  if (position === -1) {
    myLibrary.unshift(gameId);     // ใส่ไว้หน้าสุด = เก็บล่าสุดขึ้นก่อน
  } else {
    myLibrary.splice(position, 1); // เอาออก
  }
  return null;
}


/* ---------- 3) ให้ดาว ---------- */

// สรุปคะแนนของเกม 1 เกม → { average: 4.5, count: 2, mine: 5 }
//   average = คะแนนเฉลี่ย (ทศนิยม 1 ตำแหน่ง)
//   count   = จำนวนคนที่ให้ดาว
//   mine    = ดาวที่เราให้ไว้ (ยังไม่ให้ หรือยังไม่ล็อกอิน = 0)
function getRating(gameId) {
  let total = 0;
  let count = 0;
  let mine = 0;

  for (const row of allRatings) {
    if (row.game_id === gameId) {
      total = total + row.stars;
      count = count + 1;
      if (currentUser !== null && row.user_id === currentUser.id) {
        mine = row.stars;
      }
    }
  }

  let average = 0;
  if (count > 0) {
    average = Math.round((total / count) * 10) / 10; // ปัดเหลือทศนิยม 1 ตำแหน่ง
  }
  return { average: average, count: count, mine: mine };
}

// ให้ดาว 1–5 กับเกม (ให้ซ้ำ = แก้ดาวเดิม)
// สำเร็จ → null,  ไม่สำเร็จ → ข้อความบอกสาเหตุ    (ต้องล็อกอินก่อนเรียกฟังก์ชันนี้)
async function rateGame(gameId, stars) {
  // upsert = ยังไม่เคยให้ดาว → เพิ่มแถวใหม่,  เคยให้แล้ว → แก้แถวเดิม
  const result = await db.from("ratings").upsert({
    user_id: currentUser.id,
    game_id: gameId,
    stars: stars,
    rated_at: new Date().toISOString()
  });

  if (result.error) {
    return translateError(result.error);
  }

  // ฐานข้อมูลบันทึกแล้ว → แก้ตัวแปร allRatings ให้ตรงกัน
  let found = false;
  for (const row of allRatings) {
    if (row.game_id === gameId && row.user_id === currentUser.id) {
      row.stars = stars;
      found = true;
    }
  }
  if (!found) {
    allRatings.push({ game_id: gameId, user_id: currentUser.id, stars: stars });
  }
  return null;
}


/* ---------- 4) แปลงข้อความ error ของ Supabase เป็นภาษาไทย ---------- */

// รหัส error ที่เจอบ่อย → ข้อความที่จะโชว์ให้ผู้ใช้อ่าน
const ERROR_MESSAGES = {
  invalid_credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  user_already_exists: "อีเมลนี้สมัครสมาชิกไว้แล้ว",
  email_exists: "อีเมลนี้สมัครสมาชิกไว้แล้ว",
  email_address_invalid: "รูปแบบอีเมลไม่ถูกต้อง",
  weak_password: "รหัสผ่านง่ายเกินไป ลองตั้งให้ยาวและเดายากขึ้น",
  email_not_confirmed: "ยังไม่ได้ยืนยันอีเมล กรุณากดลิงก์ในอีเมลที่ส่งไปก่อน",
  over_email_send_rate_limit: "ส่งอีเมลบ่อยเกินไป รอสักครู่แล้วลองใหม่",
  over_request_rate_limit: "ส่งคำขอบ่อยเกินไป รอสักครู่แล้วลองใหม่",
  PGRST205: "ยังไม่ได้สร้างตารางใน Supabase (รันไฟล์ supabase/schema.sql ก่อน)",
  "42P01": "ยังไม่ได้สร้างตารางใน Supabase (รันไฟล์ supabase/schema.sql ก่อน)",
  "42501": "ไม่มีสิทธิ์ทำรายการนี้ ลองออกจากระบบแล้วเข้าใหม่",
  "23505": "ข้อมูลนี้บันทึกไว้แล้ว ลองรีเฟรชหน้า"
};

function translateError(error) {
  console.error(error); // ข้อความเต็ม (ภาษาอังกฤษ) ดูได้ใน DevTools → Console

  if (ERROR_MESSAGES[error.code] !== undefined) {
    return ERROR_MESSAGES[error.code];
  }
  return "เกิดข้อผิดพลาด: " + error.message;
}
