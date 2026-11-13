/* =====================================================================
   main.js — โค้ดของหน้าแรก "เกมทั้งหมด" (index.html)

   ลำดับการทำงาน:
     1) เปิดหน้าเว็บเสร็จ → เรียกฟังก์ชัน startPage()
     2) ถ้าล็อกอินอยู่ → โชว์ชื่อผู้ใช้ที่มุมขวาบน (common.js)
     3) สร้างการ์ดของทุกเกมใน GAMES (games-data.js) ใส่ในกล่อง #game-grid (cards.js)
   ===================================================================== */

// เริ่มทำงานเมื่อหน้าเว็บโหลดเสร็จ (สไลด์ Week 5: window.onload)
window.onload = startPage;

function startPage() {
  showUserInHeader();

  const grid = document.getElementById("game-grid");
  showGameCards(grid, GAMES, "ยังไม่มีเกม");
}
