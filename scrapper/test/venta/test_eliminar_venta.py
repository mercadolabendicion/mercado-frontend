"""
E2E Test: Eliminar Venta
Este test puede ejecutarse de forma independiente.
Crea un cliente, un producto, realiza una venta y luego la elimina.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import crear_cliente
from actions.producto_actions import crear_producto
from actions.venta_actions import crear_venta, validar_venta_en_lista, eliminar_venta


def main():
    """
    Flujo completo para eliminar una venta.
    Este test es independiente: crea el cliente, producto y venta antes de eliminarla.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear cliente para la venta
        print("→ Creando cliente para la venta...")
        cliente = crear_cliente(page)
        print(f"✓ Cliente creado: {cliente['nombre']} - {cliente['cedula']}")

        # Paso 2: Crear producto para la venta
        print("→ Creando producto para la venta...")
        producto = crear_producto(page)
        print(f"✓ Producto creado: {producto['nombre']} - {producto['codigo']}")

        # Paso 3: Crear venta
        print("→ Realizando venta...")
        items = [{
            "codigo": producto["codigo"],
            "nombre": producto["nombre"],
            "cantidad": 2,
            "precio": 1500.0
        }]
        
        venta = crear_venta(page, cliente["cedula"], items)
        print(f"✓ Venta creada - Total: ${venta['total']}")

        # Paso 4: Validar que la venta fue registrada
        if validar_venta_en_lista(page, cliente["cedula"]):
            print(f"✓ Venta registrada para cliente: {cliente['cedula']}")
        else:
            print("✗ Error: No se encontró la venta en la lista")
            return

        # Paso 5: Eliminar la venta
        print("→ Eliminando venta...")
        eliminar_venta(page, cliente_cedula=cliente["cedula"], index=0)
        print("✓ FLUJO ELIMINAR VENTA FUNCIONÓ CORRECTAMENTE")

    finally:
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
