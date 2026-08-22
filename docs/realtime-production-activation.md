# Activación de tiempo real para UnPasajero.Com

## Estado del código

Passenger ya admite una URL externa con `VITE_REALTIME_URL`, token opcional de viaje y eventos de producción para sala, ubicación GPS y chat. Si no se define esa URL, el navegador continúa usando el Socket.IO local de QA para no interrumpir el demo.

## Variables necesarias

| Variable | Ubicación | Propósito |
|---|---|---|
| `VITE_REALTIME_URL` | Passenger | URL HTTPS permanente del servicio Socket.IO, sin una barra final. |
| `SAYTAXI_REALTIME_JWT_SECRET` | Passenger y Realtime Service | Clave compartida para emitir y validar tokens de viaje. Nunca debe exponerse al navegador. |
| `SAYTAXI_NETLIFY_ORIGIN` | Realtime Service | Dominio final de Passenger permitido por CORS. |

## Contrato de conexión

Passenger debe pedir al backend un JWT breve para la sesión autenticada, rol y viaje activo. El cliente abre Socket.IO con ese token y siempre se une a la sala `trip-{id}`.

```ts
io(import.meta.env.VITE_REALTIME_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  auth: { token: realtimeToken },
})
```

El conductor publica `driver:location` mientras está en ruta. El pasajero escucha `trip:location:update`, y ambos usan `trip:chat` para mensajes persistentes.

## Activación

1. Publicar el servicio de tiempo real con ejecución continua y asignarle una URL HTTPS permanente.
2. Configurar las tres variables anteriores en los servicios correspondientes.
3. Emitir tokens JWT desde el backend autenticado de Passenger, nunca desde React.
4. Probar dos dispositivos: pasajero crea viaje, conductor acepta, ambos entran a la misma sala, GPS y chat se replican.
5. Verificar `/api/health` y las métricas antes de abrir el acceso comercial.
