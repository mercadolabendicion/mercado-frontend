"""
E2E Test: Eliminar Cliente
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Elimina un cliente existente y valida la eliminación.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import (
    crear_cliente,
    validar_cliente_existe,
    eliminar_cliente,
    validar_cliente_no_existe
)


def ejecutar_eliminar_cliente(page, cliente):
    """
    Ejecuta solo la eliminación de cliente (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        cliente: Diccionario con los datos del cliente a eliminar
        
    Returns:
        bool: True si el cliente fue eliminado correctamente, False en caso contrario
    """
    # Eliminar el cliente
    print("→ Eliminando cliente...")
    eliminar_cliente(page, cliente)

    # Validar que el cliente fue eliminado
    if validar_cliente_no_existe(page, cliente):
        print("✓ FLUJO ELIMINAR CLIENTE FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Cliente eliminado: {cliente}")
        return True
    else:
        print("✗ FALLÓ EL FLUJO ELIMINAR CLIENTE")
        print(f"✗ El cliente aún existe: {cliente}")
        return False


def main():
    """
    Flujo completo para eliminar un cliente (ejecución independiente).
    Este test es independiente: crea el cliente antes de eliminarlo.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear cliente para luego eliminarlo
        print("→ Creando cliente para prueba de eliminación...")
        cliente = crear_cliente(page)
        
        # Validar que el cliente fue creado
        if validar_cliente_existe(page, cliente):
            print(f"✓ Cliente creado exitosamente: {cliente}")
        else:
            print("✗ Error: No se pudo crear el cliente")
            return

        # Paso 2: Ejecutar eliminación
        ejecutar_eliminar_cliente(page, cliente)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
