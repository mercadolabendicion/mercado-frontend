# CSS Variables - Guía de Uso

Este documento describe las variables CSS definidas en el proyecto para mantener un estilo coherente en toda la aplicación.

## Variables de Color

### Colores Primarios
- `--primary-color`: rgb(67, 164, 255) - Color azul principal de la aplicación
- `--primary-hover`: #007bff - Color azul para estados hover
- `--primary-dark`: rgb(34, 86, 134) - Color azul oscuro para gradientes

### Colores Semánticos
- `--success-color`: #28a745 - Verde para acciones exitosas
- `--success-hover`: #218838 - Verde hover
- `--danger-color`: #dc3545 - Rojo para errores/eliminaciones
- `--danger-hover`: #c82333 - Rojo hover
- `--warning-color`: #ffc107 - Amarillo para advertencias
- `--warning-hover`: #e0a800 - Amarillo hover
- `--info-color`: #17a2b8 - Azul claro para información
- `--info-hover`: #138496 - Azul claro hover

### Colores Neutrales
- `--gray-100` a `--gray-900`: Escala de grises desde muy claro a muy oscuro
- `--text-primary`: #212529 - Color de texto principal
- `--text-secondary`: #6c757d - Color de texto secundario
- `--text-muted`: #6b7280 - Color de texto atenuado
- `--text-light`: rgb(97, 97, 97) - Color de texto claro

### Colores de Fondo
- `--bg-white`: #ffffff - Fondo blanco
- `--bg-light`: #f8f9fa - Fondo claro
- `--bg-table-odd`: #f2f8ff - Filas impares de tablas
- `--bg-table-even`: #ffffff - Filas pares de tablas
- `--bg-overlay`: rgba(0, 0, 0, 0.5) - Fondo de modales/overlays

## Variables de Diseño

### Border Radius
- `--radius-sm`: 5px - Bordes pequeños (inputs, formularios)
- `--radius-md`: 8px - Bordes medianos (cards, contenedores)
- `--radius-lg`: 10px - Bordes grandes (botones, tablas)
- `--radius-xl`: 12px - Bordes extra grandes (modales)
- `--radius-round`: 100px - Bordes completamente redondeados

### Espaciado
- `--spacing-xs`: 5px - Espaciado extra pequeño
- `--spacing-sm`: 10px - Espaciado pequeño
- `--spacing-md`: 20px - Espaciado mediano
- `--spacing-lg`: 24px - Espaciado grande

### Transiciones
- `--transition-fast`: 0.15s - Transiciones rápidas
- `--transition-normal`: 0.3s - Transiciones normales
- `--transition-slow`: 0.5s - Transiciones lentas

### Sombras
- `--shadow-sm`: 0 0 5px rgba(0, 123, 255, 0.5) - Sombra pequeña
- `--shadow-md`: 0 4px 8px rgba(0, 0, 0, 0.1) - Sombra mediana
- `--shadow-lg`: 0 8px 16px rgba(0, 0, 0, 0.2) - Sombra grande

## Clases de Botones

### Botones con Clases
Preferir el uso de clases en lugar de IDs para nuevos componentes:
- `.btn-primary` - Botón azul principal
- `.btn-success` - Botón verde
- `.btn-secondary` - Botón gris
- `.btn-warning` - Botón naranja
- `.btn-danger` - Botón rojo
- `.btn-yellow` - Botón amarillo
- `.btn-light` - Botón blanco con borde

### Botones con IDs (Compatibilidad)
Los siguientes IDs se mantienen para compatibilidad con código existente:
- `#azul` - Equivalente a `.btn-primary`
- `#verde` - Equivalente a `.btn-success`
- `#gris` - Equivalente a `.btn-secondary`
- `#naranja` - Equivalente a `.btn-warning`
- `#rojo` - Equivalente a `.btn-danger`
- `#amarillo` - Equivalente a `.btn-yellow`
- `#blanco` - Equivalente a `.btn-light`

## Ejemplos de Uso

### Usar variables en CSS
```css
.mi-componente {
  background-color: var(--primary-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
}

.mi-componente:hover {
  background-color: var(--primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Botones
```html
<!-- Nuevo estilo recomendado -->
<button class="btn-primary btn-lg">Guardar</button>

<!-- Estilo antiguo (aún soportado) -->
<button id="azul" class="btn-lg">Guardar</button>
```

## Beneficios

1. **Consistencia**: Todos los componentes usan los mismos valores
2. **Mantenibilidad**: Cambios centralizados en un solo lugar
3. **Escalabilidad**: Fácil agregar nuevos temas o modos oscuros
4. **Legibilidad**: Nombres descriptivos en lugar de valores mágicos

## Migración

Al actualizar componentes existentes:
1. Reemplazar colores hexadecimales/RGB con variables apropiadas
2. Reemplazar valores de border-radius con variables de radio
3. Reemplazar valores de spacing con variables de espaciado
4. Reemplazar valores de transición con variables de transición

Ejemplo:
```css
/* Antes */
.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  transition: 0.3s;
}

/* Después */
.card {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: var(--transition-normal);
}
```
