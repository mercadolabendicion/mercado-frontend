# How to Test the Delete Flow Fix

## Prerequisites
Before running the tests, ensure you have:

1. **Python 3.12+** installed
   ```bash
   python --version
   ```

2. **Install Playwright and dependencies**
   ```bash
   cd scrapper/
   pip install -r requirements.txt
   playwright install chromium
   ```

3. **Create `.env` file** in the `scrapper/` directory:
   ```bash
   cd scrapper/
   cat > .env << EOF
   BASE_URL=https://your-app-url.com
   USERNAME=your_username
   PASSWORD=your_password
   EOF
   ```
   Replace the values with your actual credentials.

## Running the Tests

### Option 1: Run Individual Delete Tests

**Test Product Deletion:**
```bash
cd scrapper/
python test/producto/test_eliminar_producto.py
```

Expected output:
```
→ Creando producto para prueba de eliminación...
✓ Producto creado exitosamente: {...}
→ Eliminando producto...
✓ FLUJO ELIMINAR PRODUCTO FUNCIONÓ CORRECTAMENTE
✓ Producto eliminado: {...}
```

**Test Client Deletion:**
```bash
cd scrapper/
python test/cliente/test_eliminar_cliente.py
```

Expected output:
```
→ Creando cliente para prueba de eliminación...
✓ Cliente creado exitosamente: {...}
→ Eliminando cliente...
✓ FLUJO ELIMINAR CLIENTE FUNCIONÓ CORRECTAMENTE
✓ Cliente eliminado: {...}
```

### Option 2: Run All Delete Tests
```bash
cd scrapper/
python run_tests.py eliminar
```

This will run both product and client delete tests sequentially.

### Option 3: Run Full Test Suite
```bash
cd scrapper/
python run_tests.py
```

This runs all available tests (login, cliente, producto, venta).

## What the Tests Validate

Each delete test performs the following steps:

1. **Login** to the application
2. **Create** a new product/client with random data
3. **Validate** the item exists in the table
4. **Click** the delete button (❌) - **THIS IS THE FIX**
5. **Confirm** the SweetAlert2 dialog - **THIS IS THE FIX**
6. **Validate** the item no longer exists in the table
7. **Report** success or failure

## Observing the Fix in Action

When running tests with `headless=False` (default), you'll see:

1. Browser window opens
2. Login happens
3. Navigation to products/clients page
4. New item created and appears in table
5. **Search for the item** in the table
6. **Delete button (❌) is clicked** - you'll see the button highlight
7. **SweetAlert2 confirmation dialog appears** - "¿Estás seguro de eliminar...?"
8. **"Sí, eliminar" button is clicked** - dialog disappears
9. **Item is removed from the table**
10. Test validates the item is gone

## Troubleshooting

### Test fails with "No module named 'playwright'"
```bash
pip install playwright
playwright install chromium
```

### Test fails with "Faltan variables en .env"
Create the `.env` file in the `scrapper/` directory with:
```
BASE_URL=your_app_url
USERNAME=your_username  
PASSWORD=your_password
```

### Test fails at login
- Verify your credentials in `.env`
- Check that the `BASE_URL` is correct and accessible
- Ensure the login page is available

### Test fails at delete confirmation
This was the original issue! If you see this, the fix should have addressed it. Check:
- Is the SweetAlert2 popup appearing on screen?
- Does the warning message appear in the output?
- Check the browser console for JavaScript errors

### Browser doesn't open (headless mode)
The tests run with `headless=False` by default. To change this:
1. Edit the test file
2. Change `get_page(headless=False)` to `get_page(headless=True)`

## Expected Test Duration

- Individual delete test: ~10-15 seconds
- Both delete tests: ~20-30 seconds  
- Full test suite: ~2-3 minutes

## Success Indicators

✅ **Test Passed** - You'll see:
- Green checkmarks (✓) in the output
- "FUNCIONÓ CORRECTAMENTE" message
- Exit code 0

❌ **Test Failed** - You'll see:
- Red X marks (✗) in the output
- "FALLÓ" message
- Exit code non-zero
- Error details in the output

## Next Steps

After confirming the tests pass:
1. The delete flow is now working correctly
2. You can run these tests regularly to ensure it stays working
3. The same pattern can be applied to other UI automation scenarios

## Files Modified by This Fix

The fix modified only these files:
- `scrapper/actions/producto_actions.py` (lines 140-168)
- `scrapper/actions/cliente_actions.py` (lines 152-181)

No changes were made to:
- Test files
- Angular application code
- Database or backend
- Other scrapper actions

This is a minimal, surgical fix focused only on the delete button selectors and SweetAlert2 confirmation handling.
