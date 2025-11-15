"""
E2E Test: Eliminar Producto
Este test puede ejecutarse de forma independiente.
Primero crea un producto y luego lo elimina, validando ambas operaciones.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import (
    crear_producto,
    validar_producto_existe,
    eliminar_producto,
    validar_producto_no_existe
)


def main():
    """
    Flujo completo para eliminar un producto.
    Este test es independiente: crea el producto antes de eliminarlo.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear producto para luego eliminarlo
        print("→ Creando producto para prueba de eliminación...")
        producto = crear_producto(page)
        
        # Validar que el producto fue creado
        if validar_producto_existe(page, producto):
            print(f"✓ Producto creado exitosamente: {producto}")
        else:
            print("✗ Error: No se pudo crear el producto")
            return

        # Paso 2: Eliminar el producto
        print("→ Eliminando producto...")
        eliminar_producto(page, producto)

        # Paso 3: Validar que el producto fue eliminado
        if validar_producto_no_existe(page, producto):
            print("✓ FLUJO ELIMINAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Producto eliminado: {producto}")
        else:
            print("✗ FALLÓ EL FLUJO ELIMINAR PRODUCTO")
            print(f"✗ El producto aún existe: {producto}")

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
