# ============================================================
# ACCIONES – CLIENTE (CON CIERRE DE MODAL AL EDITAR)
# ============================================================

import random
from typing import TypedDict


class Cliente(TypedDict):
    cedula: str
    nombre: str
    direccion: str
    correo: str


# ------------------------------------------------------------
# Navegación
# ------------------------------------------------------------
def navegar_a_clientes(page):
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    page.wait_for_selector("app-cliente", timeout=60000)


def refrescar_modulo_clientes(page):
    page.click("a.sidebar-link[routerlink='/app/cliente']")
    page.wait_for_url("**/app/cliente", timeout=60000)
    page.wait_for_selector("input#buscar", timeout=60000)
    page.wait_for_timeout(500)


# ------------------------------------------------------------
# Generar datos
# ------------------------------------------------------------
def generar_datos_cliente() -> Cliente:
    r = random.randint(1000000000, 9999999999)
    return {
        "cedula": str(r),
        "nombre": "Cliente QA AUT",
        "direccion": f"Calle {r}",
        "correo": f"qa{r}@test.com"
    }


# ------------------------------------------------------------
# Escritura
# ------------------------------------------------------------
def escribir_lento(page, selector: str, texto: str, delay: float = 0.05):
    loc = page.locator(selector).first
    loc.wait_for(state="visible", timeout=5000)

    loc.click()
    loc.press("Control+A")
    loc.press("Backspace")

    loc.type(texto, delay=delay)

    loc.evaluate("el => el.dispatchEvent(new Event('input', { bubbles: true }))")
    loc.evaluate("el => el.dispatchEvent(new Event('change', { bubbles: true }))")
    loc.evaluate("el => el.dispatchEvent(new Event('blur', { bubbles: true }))")

    page.wait_for_timeout(150)


def escribir_en_busqueda(page, texto: str, delay: float = 0.05):
    page.click("input#buscar")
    page.fill("input#buscar", "")
    page.type("input#buscar", texto, delay=delay)
    page.wait_for_timeout(300)


# ------------------------------------------------------------
# Crear cliente
# ------------------------------------------------------------
def abrir_formulario_nuevo_cliente(page):
    page.click("button#nuevo")
    page.wait_for_url("**/app/cliente/nuevo", timeout=60000)


def llenar_formulario_cliente(page, cliente: Cliente):
    escribir_lento(page, "input[formcontrolname='cedula']", cliente["cedula"])
    escribir_lento(page, "input[formcontrolname='nombre']", cliente["nombre"])
    escribir_lento(page, "input[formcontrolname='direccion']", cliente["direccion"])
    escribir_lento(page, "input[formcontrolname='correo']", cliente["correo"])


def guardar_cliente(page, es_edicion=False):
    page.click("button#azul")

    # SWEET ALERT
    try:
        page.wait_for_selector(".swal2-confirm", timeout=5000)
        page.click(".swal2-confirm")
        page.wait_for_timeout(400)
    except Exception:
        pass

    # 👉 SI ES EDICIÓN: CERRAR MODAL MANUALMENTE
    if es_edicion:
        try:
            close_btn = page.locator("button.btn-close").first
            close_btn.wait_for(state="visible", timeout=3000)
            close_btn.click()
            page.wait_for_timeout(600)
        except Exception:
            print("⚠ No se encontró botón cerrar del modal, continuando.")


def crear_cliente(page, cliente=None):
    if cliente is None:
        cliente = generar_datos_cliente()

    navegar_a_clientes(page)
    abrir_formulario_nuevo_cliente(page)
    llenar_formulario_cliente(page, cliente)
    guardar_cliente(page, es_edicion=False)
    refrescar_modulo_clientes(page)

    return cliente


# ------------------------------------------------------------
# Buscar cliente
# ------------------------------------------------------------
def buscar_cliente(page, cedula: str):
    escribir_en_busqueda(page, cedula, delay=0.06)
    page.wait_for_timeout(800)


def validar_cliente_existe(page, cliente: Cliente) -> bool:
    buscar_cliente(page, cliente["cedula"])
    loc = page.locator(f"text={cliente['nombre']}").first
    try:
        loc.wait_for(state="visible", timeout=3000)
        return True
    except:
        return False

