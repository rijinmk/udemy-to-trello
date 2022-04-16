const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--enable-blink-features=HTMLImports'],
  });
  await sleep(1000);
  const page = await browser.newPage();

  let username = 'rijin.mk9@gmail.com';
  let password = '%yZ1cL3W!Ey^Sr';

  await page.setViewport({ width: 1280, height: 800 });

  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
  );

  await sleep(1000);
  await page.goto('https://www.udemy.com/');
  await sleep(5000);
  await page.goto('https://www.udemy.com/course/complete-python-bootcamp/');

  await page
    .on('console', (message) =>
      console.log(
        `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
      )
    )
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', (response) =>
      console.log(`${response.status()} ${response.url()}`)
    )
    .on('requestfailed', (request) =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );

  // await page.type('input[type="email"]', username);
  // await page.type('input[type="password"]', password);
  // await page.click('input[type="submit"]');

  // await browser.close();
})();
