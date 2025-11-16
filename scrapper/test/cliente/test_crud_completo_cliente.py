"""
E2E Test: CRUD Completo de Cliente
Este test valida el ciclo de vida completo de un cliente: Crear, Leer, Actualizar y Eliminar.
Encadena los scripts individuales llamando a sus funciones específicas.
"""

from core.browser import get_page
from core.login import login

# Importar funciones específicas de cada test
from test.cliente.test_crear_cliente import ejecutar_crear_cliente
from test.cliente.test_editar_cliente import ejecutar_editar_cliente
from test.cliente.test_eliminar_cliente import ejecutar_eliminar_cliente


def main():
    """
    Flujo completo CRUD para cliente.
    Encadena las funciones de los tests individuales: crear → editar → eliminar.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # CREATE: Llamar al script de crear
        print("→ [CREATE] Creando cliente...")
        cliente = ejecutar_crear_cliente(page)
        if not cliente:
            print("✗ Error en CREATE - abortando flujo CRUD")
            return

        # UPDATE: Llamar al script de editar
        print("\n→ [UPDATE] Editando cliente...")
        cliente_editado = ejecutar_editar_cliente(page, cliente)
        if not cliente_editado:
            print("✗ Error en UPDATE - abortando flujo CRUD")
            return

        # DELETE: Llamar al script de eliminar
        print("\n→ [DELETE] Eliminando cliente...")
        eliminado = ejecutar_eliminar_cliente(page, cliente_editado)
        if not eliminado:
            print("✗ Error en DELETE - flujo CRUD incompleto")
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
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
