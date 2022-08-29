import puppeteer from "puppeteer";

export default async function handler(request, response) {
    const url = request.query.url;

    if (!url) {
        response.status(400).send("[error] missing url query parameter");
        return;
    }

    const { browser, page } = await createBrowserInstance(
        url.startsWith("http") ? url : "https://" + url
    );

    response
        .status(200)
        .setHeader("Content-Type", "image/png")
        .end(await page.screenshot({ type: "png" }));

    await browser.close();
}

async function createBrowserInstance(url) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url);

    return { browser, page };
}
