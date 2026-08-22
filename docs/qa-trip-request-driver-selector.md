# QA — Selector de conductor desde la portada

**Fecha:** 22 de agosto de 2026.

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Causa del reporte | Corregida | La ruta `/trip-request`, abierta después de solicitar un ride desde la portada, realizaba una asignación automática y no mostraba la selección manual. |
| Selector visible | Aprobado | La ruta ahora presenta **Elige a tu conductor** y tres opciones seleccionables: Demo Driver, Luis R. y Ana G. |
| Información por conductor | Aprobado | Cada tarjeta muestra vehículo, rating, distancia, ETA, verificación y métodos de pago directo. |
| Modelo de pago | Aprobado | La pantalla informa que UnPasajero.Com no procesa el pago del viaje. |
| Elección manual | Aprobada | Al pulsar Demo Driver, la pantalla muestra el conductor elegido y queda esperando exclusivamente su respuesta. |
| Autobúsqueda | Aprobada | Tras el tiempo de respuesta configurado, aparece el botón con rayo sin reasignar el viaje de forma silenciosa. |

La inspección se realizó con una solicitud temporal de QA en el almacenamiento local del navegador. No se modificaron viajes ni usuarios de producción.
