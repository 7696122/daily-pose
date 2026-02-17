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

    // IndexedDB에 더미 사진 추가 (페이지 이동 없이)
    console.log('더미 사진 추가 중...');
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('daily-pose-db', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['photos'], 'readwrite');
          const store = transaction.objectStore('photos');

          // 더미 사진 3장 추가
          for (let i = 1; i <= 3; i++) {
            const photo = {
              id: `photo-dummy-${i}`,
              dataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
              timestamp: Date.now() + (i * 1000),
              date: `2025년 2월 ${i}일`
            };
            store.add(photo);
          }

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject();
        };
        request.onerror = () => reject();
      });
    });

    // 앱 상태 업데이트를 위해 이벤트 발생
    await page.evaluate(() => {
      window.dispatchEvent(new Event('storage'));
    });

    await page.waitForTimeout(2000);

    // 갤러리 버튼 클릭
    console.log('갤러리 페이지로 이동 중...');
    try {
      const galleryButton = page.locator('button').filter({ hasText: /\d+/ }).first();
      await galleryButton.click();
    } catch (e) {
      console.log('갤러리 버튼 없음, 다른 방법 시도...');
    }

    await page.waitForTimeout(1000);

    console.log('갤러리 스크린샷 찍는 중...');
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, `../screenshot-full-${timestamp}.png`);
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
          className: btn.className.slice(0, 40)
        };
      });
    });

    console.log('\n버튼 스타일 정보:');
    console.table(buttons.filter(b => b.text));

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
})();
