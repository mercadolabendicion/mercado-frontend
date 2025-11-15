"""
E2E smoke test: crear cliente.
Optimizado: más rápido, sin emojis y con filtrado funcional.
"""

import random
from typing import TypedDict

from core.browser import get_page
from core.login import login


class Cliente(TypedDict):
    cedula: str
    nombre: str
    direccion: str
    correo: str


# -------------------------------------------------------------------
# Escritura humana solo para formularios (no para búsqueda)
# -------------------------------------------------------------------
def escribir_lento(page, selector: str, texto: str, delay: float = 0.05) -> None:
    """Escribe carácter por carácter en inputs comunes."""
    page.click(selector)
    page.fill(selector, "")
    for c in texto:
        page.keyboard.type(c, delay=delay)
    page.keyboard.press("Tab")


# -------------------------------------------------------------------
# Navegación
# -------------------------------------------------------------------
def navegar_a_clientes(page) -> None:
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    page.wait_for_selector("app-cliente", timeout=60000)


def refrescar_modulo_clientes(page) -> None:
    """Recarga módulo Angular para actualizar tabla."""
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    page.wait_for_selector("input#buscar", timeout=60000)
    page.wait_for_timeout(800)


# -------------------------------------------------------------------
# Generación de datos
# -------------------------------------------------------------------
def crear_datos_cliente() -> Cliente:
    r = random.randint(1000000000, 9999999999)
    return {
        "cedula": str(r),
        "nombre": "Cliente QA AUT",
        "direccion": f"Calle {r}",
        "correo": f"qa{r}@test.com"
    }


# -------------------------------------------------------------------
# Formulario
# -------------------------------------------------------------------
def llenar_formulario_cliente(page, cliente: Cliente) -> None:
    escribir_lento(page, "input[formcontrolname='cedula']", cliente["cedula"])
    escribir_lento(page, "input[formcontrolname='nombre']", cliente["nombre"])
    escribir_lento(page, "input[formcontrolname='direccion']", cliente["direccion"])
    escribir_lento(page, "input[formcontrolname='correo']", cliente["correo"])


# -------------------------------------------------------------------
# Guardar
# -------------------------------------------------------------------
def guardar_cliente(page) -> None:
    page.click("button#azul")
    page.wait_for_selector(".swal2-confirm", timeout=60000)
    page.click(".swal2-confirm")
    page.wait_for_timeout(1200)


# -------------------------------------------------------------------
# Validación con filtrado real
# -------------------------------------------------------------------
def validar_cliente(page, cliente: Cliente) -> bool:
    escribir_en_busqueda(page, cliente["cedula"], delay=0.06)

    page.wait_for_timeout(1500)

    return page.locator(f"text={cliente['nombre']}").first.is_visible()


def escribir_en_busqueda(page, texto: str, delay: float = 0.05):
    page.click("input#buscar")
    page.fill("input#buscar", "")
    for c in texto:
        page.keyboard.type(c, delay=delay)
    page.wait_for_timeout(300)

# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
def main():
    playwright, browser, context, page = get_page(headless=False)

    login(page)
    navegar_a_clientes(page)

    cliente = crear_datos_cliente()

    page.click("button#nuevo")
    page.wait_for_url("**/app/cliente/nuevo", timeout=60000)

    llenar_formulario_cliente(page, cliente)
    guardar_cliente(page)

    # Refrescar módulo solo UNA VEZ
    refrescar_modulo_clientes(page)

    # Validar
    ok = validar_cliente(page, cliente)

    if ok:
        print("FLUJO CREAR CLIENTE FUNCIONÓ CORRECTAMENTE")
    else:
        print("FALLÓ EL FLUJO CREAR CLIENTE")

    print(cliente)

    browser.close()
    playwright.stop()


if __name__ == "__main__":
    main()
