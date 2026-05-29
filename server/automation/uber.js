import {
  launchBrowser,
  waitForOtp,
  tryClick,
  tryFill,
  trySelectSuggestion,
  detectOtpScreen,
} from '../utils/browser.js';
import { emitStatus } from '../utils/statusEmitter.js';

function update(sessionId, data) {
  emitStatus(sessionId, { platform: 'uber', ...data });
}

export async function bookUber({ pickup, drop, sessionId, credentials = {} }) {
  let browser;
  let cancelled = false;

  const cancel = async () => {
    cancelled = true;
    console.log('[uber] Running cancellation flow...');
    try {
      const cancelSelectors = [
        'button:has-text("Cancel")',
        'button:has-text("Cancel ride")',
        '[data-testid*="cancel"]',
        'a:has-text("Cancel")',
      ];
      await tryClick(page, cancelSelectors, 'uber-cancel');
      await page.waitForTimeout(1000);
      await tryClick(
        page,
        ['button:has-text("Yes")', 'button:has-text("Confirm")', 'button:has-text("Cancel ride")'],
        'uber-cancel-confirm'
      );
    } catch (err) {
      console.error('[uber] Cancel error:', err.message);
    }
  };

  let page;

  try {
    update(sessionId, { status: 'SEARCHING' });
    console.log('[uber] Starting Uber booking...');

    ({ browser, page } = await launchBrowser('uber'));

    await page.goto('https://m.uber.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Login flow
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[id*="email"]',
      '#phone-number-or-email-input',
    ];
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '#password-input',
    ];

    const email = credentials.identifier || process.env.UBER_EMAIL;
    const password = credentials.identifier ? credentials.secret : process.env.UBER_PASSWORD;

    if (await tryFill(page, emailSelectors, email, 'uber')) {
      await tryClick(
        page,
        ['button[type="submit"]', 'button:has-text("Continue")', 'button:has-text("Next")'],
        'uber-email-submit'
      );
      await page.waitForTimeout(2000);
    }

    if (await tryFill(page, passwordSelectors, password, 'uber')) {
      await tryClick(
        page,
        ['button[type="submit"]', 'button:has-text("Sign in")', 'button:has-text("Next")'],
        'uber-password-submit'
      );
      await page.waitForTimeout(3000);
    }

    if (await detectOtpScreen(page)) {
      update(sessionId, { status: 'SEARCHING', message: 'Enter OTP manually' });
      await waitForOtp(page, 'uber', 30);
    }

  // Pickup location
    const pickupSelectors = [
      'input[placeholder*="pick" i]',
      'input[placeholder*="Where to" i]',
      'input[data-testid*="pickup"]',
      '#pickup-input',
      'input[type="text"]',
    ];

    await tryClick(page, pickupSelectors, 'uber-pickup-focus');
    await tryFill(page, pickupSelectors, `${pickup}, Ranchi`, 'uber-pickup');
    await trySelectSuggestion(page, 'uber-pickup');
    await page.waitForTimeout(1500);

    // Drop location
    const dropSelectors = [
      'input[placeholder*="drop" i]',
      'input[placeholder*="Where to" i]',
      'input[data-testid*="dropoff"]',
      '#dropoff-input',
    ];

    await tryFill(page, dropSelectors, `${drop}, Ranchi`, 'uber-drop');
    await trySelectSuggestion(page, 'uber-drop');
    await page.waitForTimeout(2000);

    update(sessionId, { status: 'FOUND' });

    // Select UberGo or cheapest
    const rideSelectors = [
      'button:has-text("UberGo")',
      'div:has-text("UberGo")',
      'button:has-text("Go")',
      '[data-testid*="product"]',
      'li:has-text("UberGo")',
    ];
    await tryClick(page, rideSelectors, 'uber-select-ride');
    await page.waitForTimeout(1500);

    // Confirm booking
    const confirmSelectors = [
      'button:has-text("Confirm")',
      'button:has-text("Request")',
      'button:has-text("Book")',
      'button:has-text("Confirm UberGo")',
      '[data-testid*="confirm"]',
    ];
    await tryClick(page, confirmSelectors, 'uber-confirm');
    console.log('[uber] Booking confirmed, waiting for driver...');

    // Wait for driver confirmation
    const confirmedTexts = ['Driver found', 'Trip confirmed', 'Your driver', 'is on the way', 'arriving'];
    let confirmed = false;
    let eta = null;
    let driverName = null;

    for (let i = 0; i < 60 && !cancelled; i++) {
      const content = await page.content();
      for (const text of confirmedTexts) {
        if (content.toLowerCase().includes(text.toLowerCase())) {
          confirmed = true;
          break;
        }
      }
      if (confirmed) break;

      try {
        const etaEl = page.locator('text=/\\d+\\s*min/i').first();
        if (await etaEl.isVisible({ timeout: 1000 })) {
          eta = await etaEl.textContent();
        }
        const driverEl = page.locator('[data-testid*="driver"], .driver-name, h2, h3').first();
        if (await driverEl.isVisible({ timeout: 500 })) {
          driverName = await driverEl.textContent();
        }
      } catch {
        /* polling */
      }

      await page.waitForTimeout(3000);
    }

    if (cancelled) {
      return { status: 'cancelled', platform: 'uber' };
    }

    if (confirmed) {
      update(sessionId, { status: 'CONFIRMED', eta, driverName });
      return {
        status: 'confirmed',
        platform: 'uber',
        eta: eta || '5 mins',
        driverName: driverName || 'Driver assigned',
        cancel,
        browser,
        page,
      };
    }

    update(sessionId, { status: 'FAILED', message: 'Timeout waiting for confirmation' });
    return { status: 'failed', platform: 'uber', cancel, browser, page };

  } catch (err) {
    console.error('[uber] Error:', err.message);
    update(sessionId, { status: 'FAILED', message: err.message });
    return { status: 'failed', platform: 'uber', error: err.message };
  }
}

export default bookUber;
