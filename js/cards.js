/* =====================================================================
   cards.js — สร้างการ์ดเกม และจัดการปุ่มบนการ์ด
   ใช้ในหน้า "เกมทั้งหมด" (index.html) และหน้า "Library" (library.html)

   ปุ่มบนการ์ด:
     - "+ เก็บลง Library" (มุมขวาบนของปก)  → เก็บ/เอาเกมออกจาก Library
     - ดาว 5 ดวง (แถว "ให้ดาว")            → ให้คะแนนเกม 1–5 ดาว
     - ปกเกม / ปุ่ม "▶ เล่นเลย"             → เข้าไปเล่นเกม
   สองปุ่มแรกต้องล็อกอินก่อน ถ้ายังไม่ล็อกอินจะพาไปหน้าเข้าสู่ระบบ

   ข้อมูล Library และดาว อ่าน/เขียนผ่านฟังก์ชันใน account.js (เก็บใน Supabase)
   ===================================================================== */


// เอาการ์ดของทุกเกมใน games ไปใส่ในกล่อง grid
// ถ้าไม่มีเกมเลย → ขึ้นข้อความ emptyText แทน
function showGameCards(grid, games, emptyText) {
  if (games.length === 0) {
    grid.appendChild(makeElement("p", "empty-message", emptyText));
    return;
  }

  // วนลูปข้อมูลเกมทุกเกม (สไลด์ Week 6: for...of)
  for (const game of games) {
    grid.appendChild(createGameCard(game));
  }

  // Event Delegation (สไลด์ Week 7): ดักการคลิกที่ "กล่องแม่" จุดเดียว
  // แทนที่จะไปผูกคำสั่งให้ปุ่มทีละปุ่ม
  grid.addEventListener("click", handleGridClick);
}


/* ---------- 1) สร้างการ์ดเกม 1 ใบ ----------

   หน้าตา HTML ที่ฟังก์ชันนี้สร้างออกมา:

   <article class="game-card" data-game-id="1">
     <div class="game-cover">            ← ปกเกม (สีไล่เฉด)
       <span class="cover-icon">🐟</span>
       <span class="cover-title">Submarine vs Fish</span>
       <button class="library-btn">+ เก็บลง Library</button>
     </div>
     <div class="game-info">             ← รายละเอียดใต้ปก
       <div class="game-title-row"> ชื่อเกม + ป้ายราคา </div>
       <p class="game-desc">    คำอธิบาย </p>
       <p class="game-author">  โดย ... </p>
       <p class="game-rating">  ★★★★☆ 4.3 (12) </p>   ← คะแนนเฉลี่ยของทุกคน
       <p class="game-genre">   Action </p>
       <div class="my-rating">  ให้ดาว ★★★★★ </div>  ← ปุ่มให้ดาวของเรา
       <a class="play-link">    ▶ เล่นเลย </a>
     </div>
   </article>
*/
function createGameCard(game) {
  const card = makeElement("article", "game-card");
  // จด id ของเกมไว้ที่การ์ด (กลายเป็น data-game-id="1" ใน HTML)
  // ตอนกดปุ่มบนการ์ด จะได้รู้ว่าเป็นของเกมไหน
  card.dataset.gameId = game.id;

  // ----- ส่วนปกเกม -----
  const cover = makeElement("div", "game-cover");
  // ระบายสีพื้นหลังแบบไล่เฉดตามสีของแต่ละเกม (สไลด์ Week 7: style object)
  cover.style.backgroundImage =
    "linear-gradient(135deg, " + game.color1 + ", " + game.color2 + ")";

  if (game.cover) {
    const image = makeElement("img", "cover-art");
    image.src = game.cover;
    image.alt = "";
    cover.appendChild(image);
  } else {
    cover.appendChild(makeElement("span", "cover-icon", game.icon));
  }
  cover.appendChild(makeElement("span", "cover-title", game.title));
  cover.appendChild(createLibraryButton(game.id));
  card.appendChild(cover);

  // ----- ส่วนรายละเอียดใต้ปก -----
  const info = makeElement("div", "game-info");

  const titleRow = makeElement("div", "game-title-row");
  titleRow.appendChild(makeElement("h3", "game-title", game.title));
  titleRow.appendChild(createPriceBadge(game.price));
  info.appendChild(titleRow);

  const description = makeElement("p", "game-desc", game.description);
  description.title = game.description; // เอาเมาส์ชี้ค้างไว้ จะเห็นข้อความเต็ม
  info.appendChild(description);

  info.appendChild(makeElement("p", "game-author", "โดย " + game.author));
  info.appendChild(createAverageRating(game.id));
  info.appendChild(makeElement("p", "game-genre", game.genre));
  info.appendChild(createMyRating(game.id));

  // เกมที่มีหน้าเล่น (ช่อง url) → มีปุ่ม "เล่นเลย" และกดที่ปกเพื่อเข้าเกมได้
  if (game.url) {
    card.dataset.url = game.url;      // จดไว้ที่การ์ด ให้ handleGridClick รู้ว่าจะไปหน้าไหน
    card.classList.add("playable");   // ใช้ใน style.css ให้เมาส์เป็นรูปมือตอนชี้ปก
    const playLink = makeElement("a", "play-link", "▶ เล่นเลย");
    playLink.href = game.url;
    info.appendChild(playLink);
  }

  card.appendChild(info);
  return card;
}


