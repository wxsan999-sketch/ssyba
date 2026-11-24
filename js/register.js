/* =====================================================================
   register.js — โค้ดของหน้าสมัครสมาชิก (register.html)
   ===================================================================== */

window.onload = startRegisterPage;

async function startRegisterPage() {
  await loadAccount(); // เช็คกับ Supabase ว่าล็อกอินอยู่หรือยัง (account.js)

  // ล็อกอินอยู่แล้ว → ไม่ต้องสมัครใหม่ กลับหน้าแรกเลย
  if (getCurrentUser() !== null) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("register-form").addEventListener("submit", handleRegister);
}

// ทำงานตอนกดปุ่ม "สมัครสมาชิก"
async function handleRegister(event) {
  event.preventDefault(); // ไม่ให้ฟอร์มรีเฟรชหน้า

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("password-confirm").value;
  const errorBox = document.getElementById("form-error");
  const noteBox = document.getElementById("form-note");
  const submitButton = document.getElementById("register-button");

  errorBox.textContent = "";

  if (password !== passwordConfirm) {
    errorBox.textContent = "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
    return;
  }

  submitButton.disabled = true; // กันกดซ้ำระหว่างรอ Supabase ตอบกลับ

  // registerUser อยู่ใน account.js: สำเร็จได้ null, ไม่สำเร็จได้ข้อความบอกสาเหตุ
  const error = await registerUser(username, email, password);
  submitButton.disabled = false;

  if (error !== null) {
    errorBox.textContent = error;
    return;
  }

  // สมัครสำเร็จ แต่ Supabase ให้ยืนยันอีเมลก่อน (ยังไม่ได้ล็อกอิน)
  if (getCurrentUser() === null) {
    noteBox.textContent = "สมัครสำเร็จ! เปิดอีเมลแล้วกดลิงก์ยืนยัน จากนั้นค่อยเข้าสู่ระบบ";
    event.target.reset(); // ล้างช่องกรอกทั้งหมด
    return;
  }

  window.location.href = "index.html"; // สมัครและล็อกอินแล้ว → ไปหน้าแรก
}
