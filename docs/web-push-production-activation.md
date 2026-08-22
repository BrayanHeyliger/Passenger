# Activación de Web Push persistente en producción

## Objetivo

El cliente actual entrega **avisos del sistema mientras la web o PWA abierta queda en segundo plano**. Para recibir un aviso cuando el navegador está cerrado, se necesita Web Push real: una suscripción por dispositivo, claves VAPID y un emisor autenticado en el backend. La Push API permite al navegador iniciar el service worker para procesar un mensaje entrante aunque la aplicación no esté cargada; el aviso se muestra desde ese worker. [1]

> El service worker actual ya recibe el evento `push`, muestra la notificación de UnPasajero.Com y abre el panel asociado al tocarla. Aún no existe quien envíe esos eventos ni la base de datos de suscripciones.

## Requisitos de infraestructura

| Componente | Responsabilidad | Producción requerida |
|---|---|---|
| Dominio HTTPS de Passenger | Service worker, permisos y `PushManager` | Sí; `PushManager.subscribe()` y `showNotification()` requieren un contexto seguro. [2] [3] |
| Backend persistente | Validar membresía del viaje y enviar los payloads | Sí. Puede ser el servicio Socket.IO reforzado. |
| Base de datos compartida | Guardar suscripciones por usuario, rol y dispositivo | Sí. |
| VAPID | Identidad criptográfica del emisor Web Push | Sí; clave privada exclusivamente en el backend. |
| Worker `/sw.js` | Mostrar aviso y navegar al enlace seguro | Ya preparado; se debe conservar. |

## Secretos y configuración

Genere una pareja VAPID una sola vez y guárdela como secreto de producción. Nunca se debe incluir la clave privada en el frontend ni en Git.

| Variable | Dónde se usa | Visibilidad |
|---|---|---|
| `VITE_WEB_PUSH_VAPID_PUBLIC_KEY` | Passenger, al invocar `PushManager.subscribe()` | Pública. |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | Servicio backend que envía los avisos | Secreta. |
| `WEB_PUSH_CONTACT_EMAIL` | Subject de VAPID, por ejemplo `mailto:security@unpasajero.com` | Backend. |
| `SAYTAXI_REALTIME_JWT_SECRET` | Autorización de eventos y pertenencia a una sala de viaje | Secreta y compartida con Passenger si se habilitan tokens firmados. |

## Modelo de datos recomendado

Almacene una fila por navegador o PWA, no una única suscripción por usuario. Así el mismo cliente puede recibir avisos en móvil y escritorio y cada dispositivo puede revocarse independientemente.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| `id` | UUID | Identificador de la suscripción. |
| `user_id` | UUID o ID de usuario | Dueño autenticado. |
| `role` | `client` o `driver` | Rol que recibió el permiso. |
| `endpoint` | Texto único | Endpoint entregado por el navegador. |
| `p256dh` | Texto cifrado o protegido | Clave pública de la suscripción. |
| `auth` | Texto cifrado o protegido | Secreto de autenticación de la suscripción. |
| `enabled_channels` | JSON | Canales `trips`, `messages` y `status`. |
| `created_at`, `updated_at`, `last_seen_at` | UTC | Auditoría y limpieza. |

## Contrato de suscripción

Después de una pulsación explícita de **Avisos**, el frontend debe esperar `navigator.serviceWorker.ready`, pedir el permiso y crear una suscripción con `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`. La suscripción debe iniciarse por una interacción del usuario para respetar los controles antiabuso del navegador. [2] El objeto resultante se envía al backend mediante una ruta protegida, por ejemplo:

```json
POST /api/push-subscriptions
{
  "subscription": {
    "endpoint": "https://push.example/...",
    "keys": { "p256dh": "...", "auth": "..." }
  },
  "role": "driver",
  "channels": { "trips": true, "messages": true, "status": true }
}
```

El servidor debe ignorar cualquier `user_id` enviado por el cliente y tomarlo de la sesión o JWT validado. También debe verificar que el rol solicitado coincida con el rol de esa sesión.

## Emisión segura por evento

Cuando el backend procesa un evento, primero identifica usuarios autorizados y sus dispositivos habilitados; solo después prepara el payload para el proveedor Web Push. Las notificaciones no deben revelar teléfonos, direcciones completas ni contenido de conversación sensible sobre una pantalla bloqueada.

| Evento del dominio | Receptor | Título y enlace sugeridos | Canal |
|---|---|---|---|
| `trip.requested` | Conductor asignable | `Nuevo viaje disponible` → `/driver-dashboard` | `trips` |
| `trip.accepted` | Cliente del viaje | `Conductor en camino` → `/trip-tracking?tripId=…` | `trips` |
| `trip.arrived` | Cliente del viaje | `Tu conductor llegó` → seguimiento del viaje | `status` |
| `trip.status_changed` | Participantes autorizados | Estado resumido → viaje correspondiente | `status` |
| `chat.message_created` | Participante contrario | `Tienes un mensaje nuevo` → chat del viaje | `messages` |

El payload debe seguir el contrato consumido por `sw.js`:

```json
{
  "title": "UnPasajero.Com",
  "body": "Tu conductor está en camino.",
  "tag": "trip-trip_123-status",
  "url": "/trip-tracking?tripId=trip_123",
  "requireInteraction": false
}
```

## Seguridad y operación

1. **Autorización antes de enviar:** valide pertenencia del usuario al viaje y rol antes de buscar destinatarios.
2. **Deduplicación:** use `tag` por viaje y tipo de evento para sustituir avisos obsoletos en lugar de inundar al usuario.
3. **Limpieza:** si el proveedor responde `404` o `410`, elimine de inmediato la suscripción inválida.
4. **Revocación:** permita desactivar cada canal y borrar la suscripción desde el perfil; sincronice ese cambio con backend.
5. **Auditoría mínima:** registre ID de evento, usuario, dispositivo y resultado, sin almacenar el cuerpo sensible del mensaje.
6. **Pruebas multi-dispositivo:** compruebe cliente y conductor con navegadores diferentes, conexión a Socket.IO desplegada y datos de viajes compartidos.

## Orden de activación recomendado

1. Desplegar Passenger y el servicio de tiempo real en HTTPS permanente con JWT de viaje y base de datos compartida.
2. Crear la tabla de suscripciones y la API autenticada de alta, actualización y baja.
3. Añadir `PushManager.subscribe()` al hook actual usando la clave VAPID pública.
4. Instalar una biblioteca de envío Web Push solo en el backend y cargar las claves mediante secretos.
5. Conectar los cinco eventos de negocio de la tabla anterior tras validar sus destinatarios.
6. Probar permiso, segundo plano, navegador cerrado, clic de la notificación y desuscripción en Android, iOS PWA y escritorio.

## Referencias

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API "MDN: Push API"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe "MDN: PushManager.subscribe()"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification "MDN: ServiceWorkerRegistration.showNotification()"
