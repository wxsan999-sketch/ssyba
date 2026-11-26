/* =====================================================================
   login.js — โค้ดของหน้าเข้าสู่ระบบ (login.html)
   ===================================================================== */

let seaFarmDestination = null;
document.addEventListener("DOMContentLoaded", startLoginPage);

async function startLoginPage() {
  seaFarmDestination = prepareSeaFarmAuthPage();
  if (seaFarmDestination) {
    document.title = "เข้าสู่ระบบเพื่อเล่น Sea Farm - SSyba";
    document.querySelector(".auth-title").textContent = "เข้าสู่ระบบเพื่อเล่น Sea Farm";
    document.getElementById("form-note").textContent =
      "ใช้บัญชี SSyba ของคุณ ชื่อผู้เล่น เบี้ยสูงสุด ยอดขาย และเวลาเล่นจะแสดงบนกระดานอันดับสาธารณะ";
  } else if (new URLSearchParams(window.location.search).has("need-login")) {
    document.getElementById("form-note").textContent =
      "เข้าสู่ระบบก่อน เพื่อเก็บเกมลง Library และให้ดาวเกม";
  }

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  if (await hasActiveLogin()) window.location.replace(seaFarmDestination || "index.html");
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
  window.location.replace(seaFarmDestination || "index.html");
}
