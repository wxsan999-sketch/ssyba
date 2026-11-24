/* =====================================================================
   supabase-config.js — ที่อยู่ของฐานข้อมูล Supabase ที่เว็บนี้ใช้

   หาค่าได้ที่ Supabase Dashboard → Project Settings → API Keys

   ใส่ได้เฉพาะ "Publishable key" (ขึ้นต้นด้วย sb_publishable_) เท่านั้น
     key นี้ออกแบบมาให้อยู่ในหน้าเว็บได้ ใคร ๆ เห็นก็ไม่เป็นไร
     เพราะฐานข้อมูลมีกฎความปลอดภัย (ดู supabase/schema.sql) คุมอยู่

   ⚠ ห้ามใส่ "Secret key" หรือ "service_role" ที่นี่เด็ดขาด
     key พวกนั้นข้ามกฎความปลอดภัยได้ทั้งหมด ถ้าหลุดขึ้น GitHub ใครก็ลบข้อมูลได้
   ===================================================================== */

const SUPABASE_URL = "https://ppiemzkqcioeewllxlut.supabase.co";
const SUPABASE_KEY = "sb_publishable_11OW7Nr30wrhFnOEqKQJ8w_TSNr4sz0";