/* ---------- 2) ชิ้นส่วนของการ์ด ---------- */

// ป้ายราคา: ราคา 0 → "ฟรี",  ราคาอื่น → "฿89"
function createPriceBadge(price) {
  const badge = makeElement("span", "price-badge");

  if (price === 0) {
    badge.textContent = "ฟรี";
  } else {
    badge.textContent = "฿" + price;
    badge.classList.add("paid"); // เกมเสียเงินใช้ป้ายสีเข้ม (ดูใน style.css)
  }
  return badge;
}

// คะแนนเฉลี่ยของทุกคน เช่น ★★★★☆ 4.3 (12)
// ยังไม่มีใครให้ดาว → ☆☆☆☆☆ ยังไม่มีคะแนน
function createAverageRating(gameId) {
  const rating = getRating(gameId); // จาก account.js → { average, count, mine }
  const row = makeElement("p", "game-rating");

  const stars = makeElement("span", "stars", makeStarText(rating.average));
  stars.title = "คะแนนเฉลี่ย " + rating.average + " จาก 5";
  row.appendChild(stars);

  if (rating.count === 0) {
    row.appendChild(makeElement("span", "rating-count", " ยังไม่มีคะแนน"));
  } else {
    row.appendChild(makeElement("span", "rating-count", " " + rating.average + " (" + rating.count + ")"));
  }
  return row;
}

// แปลงคะแนนเป็นดาว 5 ดวง เช่น 4.3 → "★★★★☆"
function makeStarText(score) {
  const fullStars = Math.round(score); // ปัดเศษเป็นจำนวนดาวเต็ม (สไลด์ Week 6: Math)
  let starText = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starText = starText + "★"; // ดาวเต็ม
    } else {
      starText = starText + "☆"; // ดาวว่าง
    }
  }
  return starText;
}

// แถว "ให้ดาว" มีปุ่มดาว 5 ปุ่ม — ดาวที่เราเคยให้ไว้จะเป็นสีแดง (class "on")
function createMyRating(gameId) {
  const mine = getRating(gameId).mine; // ยังไม่เคยให้ = 0
  const row = makeElement("div", "my-rating");

  let labelText = "ให้ดาว";
  if (mine > 0) {
    labelText = "ดาวของคุณ";
  }
  row.appendChild(makeElement("span", "my-rating-label", labelText));

  const starGroup = makeElement("span", "star-group");
  for (let i = 1; i <= 5; i++) {
    const star = makeElement("button", "star-btn", "★");
    star.type = "button";
    star.dataset.stars = i;                        // ปุ่มนี้ = ให้กี่ดาว
    star.title = "ให้ " + i + " ดาว";
    star.setAttribute("aria-label", "ให้ " + i + " ดาว"); // ให้โปรแกรมอ่านหน้าจออ่านได้
    if (i <= mine) {
      star.classList.add("on");
    }
    starGroup.appendChild(star);
  }
  row.appendChild(starGroup);
  return row;
}

