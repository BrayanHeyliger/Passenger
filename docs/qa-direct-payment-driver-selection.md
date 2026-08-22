# QA de pago directo y selección de conductor

**Fecha:** 22 de agosto de 2026.

| Entorno revisado | Observación | Uso para la validación |
|---|---|---|
| Preview heredado en puerto 3004 | Continuaba ejecutando una copia previa: al solicitar un viaje mostró la búsqueda automática antigua. | No se utiliza como evidencia del cambio actual. |
| Repositorio actualizado en puerto 3001 | El arranque local redirigió correctamente a la pantalla de inicio de sesión de UnPasajero.Com. | Entorno de QA de los cambios de pago directo, selección manual y Autobúsqueda. |
| Inicio de sesión demo en puerto 3001 | Bloqueado: el backend local se inició sin `DEMO_AUTH_ENABLED`, por lo que respondió “Autenticación de demo no habilitada”. | La prueba visual completa requiere reiniciar este entorno con la autenticación demo habilitada. |
| Reinicio de QA con `DEMO_AUTH_ENABLED=true` | La pantalla de login volvió a estar disponible sin el aviso de bloqueo y aceptó las credenciales demo. | Listo para continuar con la validación funcional. |
| Sesión demo de cliente | El panel cargó correctamente tras el inicio de sesión, con mapa, campos de origen/destino y CTA de solicitud disponibles. | Preparado para iniciar una solicitud y verificar la selección manual. |
| Selección manual de conductor | Aprobada visualmente. Tras enviar la ruta de prueba se mostraron tres conductores con vehículo, distancia en millas, ETA, estado verificable y métodos de pago. | Confirma que no existe asignación automática inicial. |
| Cobro directo y Autobúsqueda | Aprobados visualmente. La interfaz aclara que UnPasajero.Com no procesa el pago del viaje y muestra **Autobúsqueda** con icono de rayo. | Confirma la alternativa solicitada para falta de respuesta o rechazo. |
| Rechazo del conductor elegido | Aprobado mediante simulación de QA en el almacenamiento local. El panel indicó que el conductor no podía aceptar y mantuvo visible el botón **Autobúsqueda**. | Confirma que no se reasigna de manera silenciosa ni engañosa. |
| Autobúsqueda posterior al rechazo | Aprobada visualmente. Seleccionó a Luis R. como recomendación alternativa, mostrando distancia, vehículo y métodos de pago directos. | Confirma que la alternativa se presenta de forma explícita y trazable. |
| Duplicación de estado de búsqueda | Corregida. Se retiró el panel heredado de búsqueda de la columna lateral cuando Autobúsqueda ya presenta al conductor recomendado. | Mantiene una sola explicación principal para el pasajero. |
| Comunicación pública de métodos de pago | Aprobada visualmente en el footer: ahora indica que el conductor puede aceptar efectivo, Zelle, Cash App, PayPal y transferencia. | Evita presentar estos métodos como un cobro de la plataforma. |
| Configuración de cobro del conductor | Aprobada visualmente. El perfil del conductor muestra interruptores independientes para efectivo, Zelle, Cash App, PayPal y transferencia, con la aclaración de que la plataforma no recibe el dinero. | Permite que cada conductor decida los métodos que muestra al pasajero. |
| Persistencia de preferencias | Aprobada. Al habilitar Zelle, la preferencia se guardó en `unpasajero_driver_payment_methods` junto con efectivo. | Conserva los métodos elegidos por el conductor en este navegador de demo. |

## Criterios de comprobación

La prueba debe confirmar que el pasajero crea una solicitud, ve una lista de conductores cercanos con sus métodos de pago directo y elige uno antes de que se envíe la solicitud. También debe confirmar que la respuesta de aceptación o rechazo llega desde el conductor seleccionado y que, ante falta de respuesta o rechazo, aparece **Autobúsqueda** con icono de rayo.

> El entorno demo usa almacenamiento local, por lo que la interacción entre los dos roles se verifica en la misma instancia o mediante datos compartidos de prueba. La sincronización real entre dispositivos seguirá dependiendo de la activación del servicio Socket.IO persistente y de una base de datos común.
