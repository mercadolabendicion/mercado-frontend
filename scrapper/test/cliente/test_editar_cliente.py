"""
E2E Test: Editar Cliente
Este test puede ejecutarse de forma independiente.
Primero crea un cliente, luego lo edita, y valida los cambios.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import (
    crear_cliente,
    validar_cliente_existe,
    editar_cliente
)


def main():
    """
    Flujo completo para editar un cliente.
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

        # Paso 2: Editar el cliente
        print("→ Editando cliente...")
        cliente_editado = editar_cliente(page, cliente)
        print(f"✓ Cliente editado: {cliente_editado}")

        # Paso 3: Validar que el cliente fue editado correctamente
        if validar_cliente_existe(page, cliente_editado):
            print("✓ FLUJO EDITAR CLIENTE FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Cambios aplicados correctamente")
        else:
            print("✗ FALLÓ EL FLUJO EDITAR CLIENTE")
            print(f"✗ No se encontró el cliente con los cambios")

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
