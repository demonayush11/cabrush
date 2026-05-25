import { chromium } from 'playwright';

export async function launchBrowser(platform) {
  const headless = process.env.HEADLESS === 'true';
  console.log(`[${platform}] Launching browser (headless=${headless})`);

  const browser = await chromium.launch({
    headless,
    slowMo: 50,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'en-IN',
    geolocation: { latitude: 23.3441, longitude: 85.3096 },
    permissions: ['geolocation'],
  });

  const page = await context.newPage();
  return { browser, context, page };
}

export async function waitForOtp(page, platform, seconds = 30) {
  console.log(`[${platform}] OTP screen detected — waiting ${seconds}s for manual entry...`);
  await page.waitForTimeout(seconds * 1000);
}

export async function tryClick(page, selectors, label) {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 3000 })) {
        await el.click();
        console.log(`[${label}] Clicked: ${selector}`);
        return true;
      }
    } catch {
      /* try next selector */
    }
  }
  console.log(`[${label}] Could not find element for: ${selectors[0]}`);
  return false;
}

export async function tryFill(page, selectors, value, label) {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 3000 })) {
        await el.click();
        await el.fill(value);
        console.log(`[${label}] Filled "${value}" into: ${selector}`);
        return true;
      }
    } catch {
      /* try next selector */
    }
  }
  console.log(`[${label}] Could not fill: ${selectors[0]}`);
  return false;
}

export async function trySelectSuggestion(page, label) {
  const suggestionSelectors = [
    '[role="option"]',
    '.pac-item',
    'li[role="option"]',
    '[data-testid*="suggestion"]',
    '.suggestion-item',
    'ul li',
  ];
  await page.waitForTimeout(1500);
  for (const selector of suggestionSelectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.click();
        console.log(`[${label}] Selected suggestion: ${selector}`);
        return true;
      }
    } catch {
      /* try next selector */
    }
  }
  return false;
}

export async function detectOtpScreen(page) {
  const otpSelectors = [
    'input[type="tel"]',
    'input[name*="otp" i]',
    'input[placeholder*="OTP" i]',
    'input[placeholder*="code" i]',
    '[data-testid*="otp"]',
  ];
  for (const selector of otpSelectors) {
    try {
      if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
        return true;
      }
    } catch {
      /* continue */
    }
  }
  return false;
}
