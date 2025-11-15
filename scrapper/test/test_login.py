from core.browser import get_page
from core.login import login

# smoke test de login

if __name__ == "__main__":
    p, browser, context, page = get_page(headless=False)

    login(page)

    print("LOGIN PASÓ CORRECTAMENTE")

    page.wait_for_timeout(3000)
    browser.close()
    p.stop()
