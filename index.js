const puppeteer = require('puppeteer');
const notifier = require('node-notifier');
const env = require('./env.json');
const { ID, PW } = env;
const DATE = '20221010';
const TIME = '160000';
const DELAY = 1000;

const LOGIN_URI =
  'https://etk.srail.kr/cmc/01/selectLoginForm.do?pageId=TK0701000000';
const SEARCH_URI =
  'https://etk.srail.kr/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000';

async function main() {
  const browser = await puppeteer.launch({ devtools: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 800,
  });
  await page.goto(LOGIN_URI);
  await page.type('#srchDvNm01', ID);
  await page.type('#hmpgPwdCphd01', PW);
  await page.click('.submit.loginSubmit');
  await page.waitForNavigation();
  await page.goto(SEARCH_URI);

  await page.select('#dptDt', DATE);
  await page.select('#dptTm', TIME);

  async function parseTable() {
    await page.click('#search_top_tag input');
    page.on('load', async () => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          const btns = document.querySelectorAll(
            '#result-form > fieldset > div.tbl_wrap.th_thead > table > tbody > tr > td:nth-child(7) > a'
          );
          btns.forEach((btn) => {
            if (btn.classList.contains('btn_burgundy_dark') && btn.tagName === 'A') {
              btn.click();
              resolve(true);
            }
          });

          resolve(false);
        });
      });

      !result &&
        setTimeout(async () => {
          try {
            await page.click('#search_top_tag input');
          } catch (e) { }
        }, DELAY);

      if (result) {
        notifier.notify({
          title: "srt",
          message: 'reserve finish', sound: true
        });
        setTimeout(() => {
          process.exit()
        }, 5000)
      }
    });
  }

  await parseTable();
}

main();
