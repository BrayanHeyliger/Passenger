# QA — Comunicación de dispatcher y administrador

**Fecha:** 22 de agosto de 2026.

| Flujo | Resultado |
|---|---|
| Dispatcher → viaje | Aprobado: cada solicitud ofrece **Chat** y abre la conversación sobre la misma sala del viaje. |
| Admin → viaje activo | Aprobado: la pestaña **Viajes** ofrece **Contactar** solo cuando hay un conductor asignado y el viaje no está completado. |
| Llamada web | Interfaz disponible: el encabezado del chat muestra el control de llamada y la llamada exige una conexión activa y permiso de micrófono. No se solicitó micrófono durante QA. |
| Seguridad de sala | Aplicada en cliente: la conversación se abre desde el viaje, no desde perfiles o salas arbitrarias. |
| Limitación actual | El chat y la señalización de llamada entre dispositivos requieren el servicio Socket.IO con JWT por viaje en ejecución continua. El QA valida la interfaz y la sala local, no una llamada de dos dispositivos. |
