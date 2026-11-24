/* =====================================================================
   games-data.js — ข้อมูลเกมทั้งหมดที่แสดงบนหน้าเว็บ

   เก็บเป็น Array ของ Object (สไลด์ Week 6): 1 Object { ... } = 1 เกม
   ถ้าไม่มีเกมเลย → หน้าเว็บจะขึ้นข้อความ "ยังไม่มีเกม"

   วิธีเพิ่มเกม: คัดลอกตัวอย่างด้านล่าง ไปวางไว้ระหว่าง [ และ ] ของ GAMES
                แล้วแก้ข้อมูล (ใส่ , คั่นระหว่างแต่ละเกม และ id ห้ามซ้ำ)

     {
       id: 1,
       title: "ชื่อเกม",
       description: "คำอธิบายสั้น ๆ",
       author: "ชื่อผู้สร้าง",
       price: 0,
       genre: "Simulation",
       icon: "🎮",
       color1: "#f6d365",
       color2: "#c2410c"
     }

   ความหมายของแต่ละช่อง:
     id             เลขประจำเกม (ห้ามซ้ำกัน)
     title          ชื่อเกม
     description    คำอธิบายสั้น ๆ
     author         ผู้สร้างเกม / ชื่อสตูดิโอ
     price          ราคา (บาท) — ถ้าเป็น 0 จะแสดงว่า "ฟรี"
     genre          แนวเกม
     icon           อีโมจิที่แสดงบนปกเกม
     color1, color2 สีไล่เฉดของปก (มุมซ้ายบน → มุมขวาล่าง)
     url            (ไม่ใส่ก็ได้) หน้าเล่นเกม — ใส่แล้วกดที่ปกหรือปุ่ม "เล่นเลย" เพื่อเข้าเกม

   ดาวของเกมไม่ต้องใส่ที่นี่ — มาจากที่ผู้ใช้กดให้ดาว (ดู js/account.js)

   เพิ่มเกมใหม่แล้ว → เพิ่ม id + ชื่อเกม ในตาราง games ของ Supabase ด้วย
   (Table Editor → games → Insert row) ตารางสรุปใน Supabase จะได้โชว์ชื่อเกมถูก

   ขั้นต่อไปของโปรเจค: ย้ายข้อมูลชุดนี้ไปเก็บในฐานข้อมูล (Week 11–12)
   แล้วให้ server (Express) ส่งออกมาทาง API เช่น GET /api/games (Week 10)
   ===================================================================== */

const GAMES = [
  {
    id: 3,
    title: "Sea Farm",
    description: "เพาะสาหร่าย เติมสารอาหาร แล้วเก็บเกี่ยวเมื่อโตเต็มที่ หรือออกแบบแนวปะการังและบันทึกฟาร์มใต้ทะเลของคุณ",
    author: "ดัดแปลงจากเอนจินของ Leo Castellanos",
    price: 0,
    genre: "Simulation · ฟาร์มใต้ทะเล",
    cover: "games/sea-farm/images/sea-farm-cover.jpg",
    color1: "#146478",
    color2: "#073644",
    url: "games/sea-farm/"
  },
  {
    id: 1,
    title: "Submarine vs Fish",
    description: "เกม 2 ผู้เล่นบนคีย์บอร์ดเดียว เรือดำน้ำไล่จับปลา ปลาใช้สกิลหนีเอาตัวรอด ได้รู้จักสัตว์ทะเลลึกไปด้วย",
    author: "ทีม Submarine vs Fish",
    price: 0,
    genre: "Action · 2 ผู้เล่น",
    icon: "🐟",
    color1: "#38bdf8",
    color2: "#0b2545",
    url: "games/submarine-vs-fish/index.html"   // เกมที่ build จาก Unity (WebGL)
  },

  /* ---- เกมจากคนอื่นบน GitHub (MIT License: นำมาใช้ได้ แต่ต้องเก็บไฟล์ LICENSE ในโฟลเดอร์เกมไว้) ---- */

  {
    id: 2,
    title: "Fishaviour",
    description: "เกม 3D คุณคือปลาที่ต้องว่ายชนเพื่อน ๆ ให้หลุดจากเหยื่อของนักตกปลา 3 คนภายใน 60 วินาที ยิ่งโดนจับน้อยยิ่งดี (W A S D ว่าย, Shift เร่ง)",
    author: "Blue-Phoenix82",
    price: 0,
    genre: "Arcade 3D",
    icon: "🐠",
    color1: "#5eead4",
    color2: "#134e4a",
    url: "games/fishaviour/index.html"   // ที่มา: github.com/Blue-Phoenix82/fishaviour
  },
  {
    id: 4,
    title: "Abyssal Garden",
    description: "ว่ายสำรวจโลกใต้ทะเล 3D มีป่าสาหร่าย เรือจม และกระเบนราหู ทั้งโลกสร้างจากโค้ดในไฟล์เดียว (ต้องเปิดด้วย Chrome หรือ Edge บนคอมพิวเตอร์)",
    author: "Maksymilian Dendura (Noniv)",
    price: 0,
    genre: "Exploration 3D",
    icon: "🐋",
    color1: "#22d3ee",
    color2: "#1e1b4b",
    url: "games/abyssal-garden/index.html"   // ที่มา: github.com/Noniv/abyssal-garden
  },
  {
    id: 5,
    title: "FEED-FISH",
    description: "บังคับปลาดุกกระโดดขึ้นจากน้ำจับแมลงทอง หลบฉลามด้านล่างและแร้งด้านบน กดปุ่มอะไรก็ได้ คลิก หรือแตะจอเพื่อว่ายขึ้น",
    author: "Vishnu Pradeep",
    price: 0,
    genre: "Arcade · เล่นบนมือถือได้",
    icon: "🐡",
    color1: "#fbbf24",
    color2: "#0e7490",
    url: "games/feed-fish/index.html"   // ที่มา: github.com/pradeep-vishnu/The-Game-Name-is-FEED-FISH
  }
];
