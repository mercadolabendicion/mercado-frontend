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


class Factura(TypedDict):
    """Estructura de datos para una factura."""
    tipo: str  # 'fisica' o 'electronica'
    cliente_cedula: str
    items: List[ItemVenta]
    total: float
    numero_factura: str


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
    try:
        campo_cliente = page.locator("input[placeholder*='Cliente' i], input[formcontrolname='cliente'], input[placeholder*='Cédula' i]").first
        campo_cliente.wait_for(state="visible", timeout=10000)
        campo_cliente.fill(cedula)
        page.wait_for_timeout(1500)
        
        # Si hay un dropdown de sugerencias, seleccionar el primero
        try:
            page.wait_for_selector("mat-option, li.suggestion", timeout=3000)
            page.click("mat-option:first-child, li.suggestion:first-child")
            page.wait_for_timeout(500)
        except:
            # Intentar presionar Enter para confirmar
            page.keyboard.press("Enter")
            page.wait_for_timeout(500)
    except Exception as e:
        print(f"⚠ Advertencia al seleccionar cliente: {e}")


# -------------------------------------------------------------------
# Agregar productos
# -------------------------------------------------------------------
def agregar_producto_a_venta(page, codigo_producto: str, cantidad: int = 1) -> None:
    """Agrega un producto a la venta escaneando o escribiendo el código."""
    # Buscar campo de escaneo/búsqueda de producto
    try:
        campo_producto = page.locator("input[placeholder*='Escanear' i], input[placeholder*='Código' i], input[placeholder*='Producto' i]").first
        campo_producto.wait_for(state="visible", timeout=10000)
        
        # Escribir código del producto
        campo_producto.fill(codigo_producto)
        page.keyboard.press("Enter")
        page.wait_for_timeout(1500)
        
        # Si hay campo de cantidad, ajustarla
        if cantidad > 1:
            try:
                campo_cantidad = page.locator("input[formcontrolname='cantidad'], input[placeholder*='Cantidad' i]").last
                campo_cantidad.wait_for(state="visible", timeout=3000)
                campo_cantidad.fill("")
                campo_cantidad.fill(str(cantidad))
                page.keyboard.press("Enter")
                page.wait_for_timeout(500)
            except:
                pass  # Cantidad por defecto es 1
    except Exception as e:
        print(f"⚠ Advertencia al agregar producto: {e}")


# -------------------------------------------------------------------
# Finalizar venta
# -------------------------------------------------------------------
def finalizar_venta(page, metodo_pago: str = "efectivo") -> None:
    """
    Finaliza la venta y procesa el pago.
    metodo_pago: 'efectivo', 'tarjeta', 'transferencia', etc.
    """
    # Click en botón de finalizar/cobrar
    try:
        boton_finalizar = page.locator("button:has-text('Finalizar'), button:has-text('Cobrar'), button#finalizar, button#cobrar").first
        boton_finalizar.wait_for(state="visible", timeout=10000)
        boton_finalizar.click()
        page.wait_for_timeout(1500)
    except Exception as e:
        print(f"⚠ Advertencia al hacer clic en finalizar: {e}")
    
    # Seleccionar método de pago si hay opciones
    try:
        if metodo_pago == "efectivo":
            page.click("button:has-text('Efectivo'), input[value='efectivo'], label:has-text('Efectivo')", timeout=3000)
        elif metodo_pago == "tarjeta":
            page.click("button:has-text('Tarjeta'), input[value='tarjeta'], label:has-text('Tarjeta')", timeout=3000)
        page.wait_for_timeout(500)
    except:
        pass  # No hay selector de método de pago o ya está seleccionado
    
    # Confirmar venta
    try:
        page.wait_for_selector(".swal2-confirm, button:has-text('Confirmar'), button#confirmar", timeout=60000)
        page.click(".swal2-confirm, button:has-text('Confirmar'), button#confirmar")
        page.wait_for_timeout(2000)
    except Exception as e:
        print(f"⚠ Advertencia al confirmar venta: {e}")


