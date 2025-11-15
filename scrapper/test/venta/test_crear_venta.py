"""
E2E Test: Crear Venta
Este test puede ejecutarse de forma independiente.
Crea un cliente, un producto, y luego realiza una venta, validando todo el flujo.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import crear_cliente
from actions.producto_actions import crear_producto
from actions.venta_actions import crear_venta, validar_venta_en_lista


def main():
    """
    Flujo completo para crear una venta.
    Este test es independiente: crea el cliente y producto necesarios antes de la venta.
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
            print("✓ FLUJO CREAR VENTA FUNCIONÓ CORRECTAMENTE")
            print(f"✓ Venta registrada para cliente: {cliente['cedula']}")
        else:
            print("✗ FALLÓ EL FLUJO CREAR VENTA")
            print(f"✗ No se encontró la venta en la lista")

    finally:
        context.close()
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
