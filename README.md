# SSyba — เว็บรวมเกม (ขั้นที่ 3: สมาชิก, Library, ให้ดาว เก็บใน Supabase)

หน้าเว็บแสดงการ์ดเกมเป็นตาราง คล้ายหน้ารวมเกมของเว็บขายเกมอินดี้
สมัครสมาชิก / เข้าสู่ระบบ แล้วเก็บเกมที่ชอบลง **Library** และ **ให้ดาว** เกมได้
เพิ่มเกมได้ที่ `js/games-data.js` (มีตัวอย่างให้คัดลอกในไฟล์)

ตอนนี้มีเกม 4 เกม อยู่ในโฟลเดอร์ `games/` กดที่ปกเกมหรือปุ่ม **▶ เล่นเลย** เพื่อเข้าไปเล่น

| เกม | โฟลเดอร์ | ผู้สร้าง / ที่มา |
|---|---|---|
| **Submarine vs Fish** (เกม Unity ที่ build เป็นเว็บ) | `games/submarine-vs-fish/` | ทีมของเรา |
| **Fishaviour** | `games/fishaviour/` | Blue-Phoenix82 — https://github.com/Blue-Phoenix82/fishaviour |
| **Abyssal Garden** | `games/abyssal-garden/` | Maksymilian Dendura (Noniv) — https://github.com/Noniv/abyssal-garden |
| **FEED-FISH** | `games/feed-fish/` | Vishnu Pradeep — https://github.com/pradeep-vishnu/The-Game-Name-is-FEED-FISH |

สามเกมหลังเป็นเกมของคนอื่นที่ใช้ **MIT License** ซึ่งอนุญาตให้นำมาใช้ได้ โดยต้องเก็บไฟล์ `LICENSE` ในโฟลเดอร์ของแต่ละเกมไว้ ห้ามลบ

## เว็บออนไลน์

เปิดได้ตลอดเวลาที่ **https://wxsan999-sketch.github.io/ssyba/** (โฮสต์ฟรีด้วย GitHub Pages)

แก้ไฟล์แล้วอยากให้เว็บออนไลน์อัปเดตตาม: commit แล้ว `git push` ขึ้น branch `main`
GitHub จะอัปเดตเว็บให้เองภายใน 1–2 นาที

## สำหรับเพื่อนที่ช่วยแก้เว็บ

**ก่อนเริ่ม:** ต้องมีบัญชี GitHub และกดรับคำเชิญที่ https://github.com/wxsan999-sketch/ssyba/invitations ก่อน
(คำเชิญหมดอายุใน 7 วัน ถ้าหมดแล้วให้เจ้าของ repo เชิญใหม่)
ทุกอย่างที่แก้แล้วกด commit / push จะขึ้นเว็บจริงทันทีภายใน 1–2 นาที

### วิธีที่ 1: แก้บนเว็บ GitHub (ง่ายสุด ไม่ต้องลงโปรแกรม)

- **แก้ไฟล์:** เปิดไฟล์ใน https://github.com/wxsan999-sketch/ssyba → กดรูปดินสอ ✏️ → แก้ → กด **Commit changes**
- **อัปโหลดไฟล์:** เข้าโฟลเดอร์ที่ต้องการ → **Add file** → **Upload files** → ลากไฟล์มาวาง → กด **Commit changes**
- อัปโหลดผ่านเว็บได้ **ไฟล์ละไม่เกิน 25 MB** ไฟล์เกม Unity ส่วนใหญ่ใหญ่กว่านี้ ต้องใช้วิธีที่ 2

### วิธีที่ 2: ใช้ git ในเครื่อง (ไฟล์ใหญ่ได้ถึง 100 MB)

ครั้งแรก ดาวน์โหลดโปรเจคมาที่เครื่อง:

```bash
git clone https://github.com/wxsan999-sketch/ssyba.git
```

ทุกครั้งที่จะแก้:

```bash
git pull
```
(ดึงของที่เพื่อนแก้ล่าสุดมาก่อน **สำคัญมาก** ไม่งั้นจะชนกัน)

แก้เสร็จแล้วส่งขึ้น GitHub:

```bash
git add -A
git commit -m "บอกสั้น ๆ ว่าแก้อะไร"
git push
```

ถ้า `git push` ไม่ผ่านเพราะมีคนแก้ก่อน → สั่ง `git pull` แล้ว `git push` อีกครั้ง

### ข้อตกลงร่วมกัน

