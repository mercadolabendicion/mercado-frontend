"""
E2E Test: Editar Cliente
Este test puede ejecutarse de forma independiente o ser llamado desde otros tests.
Edita un cliente existente y valida los cambios.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import (
    crear_cliente,
    validar_cliente_existe,
    editar_cliente
)


def ejecutar_editar_cliente(page, cliente):
    """
    Ejecuta solo la edición de cliente (sin setup de browser).
    Puede ser llamado desde otros tests.
    
    Args:
        page: Página de Playwright ya autenticada
        cliente: Diccionario con los datos del cliente a editar
        
    Returns:
        cliente_editado: Diccionario con los datos del cliente editado, o None si falla
    """
    # Editar el cliente
    print("→ Editando cliente...")
    cliente_editado = editar_cliente(page, cliente)
    print(f"✓ Cliente editado: {cliente_editado}")

    # Validar que el cliente fue editado correctamente
    if validar_cliente_existe(page, cliente_editado):
        print("✓ FLUJO EDITAR CLIENTE FUNCIONÓ CORRECTAMENTE")
        print(f"✓ Cambios aplicados correctamente")
        return cliente_editado
    else:
        print("✗ FALLÓ EL FLUJO EDITAR CLIENTE")
        print(f"✗ No se encontró el cliente con los cambios")
        return None


def main():
    """
    Flujo completo para editar un cliente (ejecución independiente).
    Este test es independiente: crea el cliente antes de editarlo.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear cliente para luego editarlo
        print("→ Creando cliente para prueba de edición...")
        cliente = crear_cliente(page)
        print(f"✓ Cliente creado: {cliente}")

        # Paso 2: Ejecutar edición
        ejecutar_editar_cliente(page, cliente)

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
