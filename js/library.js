/* =====================================================================
   library.js — โค้ดของหน้า Library (library.html)
   แสดงเฉพาะเกมที่ผู้ใช้กด "เก็บลง Library" ไว้ (ต้องล็อกอินก่อน)
   ===================================================================== */

window.onload = startLibraryPage;

async function startLibraryPage() {
  await loadAccount(); // โหลดข้อมูลผู้ใช้และ Library จาก Supabase (account.js)

  // ยังไม่ล็อกอิน → ไปหน้าเข้าสู่ระบบ
  if (getCurrentUser() === null) {
    goToLogin();
    return;
  }

  showUserInHeader();

  // getLibrary() ให้แค่ id ของเกม เช่น [3, 1] → เอาไปหาข้อมูลเกมเต็ม ๆ ใน GAMES
  const myGames = [];
  for (const gameId of getLibrary()) {
    const game = findGame(gameId);
    if (game !== null) {          // ข้ามเกมที่ถูกลบออกจาก games-data.js ไปแล้ว
      myGames.push(game);
    }
  }

  const grid = document.getElementById("game-grid");
  showGameCards(grid, myGames, "ยังไม่มีเกมใน Library — กด \"+ เก็บลง Library\" บนปกเกมในหน้าเกมทั้งหมด");
}

// หาข้อมูลเกมจาก id → เจอ: ได้ Object ของเกม, ไม่เจอ: null
function findGame(gameId) {
  for (const game of GAMES) {
    if (game.id === gameId) {
      return game;
    }
  }
  return null;
}
