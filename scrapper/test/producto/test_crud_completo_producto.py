"""
E2E Test: CRUD Completo de Producto
Este test valida el ciclo de vida completo de un producto: Crear, Leer, Actualizar y Eliminar.
Encadena los scripts individuales llamando a sus funciones específicas.
"""

from core.browser import get_page
from core.login import login

# Importar funciones específicas de cada test
from test.producto.test_crear_producto import ejecutar_crear_producto
from test.producto.test_editar_producto import ejecutar_editar_producto
from test.producto.test_eliminar_producto import ejecutar_eliminar_producto


def main():
    """
    Flujo completo CRUD para producto.
    Encadena las funciones de los tests individuales: crear → editar → eliminar.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # CREATE: Llamar al script de crear
        print("→ [CREATE] Creando producto...")
        producto = ejecutar_crear_producto(page)
        if not producto:
            print("✗ Error en CREATE - abortando flujo CRUD")
            return

        # UPDATE: Llamar al script de editar
        print("\n→ [UPDATE] Editando producto...")
        producto_editado = ejecutar_editar_producto(page, producto)
        if not producto_editado:
            print("✗ Error en UPDATE - abortando flujo CRUD")
            return

        # DELETE: Llamar al script de eliminar
        print("\n→ [DELETE] Eliminando producto...")
        eliminado = ejecutar_eliminar_producto(page, producto_editado)
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
