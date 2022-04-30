const puppeteer = require('puppeteer');
const notifier = require('node-notifier');
const env = require('./env.json');
const { ID, PW } = env;
const DATE = '20220508';
const TIME = '160000';
const DELAY = 1000;

const LOGIN_URI =
  'https://etk.srail.kr/cmc/01/selectLoginForm.do?pageId=TK0701000000';
const SEARCH_URI =
  'https://etk.srail.kr/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000';

async function main() {
  const browser = await puppeteer.launch({ defaultViewport: null });
  const page = await browser.newPage();
  await page.setViewport({
    width: 100,
    height: 100,
  });
  await page.goto(LOGIN_URI);
  await page.type('#srchDvNm01', ID);
  await page.type('#hmpgPwdCphd01', PW);
  await page.click('.submit.btn_midium.btn_pastel2');
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
            '.btn_small.btn_burgundy_dark.val_m.wx90',
          );

          btns.forEach((btn) => {
            if (result && btn.tagName === 'A') {
              btn.click();
              resolve(true);
            }
          });

          resolve(false);
        });
      });

      !result &&
        setTimeout(async () => {
          await page.click('#search_top_tag input');
        }, DELAY);

      result && console.log('end');
      notifier.notify('reserve finish');
    });
  }
  await parseTable();
}

main();
