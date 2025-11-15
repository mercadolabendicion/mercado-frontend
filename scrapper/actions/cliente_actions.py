"""
Acciones reutilizables para el módulo de Clientes.
Cada función representa una acción atómica que puede ser utilizada en diferentes flujos.
"""

import random
from typing import TypedDict


class Cliente(TypedDict):
    """Estructura de datos para un cliente."""
    cedula: str
    nombre: str
    direccion: str
    correo: str


# -------------------------------------------------------------------
# Navegación
# -------------------------------------------------------------------
def navegar_a_clientes(page) -> None:
    """Navega al módulo de clientes desde cualquier pantalla."""
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    page.wait_for_selector("app-cliente", timeout=60000)


def refrescar_modulo_clientes(page) -> None:
    """Recarga el módulo Angular para actualizar la tabla."""
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    # Esperar el campo de búsqueda y dar un poco más de tiempo para que la tabla se actualice
    page.wait_for_selector("input#buscar", timeout=60000)
    page.wait_for_timeout(1500)


# -------------------------------------------------------------------
# Generación de datos
# -------------------------------------------------------------------
def generar_datos_cliente() -> Cliente:
    """Genera datos aleatorios para un cliente de prueba."""
    r = random.randint(1000000000, 9999999999)
    return {
        "cedula": str(r),
        "nombre": "Cliente QA AUT",
        "direccion": f"Calle {r}",
        "correo": f"qa{r}@test.com"
    }


# -------------------------------------------------------------------
# Utilidades de escritura
# -------------------------------------------------------------------
def escribir_lento(page, selector: str, texto: str, delay: float = 0.05) -> None:
    """Escribe carácter por carácter en inputs comunes (simula escritura humana)."""
    page.click(selector)
    page.fill(selector, "")
    for c in texto:
        page.keyboard.type(c, delay=delay)
    page.keyboard.press("Tab")


def escribir_en_busqueda(page, texto: str, delay: float = 0.05) -> None:
    """Escribe en el campo de búsqueda de clientes."""
    page.click("input#buscar")
    page.fill("input#buscar", "")
    for c in texto:
        page.keyboard.type(c, delay=delay)
    page.wait_for_timeout(300)


# -------------------------------------------------------------------
# Crear cliente
# -------------------------------------------------------------------
def abrir_formulario_nuevo_cliente(page) -> None:
    """Abre el formulario para crear un nuevo cliente."""
    page.click("button#nuevo")
    page.wait_for_url("**/app/cliente/nuevo", timeout=60000)


def llenar_formulario_cliente(page, cliente: Cliente) -> None:
    """Completa el formulario de cliente con los datos proporcionados."""
    escribir_lento(page, "input[formcontrolname='cedula']", cliente["cedula"])
    escribir_lento(page, "input[formcontrolname='nombre']", cliente["nombre"])
    escribir_lento(page, "input[formcontrolname='direccion']", cliente["direccion"])
    escribir_lento(page, "input[formcontrolname='correo']", cliente["correo"])


def guardar_cliente(page) -> None:
    """Guarda el cliente y confirma el diálogo de éxito."""
    page.click("button#azul")
    # Algunos flujos muestran un SweetAlert2, otros simplemente cierran el modal.
    # Intentamos cerrar el swal si aparece; si no, esperamos que el modal/edición se cierre.
    try:
        page.wait_for_selector(".swal2-confirm", timeout=5000)
        page.click(".swal2-confirm")
        page.wait_for_timeout(800)
    except Exception:
        # Si no hay swal, esperamos que el modal de edición se cierre o que el listado esté disponible
        try:
            page.wait_for_selector("#editarClienteModal", state="hidden", timeout=5000)
        except Exception:
            # Fallback corto
            page.wait_for_timeout(1200)


def crear_cliente(page, cliente: Cliente = None) -> Cliente:
    """
    Flujo completo para crear un cliente.
    Si no se proporciona un cliente, genera uno aleatorio.
    Retorna los datos del cliente creado.
    """
    if cliente is None:
        cliente = generar_datos_cliente()
    
    navegar_a_clientes(page)
    abrir_formulario_nuevo_cliente(page)
    llenar_formulario_cliente(page, cliente)
    guardar_cliente(page)
    refrescar_modulo_clientes(page)
    
    return cliente


# -------------------------------------------------------------------
# Buscar cliente
# -------------------------------------------------------------------
def buscar_cliente(page, cedula: str) -> None:
    """Busca un cliente por su cédula utilizando el filtro."""
    escribir_en_busqueda(page, cedula, delay=0.06)
    page.wait_for_timeout(1500)


def validar_cliente_existe(page, cliente: Cliente) -> bool:
    """
    Valida que el cliente existe en la tabla.
    Retorna True si el cliente está visible, False en caso contrario.
    """
    buscar_cliente(page, cliente["cedula"])
    # Esperar explícitamente a que el nombre aparezca en la tabla (evita falsos negativos por asincronía)
    locator = page.locator(f"text={cliente['nombre']}").first
    try:
        locator.wait_for(state="visible", timeout=3000)
        return True
    except:
        return False


