"""
E2E Test: Crear Producto
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Crea un producto con datos aleatorios y valida su creación.
"""

from core.browser import get_page
from core.login import login
from actions.producto_actions import crear_producto, validar_producto_existe


def ejecutar_crear_producto(page):
    """
    Ejecuta solo la creación de producto (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        
    Returns:
        producto: Diccionario con los datos del producto creado, o None si falla
    """
    # Crear producto (incluye navegación, llenado de formulario y guardado)
    producto = crear_producto(page)

    # Validar que el producto fue creado exitosamente
    ok = validar_producto_existe(page, producto)

    if ok:
        print("✓ FLUJO CREAR PRODUCTO FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Producto creado: {producto}")
        return producto
    else:
        print("✗ FALLÓ EL FLUJO CREAR PRODUCTO")
        print(f"✗ Producto que se intentó crear: {producto}")
        return None


def main():
    """
    Flujo completo para crear un producto (ejecución independiente).
    Este test es independiente y puede ejecutarse sin depender de otros tests.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)
        
        # Ejecutar creación
        ejecutar_crear_producto(page)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