def cerrar_dialogo_venta_exitosa(page) -> None:
    """Cierra el diálogo de confirmación de venta exitosa."""
    try:
        page.wait_for_selector(".swal2-confirm", timeout=5000)
        page.click(".swal2-confirm")
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
    page.wait_for_timeout(1000)
    
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
# Eliminar venta
# -------------------------------------------------------------------
def eliminar_venta(page, cliente_cedula: str = None, index: int = 0) -> None:
    """
    Elimina una venta desde la lista de ventas.
    Si se proporciona cliente_cedula, busca primero por ese cliente.
    index: posición de la venta en la tabla (0 = primera)
    """
    navegar_a_lista_ventas(page)
    page.wait_for_timeout(2000)
    
    # Si se proporciona cédula, filtrar primero
    if cliente_cedula:
        try:
            campo_busqueda = page.locator("input[placeholder*='Buscar' i]").first
            campo_busqueda.fill(cliente_cedula)
            page.wait_for_timeout(1500)
        except:
            pass
    
    # Buscar botón de eliminar en la fila correspondiente
    try:
        filas = page.locator("tbody tr, table tr")
        # Contar filas de datos (excluyendo header)
        fila = filas.nth(index)
        
        # Buscar el botón de eliminar (puede ser ❌ o un botón con texto)
        try:
            fila.locator("button:has-text('❌'), button:has-text('Eliminar'), button.eliminar").first.click()
        except:
            fila.locator("button").last.click()  # Último botón suele ser eliminar
        
        page.wait_for_timeout(1000)
        
        # Confirmar eliminación en el diálogo
        try:
            page.wait_for_selector(".swal2-popup", timeout=10000, state="visible")
            page.wait_for_selector(".swal2-confirm", timeout=5000, state="visible")
            page.wait_for_timeout(500)
            page.click(".swal2-confirm")
            page.wait_for_selector(".swal2-popup", timeout=5000, state="hidden")
            page.wait_for_timeout(1000)
            
            # Manejar alerta de éxito si aparece
            try:
                page.wait_for_selector(".swal2-popup", timeout=5000, state="visible")
                page.wait_for_selector(".swal2-confirm", timeout=3000, state="visible")
                page.wait_for_timeout(300)
                page.click(".swal2-confirm")
                page.wait_for_selector(".swal2-popup", timeout=5000, state="hidden")
                page.wait_for_timeout(500)
            except:
                pass
        except Exception as e:
            print(f"⚠ Advertencia al confirmar eliminación de venta: {e}")
    except Exception as e:
        print(f"⚠ Error al eliminar venta: {e}")


# -------------------------------------------------------------------
# Cancelar venta (alias de eliminar_venta para compatibilidad)
# -------------------------------------------------------------------
def cancelar_venta_en_lista(page, index: int = 0) -> None:
    """
    Cancela una venta desde la lista de ventas.
    index: posición de la venta en la tabla (0 = primera)
    """
    eliminar_venta(page, index=index)


# -------------------------------------------------------------------
# Crear factura
# -------------------------------------------------------------------
def crear_factura(page, tipo_factura: str, cliente_cedula: str, items: List[ItemVenta]) -> Factura:
    """
    Flujo completo para crear una factura (física o electrónica).
    tipo_factura: 'fisica' o 'electronica'
    Retorna los datos de la factura creada.
    """
    navegar_a_ventas(page)
    page.wait_for_timeout(1000)
    
    # Seleccionar cliente
    if cliente_cedula:
        seleccionar_cliente_venta(page, cliente_cedula)
    
    # Agregar productos
    total = 0.0
    for item in items:
        agregar_producto_a_venta(page, item["codigo"], item["cantidad"])
        total += item["precio"] * item["cantidad"]
    
    # Seleccionar tipo de factura antes de finalizar
    try:
        if tipo_factura.lower() == "electronica":
            # Buscar checkbox, radio o toggle para factura electrónica
            page.click("input[value='electronica'], label:has-text('Electrónica'), button:has-text('Electrónica')", timeout=5000)
        else:
            # Factura física (puede ser el default)
            try:
                page.click("input[value='fisica'], label:has-text('Física'), button:has-text('Física')", timeout=3000)
            except:
                pass  # Física puede ser el valor por defecto
        page.wait_for_timeout(500)
    except Exception as e:
        print(f"⚠ Advertencia al seleccionar tipo de factura: {e}")
    
    # Finalizar venta/factura
    finalizar_venta(page)
    
    # Intentar obtener número de factura del diálogo de éxito
    numero_factura = "N/A"
    try:
        # Buscar el número en el diálogo de éxito
        texto_dialogo = page.locator(".swal2-content, .swal2-html-container").first.text_content(timeout=3000)
        # Intentar extraer número de factura del texto
        import re
        match = re.search(r'(?:factura|número|no\.?)\s*:?\s*(\d+)', texto_dialogo, re.IGNORECASE)
        if match:
            numero_factura = match.group(1)
    except:
        pass
    
    cerrar_dialogo_venta_exitosa(page)
    
    factura = {
        "tipo": tipo_factura,
        "cliente_cedula": cliente_cedula,
        "items": items,
        "total": total,
        "numero_factura": numero_factura
    }
    
    return factura


def crear_factura_fisica(page, cliente_cedula: str, items: List[ItemVenta]) -> Factura:
    """
    Flujo específico para crear una factura física.
    Retorna los datos de la factura creada.
    """
    return crear_factura(page, "fisica", cliente_cedula, items)


def crear_factura_electronica(page, cliente_cedula: str, items: List[ItemVenta]) -> Factura:
    """
    Flujo específico para crear una factura electrónica.
    Retorna los datos de la factura creada.
    """
    return crear_factura(page, "electronica", cliente_cedula, items)
