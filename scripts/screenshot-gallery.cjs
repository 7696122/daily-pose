const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    console.log('페이지 로드 중...');
    await page.goto('https://localhost:5173', { waitUntil: 'networkidle' });

    // 갤러리 버튼 클릭
    console.log('갤러리 페이지로 이동 중...');
    const galleryButton = page.locator('button').filter({ hasText: '0' }).first();
    await galleryButton.click();
    await page.waitForTimeout(1000);

    console.log('갤러리 스크린샷 찍는 중...');
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, `../screenshot-gallery-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`스크린샷 저장됨: ${screenshotPath}`);

    // 버튼 스타일 정보 추출
    const buttons = await page.evaluate(() => {
      const buttonElements = document.querySelectorAll('button');
      return Array.from(buttonElements).map(btn => {
        const styles = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        return {
          text: btn.textContent?.trim().slice(0, 20) || '',
          padding: styles.padding,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          fontSize: styles.fontSize,
          width: Math.round(rect.width) + 'px',
          display: styles.display
        };
      });
    });

    console.log('\n버튼 스타일 정보:');
    console.table(buttons);

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
})();
