import playwright from "playwright";

namespace PlaywrightLib {

    let browser: playwright.Browser | null = null;
    
    export async function getBrowser() {
        if (!browser) {
            browser = await playwright.chromium.launch();
        }
        return browser;
    }
    
}

export default PlaywrightLib