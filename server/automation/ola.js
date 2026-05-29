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
  emitStatus(sessionId, { platform: 'ola', ...data });
}

export async function bookOla({ pickup, drop, sessionId, credentials = {} }) {
  let browser;
  let page;
  let cancelled = false;

  const cancel = async () => {
    cancelled = true;
    console.log('[ola] Running cancellation flow...');
    try {
      await tryClick(
        page,
        ['button:has-text("Cancel")', 'a:has-text("Cancel")', '[class*="cancel"]'],
        'ola-cancel'
      );
      await page.waitForTimeout(1000);
      await tryClick(
        page,
        ['button:has-text("Yes")', 'button:has-text("Confirm")'],
        'ola-cancel-confirm'
      );
    } catch (err) {
      console.error('[ola] Cancel error:', err.message);
    }
  };

  try {
    update(sessionId, { status: 'SEARCHING' });
    console.log('[ola] Starting Ola booking...');

    ({ browser, page } = await launchBrowser('ola'));

    await page.goto('https://book.olacabs.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const phone = credentials.identifier || process.env.OLA_PHONE;
    const password = credentials.identifier ? credentials.secret : process.env.OLA_PASSWORD;

    const phoneSelectors = [
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[placeholder*="phone" i]',
      'input[placeholder*="mobile" i]',
      '#mobile',
    ];

    if (await tryFill(page, phoneSelectors, phone, 'ola-phone')) {
      await tryClick(
        page,
        ['button:has-text("Continue")', 'button:has-text("Next")', 'button[type="submit"]'],
        'ola-phone-submit'
      );
      await page.waitForTimeout(2000);
    }

    if (await detectOtpScreen(page)) {
      update(sessionId, { status: 'SEARCHING', message: 'Enter OTP manually' });
      await waitForOtp(page, 'ola', 30);
    }

    const passwordSelectors = ['input[type="password"]', 'input[name="password"]'];
    if (password && (await tryFill(page, passwordSelectors, password, 'ola-password'))) {
      await tryClick(
        page,
        ['button:has-text("Login")', 'button:has-text("Sign in")', 'button[type="submit"]'],
        'ola-password-submit'
      );
      await page.waitForTimeout(3000);
    }

    const pickupSelectors = [
      'input[placeholder*="pick" i]',
      'input[placeholder*="From" i]',
      '#pickup',
      '.pickup-input input',
      'input[type="text"]',
    ];

    await tryClick(page, pickupSelectors, 'ola-pickup-focus');
    await tryFill(page, pickupSelectors, `${pickup}, Ranchi`, 'ola-pickup');
    await trySelectSuggestion(page, 'ola-pickup');
    await page.waitForTimeout(1500);

    const dropSelectors = [
      'input[placeholder*="drop" i]',
      'input[placeholder*="To" i]',
      '#drop',
      '.drop-input input',
    ];

    await tryFill(page, dropSelectors, `${drop}, Ranchi`, 'ola-drop');
    await trySelectSuggestion(page, 'ola-drop');
    await page.waitForTimeout(2000);

    update(sessionId, { status: 'FOUND' });

    const rideSelectors = [
      'button:has-text("Mini")',
      'div:has-text("Mini")',
      'div:has-text("Mini")',
      '[class*="category"]:has-text("Mini")',
      'li:has-text("Mini")',
    ];
    await tryClick(page, rideSelectors, 'ola-select-ride');
    await page.waitForTimeout(1500);

    const confirmSelectors = [
      'button:has-text("Book")',
      'button:has-text("Confirm")',
      'button:has-text("Ride Now")',
      '[class*="book-now"]',
    ];
    await tryClick(page, confirmSelectors, 'ola-confirm');
    console.log('[ola] Booking confirmed, waiting for driver...');

    const confirmedTexts = ['Driver assigned', 'Your cab', 'is on the way', 'OTP for ride', 'driver details'];
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
      return { status: 'cancelled', platform: 'ola' };
    }

    if (confirmed) {
      update(sessionId, { status: 'CONFIRMED', eta });
      return {
        status: 'confirmed',
        platform: 'ola',
        eta: eta || '5 mins',
        cancel,
        browser,
        page,
      };
    }

    update(sessionId, { status: 'FAILED', message: 'Timeout waiting for confirmation' });
    return { status: 'failed', platform: 'ola', cancel, browser, page };
  } catch (err) {
    console.error('[ola] Error:', err.message);
    update(sessionId, { status: 'FAILED', message: err.message });
    return { status: 'failed', platform: 'ola', error: err.message };
  }
}

export default bookOla;