- แบ่งกันแก้คนละไฟล์ ถ้าแก้ไฟล์เดียวกันพร้อมกันจะชนกัน (โดยเฉพาะ `js/games-data.js` ให้บอกกันก่อนแก้)
- ไฟล์ละห้ามเกิน 100 MB และทั้ง repo รวมกันไม่ควรเกิน 1 GB
- เกม Unity ที่ใหญ่ ให้แยกไปไว้ repo ของตัวเอง หรือขึ้น itch.io แล้วใส่ลิงก์ใน `js/games-data.js`
- ห้ามใส่รหัสผ่าน, API key หรือข้อมูลส่วนตัวในไฟล์ เพราะ repo นี้เปิดให้ทุกคนเห็น
  (ยกเว้น Publishable key ของ Supabase ใน `js/supabase-config.js` ซึ่งเปิดเผยได้ ดูหัวข้อ "เรื่อง key")

## วิธีเปิดในเครื่อง

- ใน VS Code คลิกขวาที่ `index.html` → **Open with Live Server** (แนะนำ)
- ดับเบิลคลิก `index.html` ก็เปิดหน้ารวมเกมได้ แต่ **จะเข้าเล่นเกม Unity ไม่ได้**
  เพราะเบราว์เซอร์ไม่ยอมให้หน้าที่เปิดจากไฟล์ในเครื่อง (`file://`) โหลดไฟล์เกมขนาดใหญ่ ต้องเปิดผ่านเว็บเซิร์ฟเวอร์อย่าง Live Server

## ฐานข้อมูล (Supabase)

ข้อมูลสมาชิก, Library และดาว เก็บในฐานข้อมูล **Supabase** (PostgreSQL บนคลาวด์)
ทุกคนที่เข้าเว็บเห็นข้อมูลชุดเดียวกัน ไม่ว่าจะเปิดจากเครื่องไหน

| เก็บอะไร | อยู่ที่ไหนใน Supabase |
|---|---|
| อีเมล, รหัสผ่าน | **Authentication → Users** (Supabase เข้ารหัสรหัสผ่านให้เอง คนอื่นดูอีเมลผ่านเว็บไม่ได้) |
| ข้อมูลผู้ใช้ (ชื่อผู้ใช้, วันที่สมัคร) | **Table Editor → profiles** (สร้างแถวให้อัตโนมัติตอนสมัคร ด้วย trigger) |
| เกมใน Library | **Table Editor → library** |
| ชื่อเกม (id + ชื่อ ไว้ให้ตารางสรุปโชว์ชื่อ) | **Table Editor → games** |
| **สรุป:** ผู้ใช้แต่ละคนมีเกมไหนใน Library | **Table Editor → profiles_library** (View) |
| **สรุป:** แต่ละเกม ใครให้กี่ดาว, ดาวรวม, ค่าเฉลี่ย | **Table Editor → game_ratings** (View) |
| ดาวที่ให้แต่ละเกม | **Table Editor → ratings** |

View คือตารางสรุปที่คำนวณจากตารางอื่นทุกครั้งที่เปิดดู ไม่ต้องอัปเดตเอง และดูได้ใน Dashboard เท่านั้น (หน้าเว็บอ่านไม่ได้)

**เพิ่มเกมใหม่:** ใส่ใน `js/games-data.js` แล้วเพิ่มแถวในตาราง **games** ด้วย (id ต้องตรงกัน)
ถ้าลืมเพิ่มในตาราง games เว็บยังใช้ได้ปกติ แค่ตารางสรุปจะโชว์เป็น "เกม #id" แทนชื่อ

โค้ดที่คุยกับ Supabase อยู่ใน `js/account.js` ไฟล์เดียว
หน้าเว็บคุยกับ Supabase ตรง ๆ ด้วย supabase-js (ไม่ต้องมี server ของเราเอง จึงยังโฮสต์บน GitHub Pages ได้)

### ตั้งค่าครั้งแรก (ทำครั้งเดียว)

1. **สร้างตาราง:** Supabase Dashboard → **SQL Editor** → New query → คัดลอกไฟล์ `supabase/schema.sql` ทั้งหมดไปวาง → กด **Run**
   (แก้ไฟล์นี้เมื่อไร ก็รันทั้งไฟล์ซ้ำได้ ข้อมูลเดิมไม่หาย)
2. **ใส่ key:** Dashboard → **Project Settings → API Keys** → คัดลอก **Publishable key** (ขึ้นต้นด้วย `sb_publishable_`)
   ไปใส่ใน `js/supabase-config.js`
