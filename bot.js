require('dotenv').config();
const { chromium } = require('playwright');


(async () => {

    const browser = await chromium.launch({
        headless: false, // 🔥 set false for debugging
    });

    const page = await browser.newPage();

    console.log("🚀 Bot started at:", new Date().toISOString());

    // ================= LOGIN FUNCTION =================
    async function login() {
        console.log("🔐 Checking login status...");

        await page.goto('https://www.naukri.com');
        await page.waitForTimeout(3000);

        // Check if Login button exists
        const loginBtn = page.getByRole('link', { name: 'Login', exact: true });

        if (await loginBtn.isVisible().catch(() => false)) {

            console.log("🔐 Logging in...");

            await loginBtn.click();

            await page.getByRole('textbox', { name: /Email/ }).fill(process.env.EMAIL);
            await page.getByRole('textbox', { name: /password/i }).fill(process.env.PASSWORD);

            await page.getByRole('button', { name: 'Login', exact: true }).click();

            await page.waitForTimeout(5000);

            console.log("✅ Logged in");

        } else {
            console.log("✅ Already logged in, skipping login");
        }
    }

    // ================= POPUP HANDLER =================
    async function closePopup() {
        try {
            await page.locator('.crossLayer .icon').click({ timeout: 3000 });
            console.log("❌ Popup closed");
        } catch (e) { }
    }

    // ================= UPDATE FUNCTION =================
    async function updateProfile() {

        console.log("🔁 Updating profile...");

        await page.goto('https://www.naukri.com/mnjuser/profile');
        await page.waitForTimeout(5000);

        await closePopup();

        // Click Edit (Resume Headline)
        const editBtn = page.locator('#lazyResumeHead span.edit');

        await editBtn.waitFor({ timeout: 10000 });
        await editBtn.click({ force: true });

        // Textarea
        const textarea = page.locator('#resumeHeadlineTxt');
        await textarea.waitFor();

        let text = await textarea.inputValue();

        // Toggle dot logic
        text = text.endsWith('.') ? text.slice(0, -1) : text + '.';

        await textarea.fill(text);

        // Save (scoped to correct form)
        await page.locator('form[name="resumeHeadlineForm"] button[type="submit"]').click();

        console.log("✅ Profile updated:", text);

        await closePopup();
    }

    // ================= MAIN FLOW =================

    await login();

    while (true) {

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {

                // 🔥 Check session (auto re-login)
                if (page.url().includes('login')) {
                    console.log("⚠️ Session expired. Re-logging...");
                    await login();
                }

                await updateProfile();

                break; // success → exit retry loop

            } catch (err) {
                console.log(`❌ Attempt ${attempt} failed:`, err.message);

                if (attempt === 3) {
                    console.log("🚨 Skipping this cycle...");
                } else {
                    console.log("🔄 Retrying in 5 seconds...");
                    await page.waitForTimeout(5000);
                }
            }
        }

        // ================= RANDOM DELAY =================
        const delay = (25 + Math.random() * 10) * 60 * 1000;

        console.log(
            `⏳ Waiting ${Math.round(delay / 60000)} minutes...`
        );

        await page.waitForTimeout(delay);
    }

})();