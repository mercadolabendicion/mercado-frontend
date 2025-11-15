"""
Acciones reutilizables para el módulo de Ventas.
Cada función representa una acción atómica que puede ser utilizada en diferentes flujos.
"""

from typing import TypedDict, List


class ItemVenta(TypedDict):
    """Estructura de un item en la venta."""
    codigo: str
    nombre: str
    cantidad: int
    precio: float


class Venta(TypedDict):
    """Estructura de datos para una venta."""
    cliente_cedula: str
    items: List[ItemVenta]
    total: float


# -------------------------------------------------------------------
# Navegación
# -------------------------------------------------------------------
def navegar_a_ventas(page) -> None:
    """Navega al módulo de ventas desde cualquier pantalla."""
    page.click("a.sidebar-link[routerlink='/app/venta']")
    page.wait_for_url("**/app/venta", timeout=60000)
    page.wait_for_selector("app-venta", timeout=10000)


def navegar_a_lista_ventas(page) -> None:
    """Navega a la lista de ventas desde cualquier pantalla."""
    page.click("a.sidebar-link[routerlink='/app/lista-ventas']")
    page.wait_for_url("**/app/lista-ventas", timeout=60000)
    page.wait_for_selector("app-lista-ventas", timeout=10000)


# -------------------------------------------------------------------
# Seleccionar cliente
# -------------------------------------------------------------------
def seleccionar_cliente_venta(page, cedula: str) -> None:
    """Selecciona un cliente para la venta usando su cédula."""
    # Buscar campo de cliente (puede variar según implementación)
    page.fill("input[placeholder*='Cliente' i], input[formcontrolname='cliente']", cedula)
    page.wait_for_timeout(1000)
    
    # Si hay un dropdown de sugerencias, seleccionar el primero
    try:
        page.click("mat-option:first-child, li.suggestion:first-child", timeout=2000)
    except:
        pass  # No hay dropdown o ya está seleccionado


# -------------------------------------------------------------------
# Agregar productos
# -------------------------------------------------------------------
def agregar_producto_a_venta(page, codigo_producto: str, cantidad: int = 1) -> None:
    """Agrega un producto a la venta escaneando o escribiendo el código."""
    # Buscar campo de escaneo/búsqueda de producto
    campo_producto = page.locator("input[placeholder*='Escanear' i], input[placeholder*='Código' i]").first
    
    # Escribir código del producto
    campo_producto.fill(codigo_producto)
    page.keyboard.press("Enter")
    page.wait_for_timeout(1000)
    
    # Si hay campo de cantidad, ajustarla
    try:
        campo_cantidad = page.locator("input[formcontrolname='cantidad'], input[placeholder*='Cantidad' i]").last
        if cantidad > 1:
            campo_cantidad.fill(str(cantidad))
            page.keyboard.press("Enter")
    except:
        pass  # Cantidad por defecto es 1


# -------------------------------------------------------------------
# Finalizar venta
# -------------------------------------------------------------------
def finalizar_venta(page, metodo_pago: str = "efectivo") -> None:
    """
    Finaliza la venta y procesa el pago.
    metodo_pago: 'efectivo', 'tarjeta', 'transferencia', etc.
    """
    # Click en botón de finalizar/cobrar
    page.click("button:has-text('Finalizar'), button:has-text('Cobrar'), button#finalizar")
    page.wait_for_timeout(1000)
    
    # Seleccionar método de pago si hay opciones
    try:
        if metodo_pago == "efectivo":
            page.click("button:has-text('Efectivo'), input[value='efectivo']", timeout=2000)
        elif metodo_pago == "tarjeta":
            page.click("button:has-text('Tarjeta'), input[value='tarjeta']", timeout=2000)
    except:
        pass  # No hay selector de método de pago o ya está seleccionado
    
    # Confirmar venta
    page.wait_for_selector(".swal2-confirm, button:has-text('Confirmar')", timeout=60000)
    page.click(".swal2-confirm, button:has-text('Confirmar')")
    page.wait_for_timeout(2000)


def cerrar_dialogo_venta_exitosa(page) -> None:
    """Cierra el diálogo de confirmación de venta exitosa."""
    try:
        page.click(".swal2-confirm", timeout=5000)
        page.wait_for_timeout(1000)
    except:
        pass  # No hay diálogo o ya se cerró


# -------------------------------------------------------------------
# Crear venta completa
# -------------------------------------------------------------------
def crear_venta(page, cliente_cedula: str, items: List[ItemVenta]) -> Venta:
    """
    Flujo completo para crear una venta.
    Retorna los datos de la venta creada.
    """
    navegar_a_ventas(page)
    
    # Seleccionar cliente
    if cliente_cedula:
        seleccionar_cliente_venta(page, cliente_cedula)
    
    # Agregar productos
    total = 0.0
    for item in items:
        agregar_producto_a_venta(page, item["codigo"], item["cantidad"])
        total += item["precio"] * item["cantidad"]
    
    # Finalizar venta
    finalizar_venta(page)
    cerrar_dialogo_venta_exitosa(page)
    
    venta = {
        "cliente_cedula": cliente_cedula,
        "items": items,
        "total": total
    }
    
    return venta


# -------------------------------------------------------------------
# Validar venta
# -------------------------------------------------------------------
def validar_venta_en_lista(page, cliente_cedula: str) -> bool:
    """
    Valida que existe una venta para el cliente en la lista de ventas.
    Retorna True si encuentra al menos una venta, False en caso contrario.
    """
    navegar_a_lista_ventas(page)
    page.wait_for_timeout(2000)
    
    # Buscar por cédula del cliente
    try:
        campo_busqueda = page.locator("input[placeholder*='Buscar' i]").first
        campo_busqueda.fill(cliente_cedula)
        page.wait_for_timeout(1500)
    except:
        pass
    
    # Verificar si hay resultados en la tabla
    try:
        return page.locator(f"td:has-text('{cliente_cedula}'), tr:has-text('{cliente_cedula}')").first.is_visible(timeout=3000)
    except:
        return False


# -------------------------------------------------------------------
# Cancelar venta
# -------------------------------------------------------------------
def cancelar_venta_en_lista(page, index: int = 0) -> None:
    """
    Cancela una venta desde la lista de ventas.
    index: posición de la venta en la tabla (0 = primera)
    """
    navegar_a_lista_ventas(page)
    page.wait_for_timeout(2000)
    
    # Buscar botón de cancelar en la fila correspondiente
    filas = page.locator("tr")
    if filas.count() > index + 1:  # +1 por el header
        fila = filas.nth(index + 1)
        fila.locator("button[title*='Cancelar' i], button:has-text('Cancelar')").click()
        
        # Confirmar cancelación
        page.wait_for_selector(".swal2-confirm", timeout=60000)
        page.click(".swal2-confirm")
        page.wait_for_timeout(1500)
