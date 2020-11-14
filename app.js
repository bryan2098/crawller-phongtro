const express = require("express");
const puppeteer = require('puppeteer');
const fs = require("fs")
const app = express();


app.get("/", async (req, res, next) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://phongtro123.com/?page=1');
    let listUrl = await page.evaluate(() => {
        let items = document.querySelectorAll('ul.list-post li div.title a');
        let links = []
        items.forEach((item) => {
            links.push(item.getAttribute('href'));
        });
        return links;
    });

    let results = [];
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
        fs.writeFile('data.txt', JSON.stringify(results), function (err) {
            if (err) {
                return console.error(err);
            }
        });
    }

    await browser.close();
    res.status(200).send(results);
});

app.listen(3000, () => {
    console.log("server start");
})