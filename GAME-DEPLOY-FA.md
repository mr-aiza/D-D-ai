# نسخه بازی Infinite Realms — نصب و انتشار خودکار

## ۱. انتشار رابط بازی
همه فایل‌های ZIP را در ریشه مخزن `mr-aiza/D-D-ai` قرار بده؛ فایل‌های قبلی را حذف نکن. GitHub Pages باید از `main` و `/ (root)` منتشر شود. صفحه «شروع بازی» به‌صورت پیش‌فرض باز می‌شود. رابط جدید، صفحات قدیمی ساخت کمپین و قهرمان را حفظ می‌کند.

## ۲. دیتابیس ذخیره بازی در Cloudflare D1
در Cloudflare > Storage & databases > D1 یک دیتابیس به نام `infinite-realms-saves` بساز. شناسه Database ID را کپی و در `cloudflare-worker/wrangler.toml` جایگزین `YOUR_D1_DATABASE_ID` کن. از Cloudflare dashboard در Console دیتابیس، متن `cloudflare-worker/schema.sql` را اجرا کن؛ یا با Wrangler دستور `npx wrangler d1 execute infinite-realms-saves --remote --file=./schema.sql` را از پوشه cloudflare-worker اجرا کن. سپس Worker را یک‌بار Deploy کن.

## ۳. انتشار خودکار Worker پس از هر Push
در GitHub مخزن، Settings > Secrets and variables > Actions دو Repository secret بساز:
- `CLOUDFLARE_API_TOKEN`: توکن Cloudflare با حداقل دسترسی Edit برای Workers Scripts و D1 موردنیاز.
- `CLOUDFLARE_ACCOUNT_ID`: شناسه حساب Cloudflare.
فایل `.github/workflows/deploy-worker.yml` بعد از هر Push که پوشه `cloudflare-worker` را تغییر دهد، Worker را خودکار Deploy می‌کند. از GitHub > Actions می‌توانی نتیجه را ببینی. کلید `GROQ_API_KEY` را فقط در Cloudflare Worker Secrets نگه دار، نه GitHub.

## ۴. اتصال AI
در Worker Settings > Variables and Secrets مقدار `GROQ_API_KEY` را به‌صورت Secret نگه دار. `AI_MODEL` را با مدل فعال در Groq تنظیم کن (مثلاً `openai/gpt-oss-120b` در صورت دسترسی). `ALLOWED_ORIGIN` برای GitHub Pages فعلی `https://mr-aiza.github.io` است. آدرس Worker در فایل game.js از قبل روی `https://dandd.bytelab.workers.dev` تنظیم شده است.

## ۵. محدودیت‌های نسخه اول
ذخیره ابری با شناسه تصادفی مخصوص همان مرورگر انجام می‌شود؛ حساب کاربری و همگام‌سازی بین دستگاه‌ها هنوز وجود ندارد. برای حفظ پیشرفت از دکمه «پشتیبان بازی» استفاده کن. روایت هوشمند است، اما نتیجه نبرد، موجودی و HP هنوز به‌صورت خودکار از متن AI استخراج نمی‌شوند. قبل از عمومی‌کردن، برای API عمومی AI احراز هویت/Turnstile، rate limiting و سقف هزینه لازم است؛ CORS به‌تنهایی جلوی سوءاستفاده را نمی‌گیرد.
