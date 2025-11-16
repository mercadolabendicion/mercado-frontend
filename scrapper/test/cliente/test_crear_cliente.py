"""
E2E Test: Crear Cliente
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Crea un cliente con datos aleatorios y valida su creación.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import crear_cliente, validar_cliente_existe


def ejecutar_crear_cliente(page):
    """
    Ejecuta solo la creación de cliente (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        
    Returns:
        cliente: Diccionario con los datos del cliente creado, o None si falla
    """
    # Crear cliente (incluye navegación, llenado de formulario y guardado)
    cliente = crear_cliente(page)

    # Validar que el cliente fue creado exitosamente
    ok = validar_cliente_existe(page, cliente)

    if ok:
        print("✓ FLUJO CREAR CLIENTE FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Cliente creado: {cliente}")
        return cliente
    else:
        print("✗ FALLÓ EL FLUJO CREAR CLIENTE")
        print(f"✗ Cliente que se intentó crear: {cliente}")
        return None


def main():
    """
    Flujo completo para crear un cliente (ejecución independiente).
    Este test es independiente y puede ejecutarse sin depender de otros tests.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)
        
        # Ejecutar creación
        ejecutar_crear_cliente(page)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()

