/* =====================================================================
   register.js — โค้ดของหน้าสมัครสมาชิก (register.html)
   ===================================================================== */

window.onload = startRegisterPage;

function startRegisterPage() {
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

  if (password !== passwordConfirm) {
    errorBox.textContent = "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
    return;
  }

  // registerUser อยู่ใน account.js: สำเร็จได้ null (และล็อกอินให้เลย), ไม่สำเร็จได้ข้อความบอกสาเหตุ
  const error = await registerUser(username, email, password);

  if (error !== null) {
    errorBox.textContent = error;
    return;
  }
  window.location.href = "index.html"; // สำเร็จ → ไปหน้าแรก
}
