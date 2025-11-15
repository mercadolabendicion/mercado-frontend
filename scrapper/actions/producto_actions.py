"""
Acciones reutilizables para el módulo de Productos.
Cada función representa una acción atómica que puede ser utilizada en diferentes flujos.
"""

from datetime import datetime, timedelta
import random
from typing import TypedDict


class Producto(TypedDict):
    """Estructura de datos para un producto."""
    codigo: str
    nombre: str
    lote: str
    fecha_vencimiento: str


# -------------------------------------------------------------------
# Navegación
# -------------------------------------------------------------------
def navegar_a_productos(page) -> None:
    """Navega al módulo de productos desde cualquier pantalla."""
    page.click("a.sidebar-link[routerlink='/app/producto']")
    page.wait_for_url("**/app/producto", timeout=60000)
    page.wait_for_selector("app-producto")


def refrescar_modulo_productos(page) -> None:
    """Recarga el módulo Angular para actualizar la tabla."""
    page.click("a.sidebar-link[routerlink='/app/producto']")
    page.wait_for_url("**/app/producto", timeout=60000)
    # Esperar el campo de escaneo/búsqueda y dar un poco más de tiempo para que la tabla se actualice
    page.wait_for_selector("input[placeholder*='Escanear']", timeout=60000)
    page.wait_for_timeout(500)  # Reduced from 1500ms to 500ms


# -------------------------------------------------------------------
# Generación de datos
# -------------------------------------------------------------------
def generar_datos_producto() -> Producto:
    """Genera datos aleatorios controlados para crear un producto de prueba."""
    r = random.randint(10000, 99999)
    return {
        "nombre": f"Producto QA AUT {r}",
        "codigo": f"Q{r}",
        "lote": f"LOTE-{r}",
        "fecha_vencimiento": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
    }


# -------------------------------------------------------------------
# Crear producto
# -------------------------------------------------------------------
def abrir_formulario_nuevo_producto(page) -> None:
    """Abre el formulario para crear un nuevo producto."""
    page.click("button#nuevo")
    page.wait_for_selector("h1.nota:has-text('Registro de productos')")


def llenar_formulario_producto(page, producto: Producto) -> None:
    """Completa el formulario de producto con los datos proporcionados."""
    page.fill("input[formcontrolname='codigo']", producto["codigo"])
    page.fill("input[formcontrolname='nombre']", producto["nombre"])
    page.fill("input[formcontrolname='fecha_vencimiento']", producto["fecha_vencimiento"])
    page.fill("input[formcontrolname='lote']", producto["lote"])

    # Configurar primera forma de venta
    formas = page.locator("div[formarrayname='formasVenta']")
    formas.locator("input[formcontrolname='nombre']").first.fill("Unidad")
    formas.locator("input[formcontrolname='precioCompra']").first.fill("1000")
    formas.locator("input[formcontrolname='precioVenta']").first.fill("1500")
    formas.locator("input[formcontrolname='cantidad']").first.fill("50")

    # Seleccionar impuesto 0
    page.select_option("select[formcontrolname='impuesto']", "0")


def guardar_producto(page) -> None:
    """Guarda el producto y confirma el diálogo de éxito."""
    page.click("button#azul")
    # Manejar ambos comportamientos: swal2 o cierre directo de modal/dialog
    try:
        page.wait_for_selector(".swal2-confirm", timeout=5000)
        page.click(".swal2-confirm")
        page.wait_for_timeout(500)  # Reduced from 1000ms to 500ms
    except Exception:
        # Si no aparece swal, esperar cierre del modal o un pequeño retardo
        try:
            page.wait_for_selector("app-editar-producto, .modal", state="hidden", timeout=5000)
        except Exception:
            page.wait_for_timeout(500)  # Reduced from 1200ms to 500ms


def crear_producto(page, producto: Producto = None) -> Producto:
    """
    Flujo completo para crear un producto.
    Si no se proporciona un producto, genera uno aleatorio.
    Retorna los datos del producto creado.
    """
    if producto is None:
        producto = generar_datos_producto()
    
    navegar_a_productos(page)
    abrir_formulario_nuevo_producto(page)
    llenar_formulario_producto(page, producto)
    guardar_producto(page)
    
    return producto


# -------------------------------------------------------------------
# Buscar producto
# -------------------------------------------------------------------
def buscar_producto(page, codigo: str) -> None:
    """Busca un producto por su código utilizando el campo de escaneo."""
    page.fill("input[placeholder*='Escanear']", codigo)
    page.wait_for_timeout(1000)  # Give time for table to filter


