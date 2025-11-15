# Guía de Arquitectura de Automatización

## 📐 Arquitectura del Proyecto

### Principios de Diseño

El proyecto sigue una arquitectura de **3 capas** inspirada en el patrón Page Object Model, pero adaptada para acciones de negocio:

```
┌─────────────────────────────────────────┐
│         CAPA DE TESTS (E2E)            │
│  Tests independientes que validan      │
│  flujos de negocio completos           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      CAPA DE ACCIONES (Actions)        │
│  Funciones reutilizables que           │
│  representan acciones de negocio        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        CAPA CORE (Utilidades)          │
│  Funciones base: navegador, login       │
└─────────────────────────────────────────┘
```

### 1. Capa Core (Utilidades Base)

**Responsabilidad:** Proveer funcionalidades transversales que todos los tests necesitan.

**Archivos:**
- `core/browser.py` - Gestión del navegador Playwright
- `core/login.py` - Autenticación en la aplicación

**Ejemplo:**
```python
from core.browser import get_page
from core.login import login

playwright, browser, context, page = get_page(headless=False)
login(page)
```

### 2. Capa de Acciones (Business Actions)

**Responsabilidad:** Proveer acciones atómicas y reutilizables para cada entidad de negocio.

**Archivos:**
- `actions/cliente_actions.py` - CRUD de clientes
- `actions/producto_actions.py` - CRUD de productos
- `actions/venta_actions.py` - Operaciones de ventas

**Características:**
- ✅ Funciones atómicas (una sola responsabilidad)
- ✅ Reutilizables en múltiples tests
- ✅ Independientes entre sí
- ✅ Bien documentadas

**Ejemplo:**
```python
from actions.cliente_actions import crear_cliente, eliminar_cliente

# Crear un cliente
cliente = crear_cliente(page)

# Eliminar el cliente
eliminar_cliente(page, cliente)
```

### 3. Capa de Tests (End-to-End)

**Responsabilidad:** Validar flujos de negocio completos usando las acciones.

**Organización:**
```
test/
├── cliente/        # Tests de clientes
├── producto/       # Tests de productos
└── venta/          # Tests de ventas
```

**Tipos de tests:**

1. **Tests Unitarios de CRUD**
   - Un test por operación
   - Ejemplo: `test_crear_cliente.py`

2. **Tests CRUD Completos**
   - Validan ciclo de vida completo
   - Ejemplo: `test_crud_completo_cliente.py`

3. **Tests de Flujos de Negocio**
   - Integran múltiples entidades
   - Ejemplo: `test_crear_venta.py` (cliente + producto + venta)

## 🔄 Flujo de Ejecución de un Test

```
1. Iniciar Navegador
   └─> get_page(headless=False)

2. Autenticar Usuario
   └─> login(page)

3. Ejecutar Acciones de Negocio
   └─> crear_cliente(page)
   └─> editar_cliente(page, cliente)
   └─> eliminar_cliente(page, cliente)

4. Validar Resultados
   └─> validar_cliente_existe(page, cliente)
   └─> validar_cliente_no_existe(page, cliente)

5. Cerrar Navegador
   └─> browser.close()
   └─> playwright.stop()
```

## 🧩 Anatomía de una Acción

Cada acción en el módulo `actions/` sigue esta estructura:

```python
def accion_de_negocio(page, parametros: TipoEspecifico) -> TipoRetorno:
    """
    Documentación clara de lo que hace la acción.
    
    Args:
        page: Objeto page de Playwright
        parametros: Descripción de parámetros
    
    Returns:
        Descripción del valor de retorno
    """
    # 1. Navegación (si es necesaria)
    navegar_a_modulo(page)
    
    # 2. Interacción con la UI
    page.fill("selector", valor)
    page.click("button")
    
    # 3. Esperas explícitas
    page.wait_for_selector(".elemento")
    
    # 4. Retornar resultado
    return resultado
```

## 📦 Composición de Acciones

Las acciones se componen entre sí para crear flujos más complejos:

```python
# Acción compuesta de alto nivel
def crear_cliente(page, cliente=None) -> Cliente:
    if cliente is None:
        cliente = generar_datos_cliente()  # ← acción atómica
    
    navegar_a_clientes(page)               # ← acción atómica
    abrir_formulario_nuevo_cliente(page)   # ← acción atómica
    llenar_formulario_cliente(page, cliente) # ← acción atómica
    guardar_cliente(page)                  # ← acción atómica
    refrescar_modulo_clientes(page)        # ← acción atómica
    
    return cliente
```

## 🎯 Independencia de Tests

Cada test debe ser **completamente independiente**:

### ✅ Correcto
```python
def main():
    login(page)
    
    # Test crea sus propios datos
    cliente = crear_cliente(page)
    eliminar_cliente(page, cliente)
```

### ❌ Incorrecto
```python
def main():
    login(page)
    
    # Test depende de datos existentes
    cliente = buscar_cliente(page, "12345678")  # ¡Puede no existir!
    eliminar_cliente(page, cliente)
```

