# QA de avisos de sistema en segundo plano

**Fecha:** 22 de agosto de 2026  
**Alcance:** cliente y conductor de UnPasajero.Com en el entorno de QA HTTPS.

| Verificación | Resultado | Evidencia |
|---|---|---|
| Compilación de producción | Aprobada | `pnpm build` finalizó correctamente. |
| Regresión funcional | Aprobada | `server/mapReference.visual.test.ts`: 23 de 23 pruebas aprobadas. |
| Panel del conductor | Aprobado visualmente | Se visualizó el control **Avisos** con texto que indica el uso en segundo plano. |
| Panel del cliente | Aprobado visualmente | Se visualizó el control **Avisos** con el mismo comportamiento esperado. |
| Registro de service worker | Cubierto por código y prueba | El hook registra `/sw.js` cuando el navegador lo admite. |
| Solicitud de permiso en el navegador de QA | Limitada por el entorno | Tras pulsar **Avisos**, el navegador aislado mantuvo `Notification.permission = default`; no presentó ni concedió el permiso. |
| Notificación real del sistema operativo | Pendiente de validación manual | Requiere que el usuario conceda el permiso del navegador y que la pestaña pase a segundo plano. |

## Comportamiento implementado

El control **Avisos** solicita el permiso del navegador después de una acción explícita del usuario. Al concederlo, guarda una preferencia independiente para `client` y `driver` en el navegador actual. Los eventos de viajes, mensajes y cambios de estado se filtran además por canal.

> Las notificaciones del sistema se emiten únicamente cuando `document.visibilityState` es `hidden`. Cuando la aplicación está en primer plano se conserva la retroalimentación interna —historial, toast y sonido— sin duplicar una alerta del sistema operativo.

| Rol | Eventos cubiertos en la aplicación abierta | Canal |
|---|---|---|
| Conductor | Nueva solicitud y aceptación de viaje | `trips`, `status` |
| Cliente | Confirmación y actualizaciones emitidas por el helper de viaje | `trips` o `messages` según el evento |
| Cliente y conductor | Mensaje recibido de la contraparte en el chat | `messages` |

## Procedimiento de comprobación manual

1. Inicie sesión con una cuenta demo de cliente o conductor.
2. Pulse **Avisos** y acepte el permiso del navegador. Si el navegador lo bloqueó anteriormente, habilítelo desde sus ajustes del sitio.
3. Mantenga la sesión abierta y envíe al rol contrario un mensaje o una solicitud de viaje desde otra sesión.
4. Cambie esta pestaña a segundo plano. Debe recibirse una notificación del sistema con enlace de retorno al panel correspondiente.
5. Vuelva a primer plano y confirme que el historial de avisos, el toast y el sonido continúan funcionando sin una notificación del sistema duplicada.

## Límites conocidos

Esta fase cubre una pestaña o PWA que permanece abierta, incluso en segundo plano. No entrega alertas fiables cuando la aplicación está totalmente cerrada: para ello se debe implementar la suscripción `PushManager`, VAPID, persistencia por dispositivo y envío desde el backend descritos en [web-push-production-activation.md](./web-push-production-activation.md).

La automatización del navegador validó los controles visibles, la sesión demo de ambos roles y el flujo compilado. El entorno aislado no expuso el diálogo de permiso y mantuvo el valor `default`, por lo que no es posible certificar desde esta sesión la entrega visible de una notificación del sistema operativo. Esa última comprobación se debe ejecutar manualmente en un navegador real con permiso concedido.
