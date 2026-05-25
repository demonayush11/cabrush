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
  emitStatus(sessionId, { platform: 'rapido', ...data });
}

export async function bookRapido({ pickup, drop, sessionId }) {
  let browser;
  let page;
  let cancelled = false;

  const cancel = async () => {
    cancelled = true;
    console.log('[rapido] Running cancellation flow...');
    try {
      await tryClick(
        page,
        ['button:has-text("Cancel")', 'a:has-text("Cancel")', '[class*="cancel"]'],
        'rapido-cancel'
      );
      await page.waitForTimeout(1000);
      await tryClick(
        page,
        ['button:has-text("Yes")', 'button:has-text("Confirm")'],
        'rapido-cancel-confirm'
      );
    } catch (err) {
      console.error('[rapido] Cancel error:', err.message);
    }
  };

  try {
    update(sessionId, { status: 'SEARCHING' });
    console.log('[rapido] Starting Rapido booking...');

    ({ browser, page } = await launchBrowser('rapido'));

    await page.goto('https://m.rapido.bike', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const phone = process.env.RAPIDO_PHONE;

    const phoneSelectors = [
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[placeholder*="phone" i]',
      'input[placeholder*="mobile" i]',
    ];

    if (await tryFill(page, phoneSelectors, phone, 'rapido-phone')) {
      await tryClick(
        page,
        ['button:has-text("Continue")', 'button:has-text("Get OTP")', 'button[type="submit"]'],
        'rapido-phone-submit'
      );
      await page.waitForTimeout(2000);
    }

    if (await detectOtpScreen(page)) {
      update(sessionId, { status: 'SEARCHING', message: 'Enter OTP manually' });
      await waitForOtp(page, 'rapido', 30);
    }

    const pickupSelectors = [
      'input[placeholder*="pick" i]',
      'input[placeholder*="From" i]',
      'input[placeholder*="Enter pickup" i]',
      'input[type="text"]',
    ];

    await tryClick(page, pickupSelectors, 'rapido-pickup-focus');
    await tryFill(page, pickupSelectors, `${pickup}, Ranchi`, 'rapido-pickup');
    await trySelectSuggestion(page, 'rapido-pickup');
    await page.waitForTimeout(1500);

    const dropSelectors = [
      'input[placeholder*="drop" i]',
      'input[placeholder*="To" i]',
      'input[placeholder*="destination" i]',
    ];

    await tryFill(page, dropSelectors, `${drop}, Ranchi`, 'rapido-drop');
    await trySelectSuggestion(page, 'rapido-drop');
    await page.waitForTimeout(2000);

    update(sessionId, { status: 'FOUND' });

    const rideSelectors = [
      'button:has-text("Bike")',
      'div:has-text("Bike")',
      'button:has-text("Auto")',
      'div:has-text("Auto")',
      '[class*="service"]:has-text("Bike")',
    ];
    await tryClick(page, rideSelectors, 'rapido-select-ride');
    await page.waitForTimeout(1500);

    const confirmSelectors = [
      'button:has-text("Book")',
      'button:has-text("Confirm")',
      'button:has-text("Ride Now")',
      'button:has-text("Book Ride")',
    ];
    await tryClick(page, confirmSelectors, 'rapido-confirm');
    console.log('[rapido] Booking confirmed, waiting for captain...');

    const confirmedTexts = ['Captain assigned', 'Your captain', 'is on the way', 'OTP', 'Ride confirmed'];
    let confirmed = false;
    let eta = null;

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
      } catch {
        /* polling */
      }

      await page.waitForTimeout(3000);
    }

    if (cancelled) {
      return { status: 'cancelled', platform: 'rapido' };
    }

    if (confirmed) {
      update(sessionId, { status: 'CONFIRMED', eta });
      return {
        status: 'confirmed',
        platform: 'rapido',
        eta: eta || '5 mins',
        cancel,
        browser,
        page,
      };
    }

    update(sessionId, { status: 'FAILED', message: 'Timeout waiting for confirmation' });
    return { status: 'failed', platform: 'rapido', cancel, browser, page };
  } catch (err) {
    console.error('[rapido] Error:', err.message);
    update(sessionId, { status: 'FAILED', message: err.message });
    return { status: 'failed', platform: 'rapido', error: err.message };
  }
}

export default bookRapido;
