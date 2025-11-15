"""
E2E Test: Eliminar Cliente
Este test puede ejecutarse de forma independiente.
Primero crea un cliente y luego lo elimina, validando ambas operaciones.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import (
    crear_cliente,
    validar_cliente_existe,
    eliminar_cliente,
    validar_cliente_no_existe
)


def main():
    """
    Flujo completo para eliminar un cliente.
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

        # Paso 2: Eliminar el cliente
        print("→ Eliminando cliente...")
        eliminar_cliente(page, cliente)

        # Paso 3: Validar que el cliente fue eliminado
        if validar_cliente_no_existe(page, cliente):
            print("✓ FLUJO ELIMINAR CLIENTE FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Cliente eliminado: {cliente}")
        else:
            print("✗ FALLÓ EL FLUJO ELIMINAR CLIENTE")
            print(f"✗ El cliente aún existe: {cliente}")

    finally:
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
