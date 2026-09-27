# اجرای AI عمومی Infinite Realms

1. فایل‌های وب ZIP را در ریشه مخزن GitHub بارگذاری کن.
2. از https://console.groq.com یک API Key بساز و محدودیت‌های حساب را بررسی کن.
3. در Cloudflare Workers کد cloudflare-worker/worker.js را Deploy کن یا با Wrangler در همان پوشه npx wrangler deploy اجرا کن.
4. در تنظیمات Worker، متغیر محرمانه GROQ_API_KEY را بساز. کلید را هرگز در GitHub نگذار.
5. ALLOWED_ORIGIN را روی https://mr-aiza.github.io بگذار؛ AI_MODEL را با مدل موجود در حساب Groq هماهنگ کن.
6. در بخش DM سایت، آدرس HTTPS مربوط به Worker را وارد کن و «بررسی اتصال» را بزن.

هشدار: این نمونه برای راه‌اندازی اولیه است. CORS به‌تنهایی مانع سوءاستفاده نمی‌شود. پیش از انتشار عمومی Turnstile، سهمیه و محدودیت درخواست سمت سرور، مانیتورینگ هزینه و سیاست حریم خصوصی اضافه کن. متن کمپین به Groq ارسال می‌شود و استفاده نامحدود رایگان تضمین نشده است.
