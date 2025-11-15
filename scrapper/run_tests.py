#!/usr/bin/env python3
"""
Script maestro para ejecutar tests de automatización.
Permite ejecutar tests individuales, por categoría o todos.

Uso:
    python run_tests.py                    # Ejecuta todos los tests
    python run_tests.py cliente            # Ejecuta solo tests de cliente
    python run_tests.py producto           # Ejecuta solo tests de producto
    python run_tests.py venta              # Ejecuta solo tests de venta
    python run_tests.py crud               # Ejecuta solo tests CRUD completos
    python run_tests.py --list             # Lista todos los tests disponibles
"""

import sys
import subprocess
from pathlib import Path
from typing import List, Dict


# Configuración de tests
TESTS = {
    "cliente": [
        "test/cliente/test_crear_cliente.py",
        "test/cliente/test_editar_cliente.py",
        "test/cliente/test_eliminar_cliente.py",
        "test/cliente/test_crud_completo_cliente.py",
    ],
    "producto": [
        "test/producto/test_crear_producto.py",
        "test/producto/test_editar_producto.py",
        "test/producto/test_eliminar_producto.py",
        "test/producto/test_crud_completo_producto.py",
    ],
    "venta": [
        "test/venta/test_crear_venta.py",
    ],
    "login": [
        "test/test_login.py",
    ]
}

# Categorías especiales
CATEGORIES = {
    "crud": [
        "test/cliente/test_crud_completo_cliente.py",
        "test/producto/test_crud_completo_producto.py",
    ],
    "crear": [
        "test/cliente/test_crear_cliente.py",
        "test/producto/test_crear_producto.py",
        "test/venta/test_crear_venta.py",
    ],
    "editar": [
        "test/cliente/test_editar_cliente.py",
        "test/producto/test_editar_producto.py",
    ],
    "eliminar": [
        "test/cliente/test_eliminar_cliente.py",
        "test/producto/test_eliminar_producto.py",
    ],
}


def get_all_tests() -> List[str]:
    """Retorna lista de todos los tests disponibles."""
    all_tests = []
    for tests in TESTS.values():
        all_tests.extend(tests)
    return all_tests


def list_tests():
    """Muestra todos los tests disponibles organizados por categoría."""
    print("=" * 70)
    print("TESTS DISPONIBLES")
    print("=" * 70)
    
    print("\n📋 Por Entidad:")
    for entity, tests in TESTS.items():
        print(f"\n  {entity.upper()}:")
        for test in tests:
            print(f"    • {Path(test).name}")
    
    print("\n📋 Por Categoría:")
    for category, tests in CATEGORIES.items():
        print(f"\n  {category.upper()}:")
        for test in tests:
            print(f"    • {Path(test).name}")
    
    print("\n" + "=" * 70)
    print("Para ejecutar, usa: python run_tests.py <entidad|categoria>")
    print("Ejemplo: python run_tests.py cliente")
    print("=" * 70)


def run_test(test_path: str) -> bool:
    """
    Ejecuta un test individual.
    Retorna True si el test pasa, False si falla.
    """
    print(f"\n{'=' * 70}")
    print(f"Ejecutando: {test_path}")
    print(f"{'=' * 70}")
    
    try:
        result = subprocess.run(
            ["python", test_path],
            capture_output=False,
            text=True,
            timeout=300  # 5 minutos máximo por test
        )
        
        if result.returncode == 0:
            print(f"✓ {test_path} PASÓ")
            return True
        else:
            print(f"✗ {test_path} FALLÓ (código: {result.returncode})")
            return False
    except subprocess.TimeoutExpired:
        print(f"✗ {test_path} TIMEOUT (excedió 5 minutos)")
        return False
    except Exception as e:
        print(f"✗ {test_path} ERROR: {e}")
        return False


def run_tests(tests: List[str]):
    """Ejecuta una lista de tests y muestra resumen."""
    total = len(tests)
    passed = 0
    failed = 0
    
    print("\n" + "=" * 70)
    print(f"EJECUTANDO {total} TESTS")
    print("=" * 70)
    
    results = {}
    for test in tests:
        success = run_test(test)
        results[test] = success
        if success:
            passed += 1
        else:
            failed += 1
    
    # Resumen
    print("\n" + "=" * 70)
    print("RESUMEN DE EJECUCIÓN")
    print("=" * 70)
    print(f"Total:   {total}")
    print(f"Pasaron: {passed} ✓")
    print(f"Fallaron: {failed} ✗")
    print("=" * 70)
    
    if failed > 0:
        print("\nTests que fallaron:")
        for test, success in results.items():
            if not success:
                print(f"  ✗ {test}")
    
    print("=" * 70)
    
    return failed == 0


def main():
    """Función principal."""
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_tests()
        return
    
    # Determinar qué tests ejecutar
    if len(sys.argv) == 1:
        # Ejecutar todos los tests
        tests_to_run = get_all_tests()
        print("Ejecutando TODOS los tests...")
    else:
        category = sys.argv[1].lower()
        
        # Buscar en entidades
        if category in TESTS:
            tests_to_run = TESTS[category]
            print(f"Ejecutando tests de: {category.upper()}")
        # Buscar en categorías especiales
        elif category in CATEGORIES:
            tests_to_run = CATEGORIES[category]
            print(f"Ejecutando tests de categoría: {category.upper()}")
        else:
            print(f"✗ Categoría desconocida: {category}")
            print("Usa --list para ver las categorías disponibles")
            sys.exit(1)
    
    # Ejecutar tests
    success = run_tests(tests_to_run)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
