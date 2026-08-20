# QA local — tarjetas narrativas para pasajeros y conductores

## Hallazgo de escritorio

La tarjeta condensada de pasajeros se visualizó en la landing local. Conserva el bloque de entrada de pasajeros, reduce el contenido repetitivo a una narrativa clara, presenta tres beneficios de lectura rápida y mantiene el CTA hacia `#how-it-works`.

La visual está integrada al sistema dark premium con contraste legible, panel de ruta ilustrado localmente y sin alterar el hero, el mapa funcional ni la navegación principal.

## Resultado responsive y funcional

La comprobación móvil a 375 px confirmó que las dos tarjetas están presentes y que `scrollWidth` es igual a `clientWidth` (375 px), por lo que no se introdujo desbordamiento horizontal. La tarjeta de pasajeros conserva su jerarquía de badge, título, explicación y beneficios compactos antes de presentar la visual de ruta.

La compilación de Passenger finalizó correctamente. También se verificaron los destinos de los CTAs: pasajeros enlaza al flujo existente `#how-it-works`, mientras que el CTA de conductor preserva el registro con el rol `driver`.

## Resumen de Ejecución y Entrega

### 1. Errores Encontrados y Soluciones

No se encontraron errores de compilación, enlaces rotos ni cortes responsive relacionados con las tarjetas. La condensación eliminó el bloque de testimonio y métrica de pasajero hardcodeados, evitando presentar ese contenido como prueba social.

### 2. Mejoras Aplicadas

Las secciones de pasajeros y conductores conservan sus encabezados, información esencial y CTAs, pero reemplazan grids largos y textos repetidos por dos tarjetas narrativas dark premium con visuales locales de ruta y resumen de ganancias. La tarjeta de ganancias se rotula expresamente como **ejemplo visual**.

### 3. Hoja de Ruta para Escalabilidad (Priorizada)

1. **Alta prioridad:** Conectar los estados visuales de ruta y conductor a datos reales del viaje cuando el servicio en tiempo real esté publicado.
2. **Media prioridad:** Reemplazar los valores ilustrativos de ganancias con cifras provenientes del historial real de cada conductor autenticado.
3. **Baja prioridad:** Añadir una variación de tarjeta para paquetes cuando ese servicio tenga un flujo comercial propio en la landing.
