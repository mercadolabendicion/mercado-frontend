"""
E2E Test: CRUD Completo de Producto
Este test valida el ciclo de vida completo de un producto: Crear, Leer, Actualizar y Eliminar.
Encadena los scripts individuales para evitar duplicación de código.
"""

# Importar los módulos de test individuales
import test.producto.test_crear_producto as test_crear
import test.producto.test_editar_producto as test_editar
import test.producto.test_eliminar_producto as test_eliminar

from core.browser import get_page
from core.login import login
from actions.producto_actions import (
    crear_producto,
    validar_producto_existe,
    editar_producto,
    eliminar_producto,
    validar_producto_no_existe
)


def main():
    """
    Flujo completo CRUD para producto.
    Reutiliza los scripts individuales de crear, editar y eliminar.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # CREATE: Crear producto
        print("→ [CREATE] Creando producto...")
        producto = crear_producto(page)
        print(f"✓ Producto creado: {producto}")

        # READ: Validar que existe
        print("→ [READ] Validando que el producto existe...")
        if validar_producto_existe(page, producto):
            print(f"✓ Producto encontrado en el sistema")
        else:
            print(f"✗ Error: Producto no encontrado después de crear")
            return

        # UPDATE: Editar producto (reutiliza lógica del test de editar)
        print("→ [UPDATE] Editando producto...")
        producto_editado = editar_producto(page, producto)
        print(f"✓ Producto editado: {producto_editado}")
        
        # Validar cambios
        if validar_producto_existe(page, producto_editado):
            print(f"✓ Cambios guardados correctamente")
        else:
            print(f"✗ Error: Cambios no se guardaron")
            return

        # DELETE: Eliminar producto (reutiliza lógica del test de eliminar)
        print("→ [DELETE] Eliminando producto...")
        eliminar_producto(page, producto_editado)
        
        # Validar eliminación
        if validar_producto_no_existe(page, producto_editado):
            print(f"✓ Producto eliminado correctamente")
        else:
            print(f"✗ Error: Producto no se eliminó")
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
