# Fix: Scrapper Delete Flow for Products and Clients

## Problem Statement
The delete flow in the scrapper for products and clients was not working correctly. The tests were failing to:
1. Click the correct delete button in the UI
2. Properly handle the SweetAlert2 confirmation dialog
3. Verify that items were actually deleted

## Root Cause Analysis

### Issue 1: Incorrect Button Selectors
**Product Delete Button:**
- The HTML template has 3 buttons in the actions column: View (👁️), Delete (❌), Edit (✏️)
- The original selector `td.acciones button` would click the FIRST button (View), not the Delete button
- This caused the delete flow to fail because it was opening the view modal instead of triggering deletion

**Client Delete Button:**
- The HTML template has 2 buttons: Delete (❌) and Edit (✏️)
- The original selector `td.eliminar button` could potentially click the wrong button
- Needed more specific targeting to ensure the delete button is clicked

### Issue 2: Inadequate SweetAlert2 Dialog Handling
- The application uses SweetAlert2 (NOT native browser alerts) for confirmation dialogs
- Original implementation only waited for `.swal2-confirm` button without ensuring the popup was fully loaded
- No verification that the dialog actually appeared or disappeared after confirmation
- Short timeouts could cause race conditions

## Solution

### Changes to `producto_actions.py`

#### 1. Fixed `seleccionar_producto_en_tabla` function (lines 140-146)
```python
def seleccionar_producto_en_tabla(page, nombre: str) -> None:
    """Selecciona un producto en la tabla haciendo clic en su botón de eliminar."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    # El botón de eliminar es el que tiene el emoji ❌ y la clase "red-x"
    # En la UI actual hay tres botones: Ver (👁️), Eliminar (❌), Editar (✏️)
    # Necesitamos hacer clic específicamente en el botón con ❌
    row.locator("button:has-text('❌')").first.click()
```

**Key Changes:**
- Removed generic fallback selector that could click wrong button
- Now specifically targets `button:has-text('❌')`
- Added clear documentation about button layout

#### 2. Improved `confirmar_eliminacion` function (lines 149-168)
```python
def confirmar_eliminacion(page) -> None:
    """Confirma el diálogo de eliminación de SweetAlert2."""
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
```

**Key Changes:**
- Added explicit wait for `.swal2-popup` to ensure dialog is rendered
- Added state verification (visible/hidden) for better reliability
- Increased timeout from 5s to 10s for popup appearance
- Added wait for dialog to disappear after confirmation
- Improved error handling with descriptive warnings
- Better timing to avoid race conditions

### Changes to `cliente_actions.py`

#### 1. Fixed `seleccionar_cliente_en_tabla` function (lines 152-159)
```python
def seleccionar_cliente_en_tabla(page, nombre: str) -> None:
    """Selecciona un cliente en la tabla haciendo clic en su botón de eliminar."""
    row = page.locator(f"tr:has-text('{nombre}')").first
    # El botón de eliminar es el que tiene el emoji ❌ dentro de la celda con clase "eliminar"
    # Hay dos botones en las acciones: Eliminar (❌) y Editar (✏️)
    # Necesitamos hacer clic específicamente en el botón con ❌
    row.locator("td.eliminar button:has-text('❌')").first.click()
```

**Key Changes:**
- More precise selector: `td.eliminar button:has-text('❌')`
- Removed fallback that could cause issues
- Added clear documentation about button layout

#### 2. Improved `confirmar_eliminacion` function (lines 162-181)
Same improvements as in producto_actions.py for consistency.

## Testing

The following test files exercise the fixed functionality:

1. **Product Delete Test:** `test/producto/test_eliminar_producto.py`
   - Creates a product
   - Validates it exists
   - Deletes the product
   - Validates it no longer exists

2. **Client Delete Test:** `test/cliente/test_eliminar_cliente.py`
   - Creates a client
   - Validates it exists
   - Deletes the client
   - Validates it no longer exists

### Running the Tests

```bash
# From the scrapper directory

# Test product deletion
python test/producto/test_eliminar_producto.py

# Test client deletion
python test/cliente/test_eliminar_cliente.py

# Or use the test runner
python run_tests.py eliminar
```

## Technical Details

### SweetAlert2 Structure
The application uses SweetAlert2 for confirmation dialogs with the following structure:
```html
<div class="swal2-popup">
  <!-- Dialog content -->
  <button class="swal2-confirm">Sí, eliminar</button>
  <button class="swal2-cancel">No, cancelar</button>
</div>
```

### HTML Button Structure

**Products (home-producto.component.html):**
```html
<td class="acciones">
  <button class="editar" (click)="abrirModal(producto.codigo)"> 👁️ </button>
  <button class="editar red-x mx-2" (click)="eliminarProductoCodigo(producto.codigo)"> ❌ </button>
  <button class="editar" (click)="abrirModalEditar(producto.codigo)"> ✏️ </button>
</td>
```

**Clients (home-cliente.component.html):**
```html
<td class="eliminar">
  <button (click)="eliminarPorId(cliente.id)">❌</button>
  <button class="editar" data-bs-toggle="modal" data-bs-target="#editarClienteModal" (click)="toggleModoEdicion(cliente)">✏️</button>
</td>
```

## Expected Behavior After Fix

1. **Correct Button Click:** The scrapper now clicks the delete button (❌) instead of other action buttons
2. **SweetAlert2 Confirmation:** The scrapper waits for the SweetAlert2 popup to appear, clicks the confirm button, and waits for it to disappear
3. **Deletion Verification:** The scrapper verifies that the item is removed from the table after deletion
4. **Robust Error Handling:** If the dialog doesn't appear or there are timing issues, the scrapper logs a warning but continues

## Notes

- The fix uses Playwright's selector syntax with `has-text()` to target buttons by their emoji content
- All timing waits are intentional to handle Angular's asynchronous rendering and API calls
- The delete flow now has better observability with warning messages if anything goes wrong
