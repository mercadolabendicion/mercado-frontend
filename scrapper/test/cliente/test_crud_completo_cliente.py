"""
E2E Test: CRUD Completo de Cliente
Este test valida el ciclo de vida completo de un cliente: Crear, Leer, Actualizar y Eliminar.
Es un test independiente que se ejecuta de forma autónoma.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import (
    crear_cliente,
    validar_cliente_existe,
    editar_cliente,
    eliminar_cliente,
    validar_cliente_no_existe
)


def main():
    """
    Flujo completo CRUD para cliente.
    Valida todas las operaciones básicas de forma secuencial.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # CREATE: Crear cliente
        print("→ [CREATE] Creando cliente...")
        cliente = crear_cliente(page)
        print(f"✓ Cliente creado: {cliente}")

        # READ: Validar que existe
        print("→ [READ] Validando que el cliente existe...")
        if validar_cliente_existe(page, cliente):
            print(f"✓ Cliente encontrado en el sistema")
        else:
            print(f"✗ Error: Cliente no encontrado después de crear")
            return

        # UPDATE: Editar cliente
        print("→ [UPDATE] Editando cliente...")
        cliente_editado = editar_cliente(page, cliente)
        print(f"✓ Cliente editado: {cliente_editado}")
        
        # Validar cambios
        if validar_cliente_existe(page, cliente_editado):
            print(f"✓ Cambios guardados correctamente")
        else:
            print(f"✗ Error: Cambios no se guardaron")
            return

        # DELETE: Eliminar cliente
        print("→ [DELETE] Eliminando cliente...")
        eliminar_cliente(page, cliente_editado)
        
        # Validar eliminación
        if validar_cliente_no_existe(page, cliente_editado):
            print(f"✓ Cliente eliminado correctamente")
        else:
            print(f"✗ Error: Cliente no se eliminó")
            return

        print("\n" + "="*60)
        print("✓ FLUJO CRUD COMPLETO FUNCIONÓ CORRECTAMENTE")
        print("="*60)
        print(f"  • CREATE: ✓")
        print(f"  • READ:   ✓")
        print(f"  • UPDATE: ✓")
        print(f"  • DELETE: ✓")
        print("="*60)

    finally:
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
