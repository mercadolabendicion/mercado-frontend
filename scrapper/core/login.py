from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os

# cargar .env
def load_env():
    load_dotenv()
    base_url = os.getenv("BASE_URL")
    username = os.getenv("USERNAME")
    password = os.getenv("PASSWORD")
    if not base_url or not username or not password:
        raise RuntimeError("Faltan variables en .env: BASE_URL / USERNAME / PASSWORD")
    return base_url, username, password


# función transversal de login
def login(page):
    base_url, username, password = load_env()

    page.goto(f"{base_url}/login")

    page.fill("#username", username)
    page.fill("#password", password)

    # angular necesita disparo de eventos para activar el botón
    page.dispatch_event("#username", "input")
    page.dispatch_event("#password", "input")

    page.click("#btn-iniciar-sesion")

    # validar navegación correcta
    page.wait_for_url(f"{base_url}/app/principal")


# ejemplo de uso
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        login(page)

        print("Login OK")

        page.wait_for_timeout(3000)
        browser.close()
