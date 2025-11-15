"""
E2E Test: Editar Producto
Este test puede ejecutarse de forma independiente.
Primero crea un producto, luego lo edita, y valida los cambios.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import (
    crear_producto,
    validar_producto_existe,
    editar_producto
)


def main():
    """
    Flujo completo para editar un producto.
    Este test es independiente: crea el producto antes de editarlo.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear producto para luego editarlo
        print("→ Creando producto para prueba de edición...")
        producto = crear_producto(page)
        print(f"✓ Producto creado: {producto}")

        # Paso 2: Editar el producto
        print("→ Editando producto...")
        producto_editado = editar_producto(page, producto)
        print(f"✓ Producto editado: {producto_editado}")

        # Paso 3: Validar que el producto fue editado correctamente
        if validar_producto_existe(page, producto_editado):
            print("✓ FLUJO EDITAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Cambios aplicados correctamente")
        else:
            print("✗ FALLÓ EL FLUJO EDITAR PRODUCTO")
            print(f"✗ No se encontró el producto con los cambios")

    finally:
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
