/* =====================================================================
   common.js — ฟังก์ชันที่ใช้ร่วมกันทุกหน้า
   ต้องโหลดหลัง account.js (ใช้ getCurrentUser และ logoutUser จากไฟล์นั้น)
   ===================================================================== */


// สร้าง element + ใส่ class + ใส่ข้อความ ในคำสั่งเดียว
// ตัวอย่าง: makeElement("p", "game-desc", "สวัสดี")  →  <p class="game-desc">สวัสดี</p>
function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;

  if (text !== undefined) {
    // ใช้ textContent ไม่ใช้ innerHTML เพราะปลอดภัยกว่า (สไลด์ Week 7)
    element.textContent = text;
  }
  return element;
}

// ส่วนหัวเว็บ: ถ้าล็อกอินอยู่ → เปลี่ยนปุ่ม "เข้าสู่ระบบ / สมัครสมาชิก" มุมขวาบน
// เป็นชื่อผู้ใช้ + ปุ่ม "ออกจากระบบ"   (ยังไม่ล็อกอิน → ใช้ปุ่มเดิมที่เขียนไว้ใน HTML)
function showUserInHeader() {
  const user = getCurrentUser();
  if (user === null) {
    return;
  }

  const box = document.getElementById("header-buttons");
  box.textContent = ""; // ลบปุ่มเดิมออกก่อน

  box.appendChild(makeElement("span", "user-name", user.username));

  const logoutButton = makeElement("button", "btn btn-outline", "ออกจากระบบ");
  logoutButton.type = "button";
  logoutButton.addEventListener("click", async function () {
    await logoutUser(); // รอ Supabase ออกจากระบบให้เสร็จก่อน แล้วค่อยเปลี่ยนหน้า
    window.location.href = "index.html";
  });
  box.appendChild(logoutButton);
}

// พาไปหน้าเข้าสู่ระบบ (ใช้ตอนกดปุ่มที่ต้องล็อกอินก่อน)
// ?need-login ท้ายลิงก์ = บอกหน้า login ให้ขึ้นข้อความอธิบายว่าทำไมต้องล็อกอิน
function goToLogin() {
  window.location.href = "login.html?need-login";
}
