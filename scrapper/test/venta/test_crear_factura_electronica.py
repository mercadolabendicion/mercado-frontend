"""
E2E Test: Crear Factura Electrónica
Este test puede ejecutarse de forma independiente.
Crea un cliente, un producto, y luego realiza una factura electrónica.
"""

from core.browser import get_page
from core.login import login
from actions.cliente_actions import crear_cliente
from actions.producto_actions import crear_producto
from actions.venta_actions import crear_factura_electronica


def main():
    """
    Flujo completo para crear una factura electrónica.
    Este test es independiente: crea el cliente y producto necesarios antes de la factura.
    """
    playwright, browser, context, page = get_page(headless=False)

    try:
        # Autenticación
        login(page)

        # Paso 1: Crear cliente para la factura
        print("→ Creando cliente para la factura...")
        cliente = crear_cliente(page)
        print(f"✓ Cliente creado: {cliente['nombre']} - {cliente['cedula']}")

        # Paso 2: Crear producto para la factura
        print("→ Creando producto para la factura...")
        producto = crear_producto(page)
        print(f"✓ Producto creado: {producto['nombre']} - {producto['codigo']}")

        # Paso 3: Crear factura electrónica
        print("→ Creando factura electrónica...")
        items = [{
            "codigo": producto["codigo"],
            "nombre": producto["nombre"],
            "cantidad": 5,
            "precio": 1500.0
        }]
        
        factura = crear_factura_electronica(page, cliente["cedula"], items)
        print(f"✓ Factura electrónica creada:")
        print(f"  - Número: {factura['numero_factura']}")
        print(f"  - Total: ${factura['total']}")
        print(f"  - Cliente: {factura['cliente_cedula']}")
        print("✓ FLUJO CREAR FACTURA ELECTRÓNICA FUNCIONÓ CORRECTAMENTE")

    finally:
        browser.close()
        playwright.stop()


if __name__ == "__main__":
    main()
