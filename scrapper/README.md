# Automatización de Flujos de Negocio con Playwright

Este directorio contiene la automatización E2E de los flujos de negocio de la aplicación Mercado La Bendición utilizando Playwright y Python.

## 📁 Estructura del Proyecto

```
scrapper/
├── core/                          # Funciones core reutilizables
│   ├── __init__.py
│   ├── browser.py                # Gestión del navegador Playwright
│   └── login.py                  # Autenticación en la aplicación
│
├── actions/                       # Acciones modulares por entidad de negocio
│   ├── __init__.py
│   ├── cliente_actions.py        # Acciones CRUD para clientes
│   └── producto_actions.py       # Acciones CRUD para productos
│
├── test/                          # Tests E2E independientes
│   ├── __init__.py
│   ├── test_login.py             # Test de autenticación
│   ├── cliente/
│   │   ├── test_crear_cliente.py
│   │   └── test_eliminar_cliente.py
│   └── producto/
│       ├── test_crear_producto.py
│       └── test_eliminar_producto.py
│
├── requirements.txt               # Dependencias Python
└── README.md                     # Esta documentación
```

## 🎯 Principios de Diseño

### 1. **Modularidad**
Cada funcionalidad está organizada en módulos reutilizables:
- **core/**: Funciones transversales (navegador, login)
- **actions/**: Acciones específicas por entidad de negocio
- **test/**: Tests E2E que componen las acciones

### 2. **Independencia de Tests**
Cada test puede ejecutarse de forma independiente sin depender de otros:
- Los tests de eliminación primero **crean** el registro que van a eliminar
- Los tests de edición primero **crean** el registro que van a editar
- Cada test maneja su propio ciclo de vida completo

### 3. **Reutilización**
Las funciones en `actions/` son atómicas y reutilizables:
```python
# Ejemplo: crear y eliminar un cliente en un mismo flujo
from actions.cliente_actions import crear_cliente, eliminar_cliente

cliente = crear_cliente(page)
eliminar_cliente(page, cliente)
```

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
# Navegar al directorio scrapper
cd scrapper

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Instalar navegadores de Playwright
playwright install
```

### 2. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
BASE_URL=http://localhost:4200
USERNAME=tu_usuario
PASSWORD=tu_contraseña
```

## 📝 Ejecutar Tests

### Ejecutar un test individual

```bash
# Desde el directorio scrapper
python test/cliente/test_crear_cliente.py
python test/cliente/test_eliminar_cliente.py
python test/producto/test_crear_producto.py
python test/producto/test_eliminar_producto.py
```

### Ejecutar con modo headless

Modificar la llamada en el test:
```python
playwright, browser, context, page = get_page(headless=True)
```

## 🏗️ Crear Nuevos Tests

### 1. Crear Acciones Reutilizables

Primero, crear o extender el módulo de acciones en `actions/`:

```python
# actions/nueva_entidad_actions.py
def crear_nueva_entidad(page, datos=None):
    """Flujo completo para crear una nueva entidad."""
    if datos is None:
        datos = generar_datos_entidad()
    
    navegar_a_entidad(page)
    abrir_formulario_nuevo(page)
    llenar_formulario(page, datos)
    guardar(page)
    
    return datos
```

### 2. Crear el Test

Luego, crear el test que utiliza las acciones:

```python
# test/nueva_entidad/test_crear_entidad.py
from core.browser import get_page
from core.login import login
from actions.nueva_entidad_actions import crear_nueva_entidad, validar_existe

def main():
    playwright, browser, context, page = get_page(headless=False)
    
    try:
        login(page)
        entidad = crear_nueva_entidad(page)
        
        if validar_existe(page, entidad):
            print("✓ Test exitoso")
        else:
            print("✗ Test fallido")
    finally:
        browser.close()
        playwright.stop()

if __name__ == "__main__":
    main()
```

## 📋 Ejemplos de Flujos Complejos

### Test de Edición (independiente)

```python
def main():
    playwright, browser, context, page = get_page(headless=False)
    
    try:
        login(page)
        
        # 1. Crear el cliente a editar
        cliente = crear_cliente(page)
        
        # 2. Editar el cliente
        cliente_editado = editar_cliente(page, cliente, nuevos_datos)
        
        # 3. Validar cambios
        if validar_cliente_existe(page, cliente_editado):
            print("✓ Edición exitosa")
    finally:
        browser.close()
        playwright.stop()
```

### Test de Flujo Completo (CRUD)

```python
def main():
    playwright, browser, context, page = get_page(headless=False)
    
    try:
        login(page)
        
        # Crear
        cliente = crear_cliente(page)
        assert validar_cliente_existe(page, cliente)
        
        # Leer/Buscar
        resultado = buscar_cliente(page, cliente["cedula"])
        assert resultado is not None
        
        # Actualizar
        cliente_editado = editar_cliente(page, cliente)
        assert validar_cliente_existe(page, cliente_editado)
        
        # Eliminar
        eliminar_cliente(page, cliente_editado)
        assert validar_cliente_no_existe(page, cliente_editado)
        
        print("✓ Flujo CRUD completo exitoso")
    finally:
        browser.close()
        playwright.stop()
```

## 🎨 Mejores Prácticas

1. **Nombres descriptivos**: Usar nombres que describan claramente la acción
   - ✅ `crear_cliente()`, `eliminar_producto()`
   - ❌ `test1()`, `func()`

2. **Funciones atómicas**: Cada función debe hacer una sola cosa
   - ✅ `navegar_a_clientes()`, `llenar_formulario()`, `guardar()`
   - ❌ `crear_y_validar_y_eliminar_cliente()`

3. **Datos generados**: Usar datos aleatorios para evitar conflictos
   ```python
   r = random.randint(1000000000, 9999999999)
   cedula = str(r)
   ```

4. **Esperas explícitas**: Usar wait_for_selector en lugar de sleep
   ```python
   page.wait_for_selector(".swal2-confirm", timeout=60000)
   ```

5. **Try-finally**: Siempre cerrar el navegador
   ```python
   try:
       # test code
   finally:
       browser.close()
       playwright.stop()
   ```

6. **Documentación**: Documentar el propósito de cada test
   ```python
   """
   E2E Test: Eliminar Cliente
   Este test puede ejecutarse de forma independiente.
   Primero crea un cliente y luego lo elimina.
   """
   ```

## 🔧 Troubleshooting

### El test falla al buscar un elemento
- Verificar los selectores CSS en el HTML de la aplicación
- Aumentar los timeouts si la aplicación es lenta
- Usar `page.screenshot("debug.png")` para capturar el estado

### Los datos no se guardan
- Verificar que Angular detecte los cambios (usar `dispatch_event`)
- Esperar a que se carguen los componentes antes de interactuar

### El login falla
- Verificar las credenciales en el archivo `.env`
- Verificar que la URL base sea correcta
- Revisar los selectores de los campos de login

## 📚 Recursos Adicionales

- [Documentación de Playwright](https://playwright.dev/python/)
- [Selectores CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_Selectors)
- [Convenciones de Python (PEP 8)](https://pep8.org/)

## 🤝 Contribuir

Al agregar nuevos tests:
1. Seguir la estructura de directorios existente
2. Crear acciones reutilizables en `actions/`
3. Documentar el propósito del test
4. Asegurar que el test sea independiente
5. Validar que el test pase antes de hacer commit
