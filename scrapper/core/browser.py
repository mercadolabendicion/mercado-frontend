from playwright.sync_api import sync_playwright

# crea contexto y devuelve page

def get_page(headless: bool = False):
    p = sync_playwright().start()
    browser = p.chromium.launch(headless=headless)
    context = browser.new_context()
    page = context.new_page()
    return p, browser, context, page
