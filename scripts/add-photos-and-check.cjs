const { chromium } = require('playwright');
const fs = require('fs');
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

    // IndexedDB 초기화 및 더미 사진 추가
    console.log('IndexedDB 초기화 및 더미 사진 추가...');
    await page.evaluate(async () => {
      // DB 삭제 후 재생성
      const deleteReq = indexedDB.deleteDatabase('daily-pose-db');
      await new Promise(resolve => {
        deleteReq.onsuccess = resolve;
        deleteReq.onerror = resolve;
      });
    });

    await page.waitForTimeout(500);

    // 페이지 새로고침
    await page.reload({ waitUntil: 'networkidle' });

    // 더미 사진 추가
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('daily-pose-db', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('photos')) {
            db.createObjectStore('photos', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['photos'], 'readwrite');
          const store = transaction.objectStore('photos');

          // 3장의 더미 사진 추가
          for (let i = 1; i <= 3; i++) {
            store.add({
              id: `dummy-photo-${i}`,
              dataUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5QaG90byA8L3RleHQ+PC9zdmc+`,
              timestamp: Date.now() + (i * 1000000),
              date: `2025년 2월 ${i}일`
            });
          }

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject();
        };
        request.onerror = () => reject();
      });
    });

    // 페이지 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 갤러리로 이동
    console.log('갤러리로 이동...');
    try {
      const galleryBtn = page.locator('button').filter({ hasText: '3' }).first();
      await galleryBtn.click();
    } catch (e) {
      console.log('갤러리 버튼 클릭 실패:', e.message);
    }

    await page.waitForTimeout(1000);

    console.log('스크린샷 찍는 중...');
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, `../screenshot-with-photos-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`스크린샷 저장됨: ${screenshotPath}`);

    // 버튼 분석
    const buttons = await page.evaluate(() => {
      const results = [];
      const buttons = document.querySelectorAll('button');

      buttons.forEach((btn) => {
        const styles = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        const text = btn.textContent?.trim() || '';

        // 보이는 버튼만 (너비와 높이가 20px 이상)
        if (rect.width > 20 && rect.height > 20 && text) {
          results.push({
            text: text.slice(0, 20),
            padding: styles.padding,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            fontSize: styles.fontSize,
            width: Math.round(rect.width) + 'px',
            height: Math.round(rect.height) + 'px',
            className: btn.className
          });
        }
      });

      return results;
    });

    console.log('\n=== 버튼 정보 ===');
    console.table(buttons);

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
})();
