const PORT = 8000;
const express = require('express');
const puppeteer = require("puppeteer");
const app = express();

const urlMain = 'https://www.fachzeitungen.de/verlag/argus';
let impressum = '';
let selector = '';
const array = [];

(async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(urlMain, {waitUntil: 'load', timeout: 0});

        //get city name
        const cityElement = await page.waitForXPath('//*[@id="block-system-main"]/div/div/address/span[3]');
        const cityStr = await cityElement.evaluate(el => el.textContent.trim());

        //get post code
        const postCodeElement = await page.waitForXPath('//*[@id="block-system-main"]/div/div/address/span[2]');
        const postCodeStr = await postCodeElement.evaluate(el => el.textContent.trim());

        //get link to web company
        const wwwElement = await page.waitForXPath('//*[@id="block-system-main"]/div/div/div/a[1]');
        const companyWeb = await wwwElement.evaluate(el => el.getAttribute('href'));

        array['Company_web'] = companyWeb;

        await page.goto(companyWeb, {waitUntil: 'load', timeout: 0});

        selector = 'a';
        await page.$$eval(selector, anchors => {
                anchors.map(anchor => {
                        if(anchor.textContent === 'Impressum') {
                                anchor.click();
                        }
                })
        });


        await page.goto(page.url(), {waitUntil: 'load', timeout: 0});

        selector = 'p';
        const impressumAll = await page.$$eval(selector, anchors => {
                return anchors.map(anchor => anchor.textContent.trim())
        })

        //comparing City
        for (let [key, value] of Object.entries(impressumAll)) {
                let positionCity = value.search(cityStr);

                if (positionCity >= 0) {
                        array['City'] = cityStr;
                        break;
                }
                else { array['City_from_fachzeitungen'] = cityStr; }
        }

        //comparing post code
        for (let [key, value] of Object.entries(impressumAll)) {
                let positionPostCode = value.search(postCodeStr);

                if (positionPostCode >= 0) {
                        array['Post code'] = postCodeStr;
                        break;
                }
                else { array['Post_Code_from_fachzeitungen'] = postCodeStr; }
        }

        console.log(array);

        await browser.close();
        process.exit(0);
})();

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));


