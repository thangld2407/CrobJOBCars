// https://viblo.asia/p/crawl-website-su-dung-nodejs-va-puppeteer-phan-1-L4x5xv2wZBM


const scraperObject = {
  url: "https://www.djauto.co.kr/car/carList.html?cho=1",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".car_list");
    // Get the link to all the required books
    let urls = await page.evaluate( () => {
      return document.getElementsByTagName("tbody");

    });
    console.log(urls);
  },
};

module.exports = scraperObject;
