import puppeteer from "puppeteer-core";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:5173/PMSM-Visualizations/";

async function runQA() {
  console.log("Launching Chrome for QA...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const consoleLogs = [];
  const errors = [];

  const page = await browser.newPage();

  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error" && !text.includes("favicon.ico") && !text.includes("Failed to load resource")) {
      errors.push(text);
    }
  });

  page.on("response", (res) => {
    if (res.status() >= 400 && !res.url().endsWith("favicon.ico")) {
      errors.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(`Page Error: ${err.message}`);
  });

  const viewports = [
    { width: 1280, height: 720, label: "1280x720" },
    { width: 1440, height: 900, label: "1440x900" },
  ];

  const mainSteps = [
    "remanence-strength",
    "coercivity-lock",
    "heat-demagnetisation",
    "dy-tb-tradeoff",
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const stepId of mainSteps) {
      await page.goto(`${BASE_URL}#why-the-magnet-needs-nd-dy-tb/${stepId}`, {
        waitUntil: "networkidle0",
      });

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      }));

      if (overflow.hasOverflow) {
        errors.push(
          `Document overflow detected at ${vp.label} on step ${stepId}: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`
        );
      }

      const screenshotPath = `/tmp/chapter3-${stepId}-${vp.width}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotPath} (overflow: ${overflow.hasOverflow})`);
    }

    // Now test labs launching from state 4 (dy-tb-tradeoff)
    await page.goto(`${BASE_URL}#why-the-magnet-needs-nd-dy-tb/dy-tb-tradeoff`, {
      waitUntil: "networkidle0",
    });

    // Test GBD Lab
    const gbdBtn = await page.waitForSelector("button.chapter3-control-button--quiet");
    if (gbdBtn) {
      await gbdBtn.click();
      await new Promise((r) => setTimeout(r, 250));

      const gbdScreenshot = `/tmp/chapter3-gbd-lab-${vp.width}.png`;
      await page.screenshot({ path: gbdScreenshot });
      console.log(`Saved GBD lab screenshot: ${gbdScreenshot}`);

      // Test Escape key focus restoration
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 250));

      const isFocused = await page.evaluate(() => document.activeElement?.textContent);
      console.log(`Focus after Escape from GBD lab: "${isFocused}"`);

      // Open Cooling Lab (second quiet button)
      const quietButtons = await page.$$("button.chapter3-control-button--quiet");
      if (quietButtons.length >= 2) {
        await quietButtons[1].click();
        await new Promise((r) => setTimeout(r, 250));

        const coolingScreenshot = `/tmp/chapter3-cooling-lab-${vp.width}.png`;
        await page.screenshot({ path: coolingScreenshot });
        console.log(`Saved Cooling lab screenshot: ${coolingScreenshot}`);

        // Click Compare SmCo
        const smcoBtn = await page.$("button.chapter3-control-button--quiet[aria-pressed='false']");
        if (smcoBtn) {
          await smcoBtn.click();
          await new Promise((r) => setTimeout(r, 250));
          const smcoScreenshot = `/tmp/chapter3-smco-card-${vp.width}.png`;
          await page.screenshot({ path: smcoScreenshot });
          console.log(`Saved SmCo card screenshot: ${smcoScreenshot}`);
        }

        // Click "Back to magnet" button
        const backBtn = await page.$(".chapter3-magnet__controls button:last-child");
        if (backBtn) {
          await backBtn.click();
          await new Promise((r) => setTimeout(r, 250));
        }

        const isFocusedAfterBack = await page.evaluate(() => document.activeElement?.textContent);
        console.log(`Focus after Back button from Cooling lab: "${isFocusedAfterBack}"`);
      }
    }
  }

  await browser.close();

  console.log("\n--- QA REPORT ---");
  console.log(`Total console logs: ${consoleLogs.length}`);
  console.log(`Total errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error("Errors found:", errors);
    process.exit(1);
  } else {
    console.log("SUCCESS: Zero errors and zero overflow across all viewports and scenes!");
  }
}

runQA().catch((err) => {
  console.error("QA Script error:", err);
  process.exit(1);
});