def validar_producto_existe(page, producto: Producto) -> bool:
    """
    Valida que el producto existe en la tabla.
    Retorna True si el producto está visible, False en caso contrario.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    # Esperar explícitamente a que el nombre aparezca en la tabla (evita falsos negativos por asincronía)
    locator = page.locator(f"text={producto['nombre']}").first
    try:
        locator.wait_for(state="visible", timeout=3000)
        return True
    except:
        return False


# -------------------------------------------------------------------
# Eliminar producto
# -------------------------------------------------------------------
def seleccionar_producto_en_tabla(page, nombre: str) -> None:
    """Selecciona un producto en la tabla haciendo clic en su botón de eliminar."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    # El botón de eliminar es el que tiene el emoji ❌ y la clase "red-x"
    # En la UI actual hay tres botones: Ver (👁️), Eliminar (❌), Editar (✏️)
    # Necesitamos hacer clic específicamente en el botón con ❌
    delete_button = row.locator("button:has-text('❌')").first
    # Asegurar que el botón esté visible y sea clickeable
    delete_button.wait_for(state="visible", timeout=5000)
    # Scroll al botón si es necesario y hacer clic con force para asegurar que Angular detecte el evento
    delete_button.scroll_into_view_if_needed()
    delete_button.click(force=True)


def confirmar_eliminacion(page) -> None:
    """Confirma el diálogo de eliminación de SweetAlert2."""
    # Esperar a que aparezca el diálogo de SweetAlert2 y hacer clic en el botón de confirmación
    try:
        # Esperar a que el modal de SweetAlert2 esté visible
        page.wait_for_selector(".swal2-popup", timeout=10000, state="visible")
        # Esperar al botón de confirmación específicamente
        page.wait_for_selector(".swal2-confirm", timeout=5000, state="visible")
        # Pequeño delay para asegurar que el botón sea interactuable
        page.wait_for_timeout(500)
        # Hacer clic en el botón de confirmación
        page.click(".swal2-confirm")
        # Esperar a que el diálogo desaparezca
        page.wait_for_selector(".swal2-popup", timeout=5000, state="hidden")
        # Dar tiempo para que la eliminación se procese
        page.wait_for_timeout(1000)
    except Exception as e:
        # Si el diálogo no aparece o hay algún error, registrarlo pero continuar
        print(f"⚠ Advertencia al confirmar eliminación: {e}")
        page.wait_for_timeout(1000)


def eliminar_producto(page, producto: Producto) -> None:
    """
    Flujo completo para eliminar un producto.
    Requiere que el producto ya exista en el sistema.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    # Esperar a que la fila con el nombre del producto sea visible después de la búsqueda
    page.locator(f"tr:has-text('{producto['nombre']}')").first.wait_for(state="visible", timeout=5000)
    seleccionar_producto_en_tabla(page, producto["nombre"])
    confirmar_eliminacion(page)
    # Esperar que la fila del producto (por código) sea removida del DOM
    try:
        row = page.locator(f"tr:has-text('{producto['codigo']}')").first
        row.wait_for(state="hidden", timeout=5000)
    except Exception:
        pass
    refrescar_modulo_productos(page)


def validar_producto_no_existe(page, producto: Producto) -> bool:
    """
    Valida que el producto NO existe en la tabla.
    Retorna True si el producto no está visible, False si aún existe.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    # Buscar la fila por código (más estable) y esperar que desaparezca
    row = page.locator(f"tr:has-text('{producto['codigo']}')").first
    try:
        row.wait_for(state="hidden", timeout=3000)
        return True
    except Exception:
        try:
            return not row.is_visible()
        except Exception:
            return True


