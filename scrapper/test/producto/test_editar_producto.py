"""
E2E Test: Editar Producto
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Edita un producto existente y valida los cambios.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import (
    crear_producto,
    validar_producto_existe,
    editar_producto
)


def ejecutar_editar_producto(page, producto):
    """
    Ejecuta solo la edición de producto (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        producto: Diccionario con los datos del producto a editar
        
    Returns:
        producto_editado: Diccionario con los datos del producto editado, o None si falla
    """
    # Editar el producto
    print("→ Editando producto...")
    producto_editado = editar_producto(page, producto)
    print(f"✓ Producto editado: {producto_editado}")

    # Validar que el producto fue editado correctamente
    if validar_producto_existe(page, producto_editado):
        print("✓ FLUJO EDITAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Cambios aplicados correctamente")
        return producto_editado
    else:
        print("✗ FALLÓ EL FLUJO EDITAR PRODUCTO")
        print(f"✗ No se encontró el producto con los cambios")
        return None


def main():
    """
    Flujo completo para editar un producto (ejecución independiente).
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

        # Paso 2: Ejecutar edición
        ejecutar_editar_producto(page, producto)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
