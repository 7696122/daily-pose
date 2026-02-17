const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 13 Pro size
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    console.log('페이지 로드 중...');
    await page.goto('https://localhost:5173', { waitUntil: 'networkidle' });

    console.log('스크린샷 찍는 중...');
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, `../screenshot-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`스크린샷 저장됨: ${screenshotPath}`);

    // 버튼 스타일 정보 추출
    const buttons = await page.evaluate(() => {
      const buttonElements = document.querySelectorAll('button');
      return Array.from(buttonElements).slice(0, 8).map(btn => {
        const styles = window.getComputedStyle(btn);
        return {
          text: btn.textContent?.trim().slice(0, 30) || '',
          padding: styles.padding,
          fontSize: styles.fontSize,
          className: btn.className.slice(0, 50)
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