# ------------------------------------------------------------
# Validar que el cliente NO existe (para pruebas de eliminación)
# ------------------------------------------------------------
def validar_cliente_no_existe(page, cliente: Cliente) -> bool:
    buscar_cliente(page, cliente["cedula"])
    page.wait_for_timeout(800)

    # Buscar cualquier fila con la cédula del cliente
    fila = page.locator(f"tr:has-text('{cliente['cedula']}')").first

    try:
        fila.wait_for(state="visible", timeout=2000)
        # Si se ve → todavía existe → error
        return False
    except:
        # Si NO aparece → fue eliminado
        return True

# ------------------------------------------------------------
# Eliminar cliente
# ------------------------------------------------------------
def confirmar_eliminacion(page):
    try:
        # Espera a que aparezca el SweetAlert
        page.wait_for_selector(".swal2-popup", timeout=5000)

        # Click en confirmar
        page.click(".swal2-confirm")

        # ⚠ SweetAlert desaparece RAPIDÍSIMO. Mejor usar try-catch suave.
        try:
            page.wait_for_selector(".swal2-popup", state="hidden", timeout=2000)
        except:
            pass  # Si no lo detecta ocultándose, no importa, continúa.

        page.wait_for_timeout(300)
    except Exception as e:
        print(f"⚠ Error confirmando eliminación: {e}")

def forzar_cierre_de_modales(page):
    try:
        # Cerrar cualquier modal visible con las clases de bootstrap
        page.evaluate("""
            () => {
                document.querySelectorAll('.modal.show').forEach(m => {
                    m.classList.remove('show');
                    m.setAttribute('aria-hidden', 'true');
                    m.style.display = 'none';
                });

                // Eliminar backdrop de bootstrap
                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            }
        """)
        page.wait_for_timeout(400)
    except Exception as e:
        print(f"⚠ No se pudieron cerrar modales: {e}")


def eliminar_cliente(page, cliente: Cliente):
    navegar_a_clientes(page)

    # 🔥 CERRAR CUALQUIER MODAL ABIERTO QUE SE HAYA QUEDADO COLGADO
    forzar_cierre_de_modales(page)

    buscar_cliente(page, cliente["cedula"])
    page.wait_for_timeout(600)

    try:
        btn = page.locator("td.eliminar button:has-text('❌')").first
        btn.wait_for(state="visible", timeout=5000)
        btn.evaluate("b => b.click()")
    except Exception as e:
        print(f"⚠ Error al hacer click en eliminar: {e}")

    confirmar_eliminacion(page)

    #NUEVAMENTE, por si SweetAlert dejó algo
    forzar_cierre_de_modales(page)

    refrescar_modulo_clientes(page)



# ------------------------------------------------------------
# EDITAR CLIENTE
# ------------------------------------------------------------
def abrir_edicion_cliente(page, nombre: str):
    row = page.locator(f"tr:has-text('{nombre}')").first

    try:
        row.locator("button.editar, button:has-text('✏️'), button:has-text('Editar')").first.click()
    except:
        row.locator("button:has-text('✏️'), button:has-text('Editar')").first.click()

    page.wait_for_selector("input[formcontrolname='nombre']", timeout=60000)
    page.wait_for_timeout(500)


def esperar_patch_value(page, cliente):
    page.wait_for_function(
        """
        (cedula) => {
            const el = document.querySelector("input[formcontrolname='cedula']");
            return el && el.value === cedula;
        }
        """,
        arg=cliente["cedula"],
        timeout=5000
    )


def editar_cliente(page, cliente_original: Cliente, nuevos_datos=None) -> Cliente:
    if nuevos_datos is None:
        r = random.randint(100000, 999999)
        nuevos_datos = {
            "nombre": f"Cliente EDIT {r}",
            "direccion": f"Avenida {r}",
        }

    # SOLO TEXTO EN NOMBRE
    if "nombre" in nuevos_datos:
        nuevos_datos["nombre"] = "".join(c for c in nuevos_datos["nombre"] if c.isalpha() or c == " ")

    navegar_a_clientes(page)
    buscar_cliente(page, cliente_original["cedula"])
    abrir_edicion_cliente(page, cliente_original["nombre"])

    esperar_patch_value(page, cliente_original)

    if "nombre" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='nombre']", nuevos_datos["nombre"])

    if "direccion" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='direccion']", nuevos_datos["direccion"])

    if "correo" in nuevos_datos:
        escribir_lento(page, "input[formcontrolname='correo']", nuevos_datos["correo"])

    guardar_cliente(page, es_edicion=True)  # 👈 AQUÍ SE CIERRA EL MODAL
    refrescar_modulo_clientes(page)

    cliente_editado = cliente_original.copy()
    cliente_editado.update(nuevos_datos)

    return cliente_editado
