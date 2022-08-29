import chromium from "chrome-aws-lambda";
import playwright from "playwright-core";

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
            .setHeader("Cache-Control", "s-maxage=31536000, public")
            .setHeader("Content-Type", "image/png")
            .end(await page.screenshot({ type: "png" }));

        await browser.close();
    } catch (e) {
        response.status(500).send(e.message);
    }
}

async function createBrowserInstance(url) {
    const options = {
        args: chromium.args,
        headless: true,
        executablePath:
            process.env.NODE_ENV !== "development"
                ? await chromium.executablePath
                : `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
        viewport: {
            width: 1200,
            height: 720,
        },
    };

    const browser = await playwright.chromium.launch(options);
    const page = await browser.newPage();

    try {
        await page.goto(url);
    } catch (e) {
        browser.close();
        throw new Error("[error] are you sure the url is valid?");
    }

    return { browser, page };
}
