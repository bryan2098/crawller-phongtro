const express = require("express");
const puppeteer = require('puppeteer');
const fs = require("fs");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const app = express();


app.get("/", async (req, res, next) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let results = [];
    for (let i = 1; i <= 2; i++) {
        await page.goto('https://phongtro123.com/?page=' + i);
        let listUrl = await page.evaluate(() => {
            let items = document.querySelectorAll('ul.list-post li div.title a');
            let links = []
            items.forEach((item) => {
                links.push(item.getAttribute('href'));
            });
            return links;
        });


        for (let url of listUrl) {
            const browserDetail = await puppeteer.launch();
            const pageDetail = await browserDetail.newPage();
            await pageDetail.goto(url);
            const dataDetail = await pageDetail.evaluate(() => {
                const images = document.querySelectorAll('#flexslider_slider img');
                let linksImages = []
                images.forEach((image) => {
                    linksImages.push(image.getAttribute('src'));
                });

                const title = document.querySelector('h1.page-title').textContent;
                const address = document.querySelectorAll('table tbody')[0].querySelectorAll('tr td')[1].textContent;
                const phone = document.querySelectorAll('table tbody')[0].querySelectorAll('tr td')[13].textContent;
                const acreage = document.querySelectorAll('table tbody')[0].querySelectorAll('tr td')[17].textContent;
                const price = document.querySelectorAll('table tbody')[0].querySelectorAll('tr td')[21].textContent;
                const content = document.querySelector('#motachitiet').textContent.replace("Thông tin mô tả", "");
                return { title, images: linksImages, price, address, phone, content, acreage };
            });

            results.push(dataDetail);
            await browserDetail.close();
        }

        await browser.close();
    }

    fs.writeFile('data.txt', JSON.stringify(results), function (err) {
        if (err) {
            return console.error(err);
        }
    });

    res.status(200).send(results);
});

app.listen(3000, () => {
    console.log("server start");
})