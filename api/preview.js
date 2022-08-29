import puppeteer from "puppeteer";

export default async function handler(request, response) {
    const url = request.query.url;

    if (!url) {
        response.status(400).send("[error] missing url query parameter");
        return;
    }

    try {
        const { browser, page } = await createBrowserInstance(
            url.startsWith("http") ? url : "https://" + url
        );

        response
            .status(200)
            .setHeader("Content-Type", "image/png")
            .end(await page.screenshot({ type: "png" }));

        await browser.close();
    } catch (e) {
        response.status(500).send(e.message);
    }
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

    try {
        await page.goto(url);
    } catch (e) {
        browser.close();
        throw new Error("[error] are you sure the url is valid?");
    }

    return { browser, page };
}
