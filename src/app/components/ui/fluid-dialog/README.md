# Modales fluidos

`FluidDialogComponent` es el contenedor reutilizable. Cada funcionalidad declara su contenido por separado; no agrega variantes al laboratorio.

```html
<button #edit type="button" (click)="editor.openFrom(edit)">Editar</button>

<app-fluid-dialog #editor label="Editar propiedad" origin="control" [width]="680">
  <!-- Formulario propio de la funcionalidad -->
</app-fluid-dialog>
```

Importar `FluidDialogComponent` desde `components/ui` en el componente consumidor.

## Origen y destino

- `origin="control"`: botones pequeños o píldoras, como los casos 3 y 9. Revela el contenido antes durante la expansión.
- `origin="surface"`: tarjeta o fila completa. Conserva más tiempo la continuidad de la superficie inicial.
- `placement="center"`, `"bottom-right"` o `"trigger"`: posición final, independiente del origen. El destino se ajusta para entrar en la ventana, sin recortar la altura según la fila.
- `placement="below"`: despliega debajo del control con una separación de 8 px; si no hay espacio, intenta colocarse arriba y se ajusta a la ventana. El caso 12 usa `"trigger"` para expandirse desde el mismo lugar.
- `[width]`: ancho máximo en píxeles; se adapta al espacio disponible.
- `label`: nombre accesible obligatorio.
- `backdrop="none"`: mantiene el fondo visible, sin oscurecer ni difuminar. Útil para controles pequeños como el selector y el menú del caso 12. Los modales grandes conservan `backdrop="dim"` por defecto.
- `[showClose]="false"`: permite colocar un cierre propio dentro del contenido, como la cruz a la izquierda de «Añadir tarea» en el caso 13.

`openFrom(element)` mide ese elemento en cada apertura. `close()` anima el regreso a ese mismo elemento. El evento `(closed)` ocurre al terminar el regreso. El origen debe permanecer montado hasta ese evento; si la operación lo elimina, actualizar la lista en `closed`.

`(opened)` ocurre al terminar la apertura. Permite enfocar la opción seleccionada de un selector o la primera acción de un menú, cuando sus controles ya están habilitados.

Para que un ícono o texto viaje, usar el mismo `data-morph="clave"` en el origen y en el contenido. Las claves deben ser únicas dentro de cada diálogo. El motor mezcla las vistas con escala uniforme y restaura todos los detalles del origen al cerrar.

## Diálogos anidados

Declarar editor y confirmación como hermanos; el botón que abre la confirmación puede estar proyectado dentro del editor. Ambos usan `app-fluid-dialog`. El caso 11, en `nested-modal-demo.component.ts`, muestra apertura, cancelación, borrador conservado y eliminación simulada.

Los elementos `dialog` nativos manejan las capas y el aislamiento del diálogo superior. Escape cierra un nivel. El componente restaura el foco al disparador; `FluidDialogStack` conserva el bloqueo del scroll hasta cerrar la última capa.

## Motor compartido

`FluidMotion` concentra las capturas visuales, los elementos compartidos, el aterrizaje completo y el achique con recuperación. Los casos 1–10 del laboratorio también lo usan. Las reglas de posición y radio viven en `morph-geometry.ts`.

El contenido sin conexión entra desde un desenfoque de 6 px y se difumina al salir. Las capturas de los pares `data-morph` viven fuera de esa capa y permanecen nítidas. El filtro se elimina al terminar la entrada. También se difuminan los detalles sin pareja del disparador durante el intercambio.

El desplazamiento describe una curva suave, con un desvío máximo de 32 px proporcional a la distancia. El cierre recorre la misma curva en sentido inverso. La expansión en el mismo lugar y los ajustes menores de 8 px no agregan desvío. `prefers-reduced-motion` elimina la duración, el desenfoque y el recorrido intermedio.

La apertura del contenedor reutilizable conserva una captura completa del disparador mientras se expande. En `origin="control"`, el contenido se revela sin desplazamiento vertical. Para expandir desde el mismo lugar, usar `placement="trigger"`; `"below"` es una elección explícita para desplegables ubicados debajo.

Los diálogos de una funcionalidad deben vivir junto a esa funcionalidad, usando este contenedor. El laboratorio conserva sus ejemplos para comparar comportamientos; no es el registro de todos los modales de la aplicación.