// ปุ่ม "เก็บลง Library" บนปก
function createLibraryButton(gameId) {
  const button = makeElement("button", "library-btn");
  button.type = "button";

  const isSaved = getLibrary().includes(gameId); // getLibrary อยู่ใน account.js
  showLibraryState(button, isSaved);
  return button;
}

// เปลี่ยนข้อความและสีของปุ่ม ตามว่าเกมอยู่ใน Library แล้วหรือยัง
function showLibraryState(button, isSaved) {
  if (isSaved) {
    button.textContent = "✓ อยู่ใน Library";
    button.classList.add("saved");
  } else {
    button.textContent = "+ เก็บลง Library";
    button.classList.remove("saved");
  }
}


/* ---------- 3) จัดการการคลิกบนการ์ด ---------- */

// ทำงานทุกครั้งที่มีการคลิกที่ไหนก็ได้ในกล่องการ์ดเกม
function handleGridClick(event) {
  const clicked = event.target; // สิ่งที่ถูกคลิกจริง ๆ (สไลด์ Week 7: event.target)

  // closest() หา element แม่ที่ตรงกับชื่อ class ที่ให้ไป (ไม่เจอได้ null)
  const card = clicked.closest(".game-card");
  if (card === null) {
    return; // คลิกโดนช่องว่างระหว่างการ์ด
  }
  const gameId = Number(card.dataset.gameId); // "1" (ข้อความ) → 1 (ตัวเลข)

  if (clicked.classList.contains("library-btn")) {
    handleLibraryClick(clicked, gameId);
    return;
  }

  if (clicked.classList.contains("star-btn")) {
    handleStarClick(card, gameId, Number(clicked.dataset.stars));
    return;
  }

  // คลิกที่ปกของเกมที่เล่นได้ → ไปหน้าเล่นเกม
  if (clicked.closest(".game-cover") !== null && card.dataset.url) {
    window.location.href = card.dataset.url;
  }
}

// กดปุ่ม "เก็บลง Library"
async function handleLibraryClick(button, gameId) {
  if (getCurrentUser() === null) {
    goToLogin(); // ยังไม่ล็อกอิน → ไปหน้าเข้าสู่ระบบ (common.js)
    return;
  }

  button.disabled = true;                    // กันกดซ้ำระหว่างรอฐานข้อมูล
  const error = await toggleLibrary(gameId); // account.js: บันทึกลงฐานข้อมูล
  button.disabled = false;

  if (error !== null) {
    alert(error);
    return;
  }
  showLibraryState(button, getLibrary().includes(gameId));
}

// กดดาวดวงที่ 1–5
async function handleStarClick(card, gameId, stars) {
  if (getCurrentUser() === null) {
    goToLogin();
    return;
  }

  const error = await rateGame(gameId, stars); // account.js: บันทึกดาวลงฐานข้อมูล
  if (error !== null) {
    alert(error);
    return;
  }

  // คะแนนเฉลี่ยเปลี่ยน → สร้างแถวคะแนนเฉลี่ยใหม่มาแทนแถวเดิม
  card.querySelector(".game-rating").replaceWith(createAverageRating(gameId));

  // ระบายสีดาวของเราใหม่: ดวงที่ 1 ถึงดวงที่กด → ใส่ class "on" (สีแดง), ดวงที่เหลือ → เอาออก
  // classList.toggle(ชื่อ, true/false) = true ใส่ class, false เอา class ออก
  for (const star of card.querySelectorAll(".star-btn")) {
    star.classList.toggle("on", Number(star.dataset.stars) <= stars);
  }
  card.querySelector(".my-rating-label").textContent = "ดาวของคุณ";
}