3. **การยืนยันอีเมล** (Authentication → Sign In / Providers → Email → **Confirm email**):
   - ปิด → สมัครแล้วล็อกอินได้ทันที (สะดวกตอนพัฒนา/ทดสอบ)
   - เปิด → ต้องกดลิงก์ในอีเมลก่อน และต้องตั้ง **Authentication → URL Configuration → Site URL**
     เป็น `https://wxsan999-sketch.github.io/ssyba/` ไม่งั้นลิงก์ในอีเมลจะพาไปผิดที่
     (อีเมลของ Supabase แบบฟรีส่งได้ไม่กี่ฉบับต่อชั่วโมง)

### เรื่อง key

- **Publishable key** ใส่ในหน้าเว็บและขึ้น GitHub ได้ ออกแบบมาให้คนอื่นเห็นได้
  ความปลอดภัยอยู่ที่กฎ Row Level Security ใน `supabase/schema.sql`
  (เช่น ดู/แก้ Library ได้เฉพาะของตัวเอง, ให้ดาวได้เฉพาะในชื่อตัวเอง)
- **Secret key / service_role ห้ามใส่ในไฟล์ไหนเด็ดขาด** key นี้ข้ามกฎทุกข้อได้

## อัปเดตเกม Submarine vs Fish

build ใหม่ใน Unity (เมนู **Build > Web Build**) แล้วคัดลอกไฟล์ใน `Testgame\web\` ทั้งหมด
มาทับใน `games/submarine-vs-fish/`

## ไฟล์ในโปรเจค

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าแรก "เกมทั้งหมด" |
| `library.html` | หน้า "Library ของฉัน" (ต้องล็อกอินก่อน) |
| `login.html` | หน้าเข้าสู่ระบบ |
| `register.html` | หน้าสมัครสมาชิก |
| `css/style.css` | การตกแต่งทั้งหมด (สี, Grid, ฟอร์ม, เอฟเฟกต์ตอนชี้เมาส์, Responsive) |
| `js/games-data.js` | ข้อมูลเกม (Array ของ Object) — **เพิ่ม/แก้เกมที่ไฟล์นี้** |
| `js/supabase-config.js` | ที่อยู่และ Publishable key ของฐานข้อมูล Supabase |
| `js/account.js` | ระบบบัญชีผู้ใช้: สมัคร, เข้าสู่ระบบ, ออกจากระบบ, Library, ดาว (คุยกับ Supabase) |
| `supabase/schema.sql` | คำสั่ง SQL สร้างตาราง `profiles`, `library`, `ratings`, `games`, ตารางสรุป `profiles_library` / `game_ratings`, trigger สร้างโปรไฟล์ และกฎความปลอดภัย (รันใน Supabase SQL Editor) |
| `js/common.js` | ฟังก์ชันใช้ร่วมกันทุกหน้า: สร้าง element, โชว์ชื่อผู้ใช้ที่ส่วนหัว |
| `js/cards.js` | สร้างการ์ดเกม และจัดการปุ่มบนการ์ด (Library, ให้ดาว, เล่นเกม) |
| `js/main.js` | โค้ดของหน้าแรก |
| `js/library.js` | โค้ดของหน้า Library |
| `js/login.js` | โค้ดของหน้าเข้าสู่ระบบ |
| `js/register.js` | โค้ดของหน้าสมัครสมาชิก |
| `games/submarine-vs-fish/` | ตัวเกม Submarine vs Fish (ไฟล์จาก Unity อย่าแก้ด้วยมือ) |
| `games/fishaviour/`, `games/abyssal-garden/`, `games/feed-fish/` | เกมจาก GitHub (MIT) ก๊อปมาทั้งชุด มี `LICENSE` ของเจ้าของอยู่ข้างใน |
| `.nojekyll` | บอก GitHub Pages ให้ส่งไฟล์ตามที่เป็น ไม่ต้องแปลงด้วย Jekyll |
| `.gitattributes` | บอก git ว่าไฟล์เกม Unity เป็น binary ห้ามแปลงบรรทัด |

## สิ่งที่ควรทดสอบ

1. ยังไม่ล็อกอิน → มุมขวาบนมีปุ่ม "เข้าสู่ระบบ" และ "สมัครสมาชิก"
2. กด "+ เก็บลง Library" หรือกดดาว ตอนยังไม่ล็อกอิน → ถูกพาไปหน้าเข้าสู่ระบบ พร้อมข้อความบอกว่าต้องล็อกอินก่อน
3. สมัครสมาชิก: ลองใส่รหัสผ่านสองช่องไม่ตรงกัน / รหัสสั้นกว่า 6 ตัว / อีเมลที่สมัครแล้ว → ขึ้นข้อความเตือน
4. สมัครสำเร็จ → กลับหน้าแรก มุมขวาบนขึ้นชื่อผู้ใช้ + ปุ่ม "ออกจากระบบ"
5. ชี้เมาส์ที่การ์ด → มีปุ่ม "+ เก็บลง Library" กดแล้วเปลี่ยนเป็น "✓ อยู่ใน Library" (สีแดง) กดอีกครั้งเพื่อเอาออก
6. เมนู **Library** → เห็นเฉพาะเกมที่เก็บไว้ (ไม่มีเลย → ขึ้นข้อความแนะนำ)
7. ชี้เมาส์ที่ดาวในแถว "ให้ดาว" → ดาวสีแดงตามดวงที่ชี้ กดแล้วคะแนนเฉลี่ยด้านบนเปลี่ยนทันที
8. ออกจากระบบ แล้วสมัครอีกบัญชี ให้ดาวเกมเดียวกัน → คะแนนเฉลี่ยคิดจากทั้งสองบัญชี
9. ออกจากระบบ → เข้าสู่ระบบด้วยบัญชีเดิม → Library และดาวของบัญชีนั้นยังอยู่ (ใส่รหัสผิด → ขึ้น "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
10. กด F5 รีเฟรช → ยังล็อกอินอยู่ ข้อมูลไม่หาย
11. เปิดเว็บจากอีกเครื่อง/อีกเบราว์เซอร์ แล้วล็อกอินบัญชีเดิม → เห็น Library และดาวเหมือนกัน
12. เปิด Supabase Dashboard → Table Editor → `profiles` มีแถวของคนที่สมัคร และ `library` / `ratings` มีแถวตามที่กด
13. ย่อหน้าต่างให้แคบ → จำนวนคอลัมน์ลดลงเอง จอมือถือเหลือ 1 คอลัมน์

## เนื้อหาที่ใช้จากสไลด์

| สัปดาห์ | ใช้ตรงไหน |
|---|---|
| Week 3 | Box model, Flexbox (ส่วนหัว, ฟอร์ม), position absolute (ปุ่มบนปก), transition / transform / shadow, `:hover` `:focus` `:active` |
| Week 4 | Viewport, CSS Grid `repeat(auto-fill, minmax())`, Media Query แบบ Mobile-First, หน่วย `rem` |
| Week 5 | ตัวแปร `let`/`const`, `if`/`else`, ฟังก์ชัน, `window.onload`, `getElementById`, ฟอร์มและ event `submit` |
| Week 6 | Array ของ Object (ข้อมูลเกม), `for...of`, `Math.round`, `push`/`unshift`/`splice`/`indexOf`, localStorage |
| Week 7 | `createElement`, `appendChild`, `textContent`, `classList`, `dataset`, style object, Event Delegation (`event.target`) |
| Week 8 | `async` / `await` รอข้อมูลจากฐานข้อมูล, ข้อมูล JSON ที่ได้กลับมาจาก Supabase |
| Week 11 | ตารางฐานข้อมูล: `CREATE TABLE`, `PRIMARY KEY`, `FOREIGN KEY` (`references`), `INSERT` / `SELECT` / `UPDATE` / `DELETE` (ใน `account.js` มีคอมเมนต์ SQL ที่เทียบเท่ากำกับไว้) |
| Week 12 | การจำการล็อกอิน (Supabase เก็บ session ไว้ในเบราว์เซอร์ให้) |

## ขั้นต่อไป

1. ล็อกอินด้วย Gmail: เปิด Google ใน Supabase (Authentication → Sign In / Providers → Google)
   ต้องสร้าง Google OAuth Client ID ใน Google Cloud Console แล้วเพิ่มปุ่มที่เรียก `db.auth.signInWithOAuth({ provider: "google" })`
2. หน้า Profile, กระดานอันดับ (leaderboard), คอมเมนต์ และแชทสด ตามที่โปรเจคกำหนด

> โฟลเดอร์ `.claude/` เป็นไฟล์ตั้งค่าสำหรับเปิดดูตัวอย่างใน Claude เท่านั้น ไม่เกี่ยวกับตัวเว็บ
