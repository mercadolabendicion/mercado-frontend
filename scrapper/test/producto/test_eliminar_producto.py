"""
E2E Test: Eliminar Producto
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Elimina un producto existente y valida la eliminación.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import (
    crear_producto,
    validar_producto_existe,
    eliminar_producto,
    validar_producto_no_existe
)


def ejecutar_eliminar_producto(page, producto):
    """
    Ejecuta solo la eliminación de producto (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        producto: Diccionario con los datos del producto a eliminar
        
    Returns:
        bool: True si el producto fue eliminado correctamente, False en caso contrario
    """
    # Eliminar el producto
    print("→ Eliminando producto...")
    eliminar_producto(page, producto)

    # Validar que el producto fue eliminado
    if validar_producto_no_existe(page, producto):
        print("✓ FLUJO ELIMINAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Producto eliminado: {producto}")
        return True
    else:
        print("✗ FALLÓ EL FLUJO ELIMINAR PRODUCTO")
        print(f"✗ El producto aún existe: {producto}")
        return False


def main():
    """
    Flujo completo para eliminar un producto (ejecución independiente).
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

        # Paso 2: Ejecutar eliminación
        ejecutar_eliminar_producto(page, producto)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
