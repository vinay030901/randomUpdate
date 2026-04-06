require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log("🚀 Starting bot...");

    // ================= LOGIN =================
    await page.goto('https://www.naukri.com');

    await page.getByRole('link', { name: 'Login', exact: true }).click();

    await page.getByRole('textbox', { name: /Email/ }).fill(process.env.EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(process.env.PASSWORD);

    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await page.waitForTimeout(5000);

    // ================= LOOP =================
    while (true) {

        try {
            console.log("🔁 Updating profile...");

            // Go to profile
            await page.goto('https://www.naukri.com/mnjuser/profile');
            await page.waitForTimeout(5000);

            // 🔥 Close popup if exists
            try {
                await page.locator('.crossLayer .icon').click({ timeout: 3000 });
                console.log("Popup closed");
            } catch (e) { }

            // ================= CLICK EDIT =================
            const editBtn = page.locator('#lazyResumeHead span.edit');

            await editBtn.waitFor({ timeout: 10000 });
            await editBtn.click();

            // ================= UPDATE TEXT =================
            const textarea = page.locator('#resumeHeadlineTxt');

            await textarea.waitFor();

            let text = await textarea.inputValue();

            // Toggle dot (same logic as your Selenium)
            text = text.endsWith('.') ? text.slice(0, -1) : text + '.';

            await textarea.fill(text);

            // ================= SAVE =================
            await page.locator('form[name="resumeHeadlineForm"] button[type="submit"]').click();

            console.log("✅ Profile updated:", text);

            // 🔥 Close popup again if appears
            try {
                await page.locator('.crossLayer .icon').click({ timeout: 3000 });
            } catch (e) { }

        } catch (err) {
            console.log("❌ Error in update cycle:", err.message);
        }

        // ================= WAIT =================
        const delay = (25 + Math.random() * 10) * 60 * 1000;
        console.log(`⏳ Waiting ${Math.round(delay / 60000)} minutes...`);
        await page.waitForTimeout(delay);
    }

})();