# -------------------------------------------------------------------
# Eliminar cliente
# -------------------------------------------------------------------
def seleccionar_cliente_en_tabla(page, nombre: str) -> None:
    """Selecciona un cliente en la tabla haciendo clic en su fila."""
    # Buscar la fila que contiene el nombre del cliente y hacer clic en el botón de eliminar
    row = page.locator(f"tr:has-text('{nombre}')").first
    # En la UI actual el botón de eliminar es un botón con emoji (❌) dentro de la celda con clase "eliminar".
    # Seleccionamos el primer botón dentro de esa celda para hacer la eliminación.
    try:
        row.locator("td.eliminar button").first.click()
    except:
        # Fallback a buscar por texto/emoji
        row.locator("button:has-text('❌'), button:has-text('Eliminar')").first.click()


def confirmar_eliminacion(page) -> None:
    """Confirma el diálogo de eliminación."""
    # Intentar confirmar el diálogo de eliminación (swal2). Si no aparece, proceder y esperar que la fila desaparezca.
    try:
        page.wait_for_selector(".swal2-confirm", timeout=5000)
        # Pequeño delay antes de aceptar para evitar condiciones de carrera en la UI
        page.wait_for_timeout(500)
        page.click(".swal2-confirm")
        page.wait_for_timeout(800)
    except Exception:
        # No hubo un diálogo; esperar un corto tiempo por la eliminación en la tabla
        page.wait_for_timeout(800)


def eliminar_cliente(page, cliente: Cliente) -> None:
    """
    Flujo completo para eliminar un cliente.
    Requiere que el cliente ya exista en el sistema.
    """
    navegar_a_clientes(page)
    buscar_cliente(page, cliente["cedula"])
    seleccionar_cliente_en_tabla(page, cliente["nombre"])
    confirmar_eliminacion(page)
    # Esperar que la fila sea removida del DOM (buscar por cédula, más estable)
    try:
        row = page.locator(f"tr:has-text('{cliente['cedula']}')").first
        row.wait_for(state="hidden", timeout=5000)
    except Exception:
        # Si no se oculta en el tiempo, continuar y refrescar el módulo
        pass
    refrescar_modulo_clientes(page)


def validar_cliente_no_existe(page, cliente: Cliente) -> bool:
    """
    Valida que el cliente NO existe en la tabla.
    Retorna True si el cliente no está visible, False si aún existe.
    """
    buscar_cliente(page, cliente["cedula"])
    # Buscar la fila por cédula (es más estable) y esperar que desaparezca
    row = page.locator(f"tr:has-text('{cliente['cedula']}')").first
    try:
        row.wait_for(state="hidden", timeout=3000)
        return True
    except Exception:
        # Si no se oculta en el tiempo, comprobar visibilidad final
        try:
            return not row.is_visible()
        except Exception:
            return True


# -------------------------------------------------------------------
# Editar cliente
# -------------------------------------------------------------------
def abrir_edicion_cliente(page, nombre: str) -> None:
    """Abre el formulario de edición de un cliente desde la tabla."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    # En la UI actual el botón de editar es un botón con clase "editar" y un emoji (✏️).
    # Hacemos click y esperamos al componente/modal de edición en lugar de esperar una navegación.
    try:
        row.locator("button.editar, button:has-text('✏️'), button:has-text('Editar')").first.click()
    except:
        row.locator("button:has-text('✏️'), button:has-text('Editar')").first.click()

    # Esperar por el modal/componente de edición o por el input del formulario para continuar
    page.wait_for_selector("app-editar-cliente, #editarClienteModal, input[formcontrolname='nombre']", timeout=60000)


def editar_cliente(page, cliente_original: Cliente, nuevos_datos: dict = None) -> Cliente:
    """
    Flujo completo para editar un cliente existente.
    Si nuevos_datos no se proporciona, actualiza solo algunos campos.
    Retorna el cliente con los datos actualizados.
    """
    if nuevos_datos is None:
        # Actualizar solo algunos campos por defecto
        r = random.randint(1000000000, 9999999999)
        nuevos_datos = {
            "nombre": f"Cliente QA EDITADO {r}",
            "direccion": f"Avenida {r}",
        }
    
    navegar_a_clientes(page)
    buscar_cliente(page, cliente_original["cedula"])
    abrir_edicion_cliente(page, cliente_original["nombre"])
    
    # Actualizar campos modificados
    if "nombre" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='nombre']", nuevos_datos["nombre"])
    if "direccion" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='direccion']", nuevos_datos["direccion"])
    if "correo" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='correo']", nuevos_datos["correo"])
    
    guardar_cliente(page)
    refrescar_modulo_clientes(page)
    
    # Crear objeto con datos actualizados
    cliente_editado = cliente_original.copy()
    cliente_editado.update(nuevos_datos)
    
    return cliente_editado
