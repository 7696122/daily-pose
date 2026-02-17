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
    console.log('카메라 페이지 로드 중...');
    await page.goto('https://localhost:5173', { waitUntil: 'networkidle' });

    // 시작하기 버튼 클릭
    console.log('시작하기 버튼 클릭...');
    try {
      const startButton = page.locator('button').filter({ hasText: '시작하기' });
      await startButton.click();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('시작하기 버튼 없음:', e.message);
    }

    // 스크린샷
    const timestamp1 = Date.now();
    await page.screenshot({ path: path.join(__dirname, `../screenshot-cam-${timestamp1}.png`), fullPage: true });
    console.log(`카메라 스크린샷 저장됨`);

    // 갤러리 버튼 클릭
    console.log('갤러리 버튼 클릭...');
    try {
      // 사진 개수 badge가 있는 버튼 찾기
      const galleryBtn = page.locator('button:has-text("0")').first();
      await galleryBtn.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('갤러리 버튼 클릭 실패:', e.message);
    }

    const timestamp2 = Date.now();
    await page.screenshot({ path: path.join(__dirname, `../screenshot-gal-${timestamp2}.png`), fullPage: true });
    console.log(`갤러리 스크린샷 저장됨`);

    // 모든 버튼 정보 추출
    const buttons = await page.evaluate(() => {
      const results = [];
      const buttons = document.querySelectorAll('button');

      buttons.forEach((btn, idx) => {
        const styles = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();

        // 보이는 버튼만 (너비와 높이가 10px 이상)
        if (rect.width > 10 && rect.height > 10) {
          results.push({
            index: idx,
            text: btn.textContent?.trim().slice(0, 25) || '',
            padding: styles.padding,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom,
            fontSize: styles.fontSize,
            width: Math.round(rect.width) + 'px',
            height: Math.round(rect.height) + 'px',
            display: styles.display,
            position: styles.position
          });
        }
      });

      return results;
    });

    console.log('\n=== 버튼 스타일 정보 ===');
    console.table(buttons);

    // 문제가 있는 버튼 확인
    console.log('\n=== 패딩이 부족한 버튼 ===');
    const lowPadding = buttons.filter(b =>
      b.text &&
      b.paddingLeft &&
      parseFloat(b.paddingLeft) < 30
    );
    if (lowPadding.length > 0) {
      console.table(lowPadding);
    } else {
      console.log('모든 버튼의 패딩이 적절합니다.');
    }

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
})();