## 🔍 Selectores CSS

Los selectores deben ser:
1. **Específicos** - Apuntar exactamente al elemento
2. **Estables** - No cambiar con frecuencia
3. **Legibles** - Fáciles de entender

**Prioridad de selectores:**
1. IDs únicos: `#id-elemento`
2. Atributos de formulario: `[formcontrolname='nombre']`
3. Clases específicas: `.clase-especifica`
4. Texto visible: `:has-text('Texto')`

## 🕐 Estrategias de Espera

### Esperas Explícitas (Preferidas)
```python
# Esperar a que aparezca un elemento
page.wait_for_selector(".swal2-confirm", timeout=60000)

# Esperar a una URL
page.wait_for_url("**/app/cliente", timeout=60000)
```

### Esperas Temporales (Solo cuando sea necesario)
```python
# Dar tiempo a que Angular actualice
page.wait_for_timeout(1500)
```

## 🧪 Datos de Prueba

### Generación Aleatoria
```python
import random

def generar_datos_cliente() -> Cliente:
    r = random.randint(1000000000, 9999999999)
    return {
        "cedula": str(r),
        "nombre": "Cliente QA AUT",
        "direccion": f"Calle {r}",
        "correo": f"qa{r}@test.com"
    }
```

**Ventajas:**
- ✅ No hay conflictos entre tests
- ✅ Tests se pueden ejecutar en paralelo
- ✅ No dependen de datos específicos

## 📊 Estructura de Datos

Uso de `TypedDict` para datos tipados:

```python
from typing import TypedDict

class Cliente(TypedDict):
    """Estructura de datos para un cliente."""
    cedula: str
    nombre: str
    direccion: str
    correo: str
```

**Ventajas:**
- ✅ Autocompletado en IDE
- ✅ Validación de tipos
- ✅ Documentación clara

## 🚦 Manejo de Errores

```python
def validar_cliente_no_existe(page, cliente: Cliente) -> bool:
    buscar_cliente(page, cliente["cedula"])
    try:
        visible = page.locator(f"text={cliente['nombre']}").first.is_visible(timeout=2000)
        return not visible
    except:
        return True  # Si hay timeout, el elemento no existe
```

## 📝 Convenciones de Nombres

### Funciones
- `crear_*` - Crea una entidad completa
- `abrir_*` - Abre un formulario o diálogo
- `llenar_*` - Completa un formulario
- `guardar_*` - Guarda cambios
- `validar_*` - Valida una condición
- `navegar_*` - Navega a una pantalla
- `generar_*` - Genera datos aleatorios

### Tests
- `test_crear_*.py` - Test de creación
- `test_editar_*.py` - Test de edición
- `test_eliminar_*.py` - Test de eliminación
- `test_crud_completo_*.py` - Test CRUD completo

## 🔄 Ciclo de Vida de un Test CRUD

```python
def main():
    playwright, browser, context, page = get_page(headless=False)
    
    try:
        # 1. Setup
        login(page)
        
        # 2. CREATE
        entidad = crear_entidad(page)
        assert validar_existe(page, entidad)
        
        # 3. READ (implícito en validación)
        
        # 4. UPDATE
        entidad_editada = editar_entidad(page, entidad)
        assert validar_existe(page, entidad_editada)
        
        # 5. DELETE
        eliminar_entidad(page, entidad_editada)
        assert validar_no_existe(page, entidad_editada)
        
    finally:
        # 6. Teardown
        browser.close()
        playwright.stop()
```

## 🔧 Debugging

### Modo No-Headless
```python
playwright, browser, context, page = get_page(headless=False)
```

### Screenshots
```python
page.screenshot("debug.png")
```

### Pausar Ejecución
```python
page.wait_for_timeout(10000)  # Pausa 10 segundos para inspeccionar
```

### Ver Console Logs
```python
page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
```

## 🎓 Mejores Prácticas

1. **DRY (Don't Repeat Yourself)**
   - Extraer código repetido a funciones
   - Reutilizar acciones existentes

2. **KISS (Keep It Simple, Stupid)**
   - Funciones pequeñas y enfocadas
   - Una responsabilidad por función

3. **Documentación**
   - Docstrings en todas las funciones
   - Comentarios para lógica compleja

4. **Nombres Descriptivos**
   - Variables y funciones con nombres claros
   - Evitar abreviaturas oscuras

5. **Manejo de Errores**
   - Try-except solo donde sea necesario
   - Finally para cleanup (cerrar navegador)

6. **Tests Independientes**
   - Cada test crea sus propios datos
   - No depender de orden de ejecución

7. **Esperas Inteligentes**
   - Usar wait_for_selector
   - Evitar sleep/timeout fijos cuando sea posible

8. **Validaciones Claras**
   - Mensajes descriptivos en prints
   - Retornar booleanos en validaciones
