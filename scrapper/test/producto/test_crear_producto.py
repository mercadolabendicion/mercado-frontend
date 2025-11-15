"""E2E smoke test: crear producto.
Se modulariza el flujo y se añaden comentarios y buenas practicas.
"""

from datetime import datetime, timedelta
import random
from typing import TypedDict

from core.browser import get_page
from core.login import login


class Producto(TypedDict):
    codigo: str
    nombre: str
    lote: str
    fecha_vencimiento: str


def navegar_a_productos(page) -> None:
    """Ir a la pantalla de productos usando menu lateral."""
    page.click("a.sidebar-link[routerlink='/app/producto']")
    page.wait_for_url("**/app/producto", timeout=60000)
    page.wait_for_selector("app-producto")


def crear_datos_producto() -> Producto:
    """Genera datos random controlados para crear un producto QA."""
    r = random.randint(10000, 99999)
    return {
        "nombre": f"Producto QA AUT {r}",
        "codigo": f"Q{r}",
        "lote": f"LOTE-{r}",
        "fecha_vencimiento": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
    }


def llenar_formulario_producto(page, producto: Producto) -> None:
    """Completa el formulario de registro usando los datos generados."""
    page.fill("input[formcontrolname='codigo']", producto["codigo"])
    page.fill("input[formcontrolname='nombre']", producto["nombre"])
    page.fill("input[formcontrolname='fecha_vencimiento']", producto["fecha_vencimiento"])
    page.fill("input[formcontrolname='lote']", producto["lote"])

    formas = page.locator("div[formarrayname='formasVenta']")
    formas.locator("input[formcontrolname='nombre']").first.fill("Unidad")
    formas.locator("input[formcontrolname='precioCompra']").first.fill("1000")
    formas.locator("input[formcontrolname='precioVenta']").first.fill("1500")
    formas.locator("input[formcontrolname='cantidad']").first.fill("50")

    # impuesto 0
    page.select_option("select[formcontrolname='impuesto']", "0")


def guardar_producto(page) -> None:
    """Dispara accion guardar y confirma swal."""
    page.click("button#nuevo")
    page.wait_for_selector("h1.nota:has-text('Registro de productos')")
    page.click("button#azul")
    page.wait_for_selector(".swal2-confirm", timeout=60000)
    page.click(".swal2-confirm")
    page.wait_for_timeout(2000)


def validar_producto(page, producto: Producto) -> bool:
    """Valida que producto creado se liste tras filtrar por codigo."""
    navegar_a_productos(page)
    page.fill("input[placeholder*='Escanear']", producto["codigo"])
    page.wait_for_timeout(2000)
    return page.locator(f"text={producto['nombre']}").first.is_visible()


def main():
    # inicia playwright
    playwright, browser, context, page = get_page(headless=False)

    # login
    login(page)

    # navegar y preparar
    navegar_a_productos(page)

    # datos del producto
    producto = crear_datos_producto()

    # click en nuevo, llenar y guardar
    page.click("button#nuevo")
    page.wait_for_selector("h1.nota:has-text('Registro de productos')")
    llenar_formulario_producto(page, producto)
    page.click("button#azul")
    page.wait_for_selector(".swal2-confirm", timeout=60000)
    page.click(".swal2-confirm")

    # validar
    ok = validar_producto(page, producto)

    if ok:
        print("FLUJO CREAR PRODUCTO FUNCIONO CORRECTAMENTE")
    else:
        print("FALLO FLUJO CREAR PRODUCTO")

    # imprimir datos simulando json
    print(producto)

    browser.close()
    playwright.stop()


if __name__ == "__main__":
    main()
