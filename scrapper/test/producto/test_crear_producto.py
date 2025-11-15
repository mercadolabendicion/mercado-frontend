"""
E2E Test: Crear Producto
Este test puede ejecutarse de forma independiente.
Crea un producto con datos aleatorios y valida su creación.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import crear_producto, validar_producto_existe


def main():
    """
    Flujo completo para crear un producto.
    Este test es independiente y puede ejecutarse sin depender de otros tests.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Crear producto (incluye navegación, llenado de formulario y guardado)
        producto = crear_producto(page)

        # Validar que el producto fue creado exitosamente
        ok = validar_producto_existe(page, producto)

        if ok:
            print("✓ FLUJO CREAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Producto creado: {producto}")
        else:
            print("✗ FALLÓ EL FLUJO CREAR PRODUCTO")
            print(f"✗ Producto que se intentó crear: {producto}")

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