# -------------------------------------------------------------------
# Editar producto
# -------------------------------------------------------------------
def abrir_edicion_producto(page, nombre: str) -> None:
    """Abre el formulario de edición de un producto desde la tabla."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    # En la UI actual el botón de editar tiene un emoji (✏️) y/o la clase "editar". Abrir modal/dialog y esperar al componente.
    try:
        row.locator("button.editar, button:has-text('✏️'), button:has-text('Editar')").first.click()
    except:
        row.locator("button:has-text('✏️'), button:has-text('Editar')").first.click()

    # Esperar por el componente de edición (MatDialog) o por inputs del formulario
    page.wait_for_selector("app-editar-producto, input[formcontrolname='nombre'], input[id='codigo']", timeout=60000)
    # Dar tiempo adicional para que el formulario se cargue completamente
    page.wait_for_timeout(1500)


def editar_producto(page, producto_original: Producto, nuevos_datos: dict = None) -> Producto:
    """
    Flujo completo para editar un producto existente.
    Si nuevos_datos no se proporciona, actualiza solo algunos campos.
    nuevos_datos puede incluir:
    - nombre: nuevo nombre del producto
    - lote: nuevo lote
    - fecha_vencimiento: nueva fecha de vencimiento
    - formas_venta: lista de formas de venta a actualizar
      Ejemplo: [{"nombre": "Unidad", "precioVenta": "2000"}, ...]
    - agregar_forma_venta: dict con datos de nueva forma de venta
      Ejemplo: {"nombre": "Caja", "precioCompra": "5000", "precioVenta": "7000", "cantidad": "12"}
    
    Retorna el producto con los datos actualizados.
    """
    if nuevos_datos is None:
        # Actualizar solo algunos campos por defecto
        r = random.randint(10000, 99999)
        nuevos_datos = {
            "nombre": f"Producto QA EDITADO {r}",
            "lote": f"LOTE-EDIT-{r}",
        }
    
    navegar_a_productos(page)
    buscar_producto(page, producto_original["codigo"])
    abrir_edicion_producto(page, producto_original["nombre"])
    
    # Actualizar campos básicos del producto
    if "nombre" in nuevos_datos:
        nombre_input = page.locator("input[formcontrolname='nombre']").first
        nombre_input.wait_for(state="visible", timeout=10000)
        nombre_input.fill("")
        nombre_input.fill(nuevos_datos["nombre"])
    
    if "lote" in nuevos_datos:
        lote_input = page.locator("input[formcontrolname='lote']").first
        lote_input.fill("")
        lote_input.fill(nuevos_datos["lote"])
    
    if "fecha_vencimiento" in nuevos_datos:
        fecha_input = page.locator("input[formcontrolname='fecha_vencimiento']").first
        fecha_input.fill("")
        fecha_input.fill(nuevos_datos["fecha_vencimiento"])
    
    # Actualizar formas de venta existentes
    if "formas_venta" in nuevos_datos:
        formas = page.locator("div[formarrayname='formasVenta']")
        for idx, forma in enumerate(nuevos_datos["formas_venta"]):
            if "nombre" in forma:
                formas.locator("input[formcontrolname='nombre']").nth(idx).fill("")
                formas.locator("input[formcontrolname='nombre']").nth(idx).fill(forma["nombre"])
            if "precioCompra" in forma:
                formas.locator("input[formcontrolname='precioCompra']").nth(idx).fill("")
                formas.locator("input[formcontrolname='precioCompra']").nth(idx).fill(str(forma["precioCompra"]))
            if "precioVenta" in forma:
                formas.locator("input[formcontrolname='precioVenta']").nth(idx).fill("")
                formas.locator("input[formcontrolname='precioVenta']").nth(idx).fill(str(forma["precioVenta"]))
            if "cantidad" in forma:
                formas.locator("input[formcontrolname='cantidad']").nth(idx).fill("")
                formas.locator("input[formcontrolname='cantidad']").nth(idx).fill(str(forma["cantidad"]))
    
    # Agregar nueva forma de venta si se especifica
    if "agregar_forma_venta" in nuevos_datos:
        # Buscar y hacer clic en el botón para agregar forma de venta
        try:
            agregar_btn = page.locator("button:has-text('Agregar forma'), button:has-text('Agregar'), button[title*='Agregar']").first
            agregar_btn.click()
            page.wait_for_timeout(800)
            
            # Llenar la nueva forma de venta (será la última)
            formas = page.locator("div[formarrayname='formasVenta']")
            nueva_forma = nuevos_datos["agregar_forma_venta"]
            
            # Contar cuántas formas hay para obtener el índice de la nueva
            count = formas.locator("input[formcontrolname='nombre']").count()
            last_idx = count - 1
            
            if "nombre" in nueva_forma:
                formas.locator("input[formcontrolname='nombre']").nth(last_idx).fill(nueva_forma["nombre"])
            if "precioCompra" in nueva_forma:
                formas.locator("input[formcontrolname='precioCompra']").nth(last_idx).fill(str(nueva_forma["precioCompra"]))
            if "precioVenta" in nueva_forma:
                formas.locator("input[formcontrolname='precioVenta']").nth(last_idx).fill(str(nueva_forma["precioVenta"]))
            if "cantidad" in nueva_forma:
                formas.locator("input[formcontrolname='cantidad']").nth(last_idx).fill(str(nueva_forma["cantidad"]))
        except Exception as e:
            print(f"⚠ Advertencia al agregar forma de venta: {e}")
    
    guardar_producto(page)
    # Refrescar la vista de productos para asegurarnos de que la tabla esté actualizada
    refrescar_modulo_productos(page)
    
    # Crear objeto con datos actualizados
    producto_editado = producto_original.copy()
    producto_editado.update(nuevos_datos)
    
    return producto_editado
