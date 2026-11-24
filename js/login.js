/* =====================================================================
   login.js — โค้ดของหน้าเข้าสู่ระบบ (login.html)
   ===================================================================== */

window.onload = startLoginPage;

async function startLoginPage() {
  await loadAccount(); // เช็คกับ Supabase ว่าล็อกอินอยู่หรือยัง (account.js)

  // ล็อกอินอยู่แล้ว → ไม่ต้องอยู่หน้านี้ กลับหน้าแรกเลย
  if (getCurrentUser() !== null) {
    window.location.href = "index.html";
    return;
  }

  // ถูกพามาจากปุ่ม "เก็บลง Library" / ให้ดาว / หน้า Library (ลิงก์ลงท้ายด้วย ?need-login)
  if (window.location.search.includes("need-login")) {
    document.getElementById("form-note").textContent =
      "เข้าสู่ระบบก่อน เพื่อเก็บเกมลง Library และให้ดาวเกม";
  }

  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

// ทำงานตอนกดปุ่ม "เข้าสู่ระบบ"
async function handleLogin(event) {
  event.preventDefault(); // ไม่ให้ฟอร์มส่งข้อมูลแบบเดิม (ซึ่งจะรีเฟรชหน้า)

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("form-error");
  const submitButton = document.getElementById("login-button");

  errorBox.textContent = "";
  submitButton.disabled = true; // กันกดซ้ำระหว่างรอ Supabase ตอบกลับ

  // loginUser อยู่ใน account.js: สำเร็จได้ null, ไม่สำเร็จได้ข้อความบอกสาเหตุ
  const error = await loginUser(email, password);
  submitButton.disabled = false;

  if (error !== null) {
    errorBox.textContent = error;
    return;
  }
  window.location.href = "index.html"; // สำเร็จ → ไปหน้าแรก
}
