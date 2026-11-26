/* =====================================================================
   register.js — โค้ดของหน้าสมัครสมาชิก (register.html)
   ===================================================================== */

let seaFarmDestination = null;
document.addEventListener("DOMContentLoaded", startRegisterPage);

async function startRegisterPage() {
  seaFarmDestination = prepareSeaFarmAuthPage();
  if (seaFarmDestination) {
    document.title = "สมัครสมาชิกเพื่อเล่น Sea Farm - SSyba";
    document.querySelector(".auth-title").textContent = "สมัครสมาชิกเพื่อเล่น Sea Farm";
    document.getElementById("form-note").textContent =
      "เลือกชื่อผู้เล่นสำหรับกระดานอันดับ Sea Farm ผู้เล่นคนอื่นจะเห็นชื่อนี้พร้อมเบี้ยสูงสุด ยอดขาย และเวลาเล่นของคุณ";
  }

  document.getElementById("register-form").addEventListener("submit", handleRegister);
  if (await hasActiveLogin()) window.location.replace(seaFarmDestination || "index.html");
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
  const emailRedirectTo = seaFarmDestination ? document.getElementById("login-link").href : undefined;
  const error = await registerUser(username, email, password, emailRedirectTo);
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

  window.location.replace(seaFarmDestination || "index.html");
}
