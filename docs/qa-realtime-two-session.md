# QA — Operación persistente y Socket.IO

**Fecha:** 22 de agosto de 2026.

| Comprobación | Resultado |
|---|---|
| Migración operativa | Preparada: `0005_familiar_mister_sinister.sql` permanece sin aplicar, por seguridad. |
| JWT por viaje | Implementado: Passenger emite un token HS256 de 10 minutos solo después de validar que cliente, conductor u operador pertenece al viaje. |
| Rol de Socket.IO | Aprobado: cliente se firma como `passenger`, conductor como `driver` y administración/dispatcher como `support`. |
| Sala estricta | Aprobado: el chat normaliza la sala a `trip-{id}` y el servicio rechaza señalización fuera de una sala ya unida. |
| Dos sesiones QA | Aprobado contra `http://127.0.0.1:3000`: unión de sala, chat, oferta, respuesta y cierre de llamada. |
| Llamada con audio real | Pendiente de validación manual: requiere dos navegadores, permisos de micrófono y servicio accesible por HTTPS. |

## Resultado ejecutado

El script `saytaxi-realtime-service/scripts/qa-two-session-signaling.mjs` devolvió:

```json
{"ok":true,"roomId":"trip-qa-two-session","checks":["join","chat","offer","answer","end"]}
```

## Antes de producción

Aplicar la migración únicamente en staging, configurar la misma clave privada `SAYTAXI_REALTIME_JWT_SECRET` en Passenger y el servicio Socket.IO, y definir `VITE_REALTIME_URL` con una URL HTTPS pública. La ejecución continua del servicio no se activó en esta QA.
