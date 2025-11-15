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
    page.wait_for_selector("input[placeholder*='Escanear']", timeout=60000)
    page.wait_for_timeout(800)


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
    page.wait_for_selector(".swal2-confirm", timeout=60000)
    page.click(".swal2-confirm")
    page.wait_for_timeout(2000)


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
    page.wait_for_timeout(2000)


def validar_producto_existe(page, producto: Producto) -> bool:
    """
    Valida que el producto existe en la tabla.
    Retorna True si el producto está visible, False en caso contrario.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    return page.locator(f"text={producto['nombre']}").first.is_visible()


# -------------------------------------------------------------------
# Eliminar producto
# -------------------------------------------------------------------
def seleccionar_producto_en_tabla(page, nombre: str) -> None:
    """Selecciona un producto en la tabla haciendo clic en su botón de eliminar."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    row.locator("button[title='Eliminar']").click()


def confirmar_eliminacion(page) -> None:
    """Confirma el diálogo de eliminación."""
    page.wait_for_selector(".swal2-confirm", timeout=60000)
    page.click(".swal2-confirm")
    page.wait_for_timeout(1200)


def eliminar_producto(page, producto: Producto) -> None:
    """
    Flujo completo para eliminar un producto.
    Requiere que el producto ya exista en el sistema.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    seleccionar_producto_en_tabla(page, producto["nombre"])
    confirmar_eliminacion(page)
    refrescar_modulo_productos(page)


def validar_producto_no_existe(page, producto: Producto) -> bool:
    """
    Valida que el producto NO existe en la tabla.
    Retorna True si el producto no está visible, False si aún existe.
    """
    navegar_a_productos(page)
    buscar_producto(page, producto["codigo"])
    try:
        return not page.locator(f"text={producto['nombre']}").first.is_visible(timeout=2000)
    except:
        return True  # Si hay timeout, el elemento no existe


# -------------------------------------------------------------------
# Editar producto
# -------------------------------------------------------------------
def abrir_edicion_producto(page, nombre: str) -> None:
    """Abre el formulario de edición de un producto desde la tabla."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    row.locator("button[title='Editar'], button:has-text('Editar')").click()
    page.wait_for_url("**/app/producto/**", timeout=60000)
    page.wait_for_selector("h1.nota:has-text('Registro de productos')")


def editar_producto(page, producto_original: Producto, nuevos_datos: dict = None) -> Producto:
    """
    Flujo completo para editar un producto existente.
    Si nuevos_datos no se proporciona, actualiza solo algunos campos.
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
    
    # Actualizar campos modificados
    if "nombre" in nuevos_datos:
        page.fill("input[formcontrolname='nombre']", nuevos_datos["nombre"])
    if "lote" in nuevos_datos:
        page.fill("input[formcontrolname='lote']", nuevos_datos["lote"])
    if "fecha_vencimiento" in nuevos_datos:
        page.fill("input[formcontrolname='fecha_vencimiento']", nuevos_datos["fecha_vencimiento"])
    
    guardar_producto(page)
    
    # Crear objeto con datos actualizados
    producto_editado = producto_original.copy()
    producto_editado.update(nuevos_datos)
    
    return producto_editado
