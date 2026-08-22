# Activación de operaciones persistentes y tiempo real

## Alcance implementado

Passenger cuenta ahora con un modelo compartido para métodos de cobro directo, presencia del conductor, ofertas de viaje y eventos auditables. El router `tripOperations` protege las reglas de selección manual, aceptación/rechazo, Autobúsqueda, presencia y notas del dispatcher.

| Componente | Fuente de verdad prevista | Estado actual |
|---|---|---|
| Viaje y oferta | Base de datos Passenger | Esquema, migración y procedimientos listos; migración pendiente de aplicar. |
| Foto/métodos del conductor | Perfil aprobado de Passenger | Consulta pública limitada a conductores aprobados y en línea. |
| Auditoría de dispatcher | `tripOperationEvents` de Passenger | Procedimientos listos para creación y consulta. |
| Chat y GPS | Servicio Socket.IO por sala `trip-{id}` | El cliente y el panel dispatcher usan el mismo contrato de sala. |
| Avisos | Evento de auditoría más envío Web Push posterior | Se registra la intención; el envío persistente requiere VAPID y suscripciones. |

## Orden de activación seguro

1. Respaldar la base de datos de Passenger y aplicar `drizzle/0005_familiar_mister_sinister.sql` primero en staging. La migración agrega tablas y amplía enums; no debe ejecutarse contra la base del servicio Socket.IO.
2. Crear usuarios con rol `dispatcher` en la base de Passenger y asociar perfiles de cliente/conductor reales. Mantener el modo demo aislado de esas cuentas.
3. Probar el ciclo completo en staging: cliente crea oferta manual, conductor aprobado responde, dispatcher revisa la auditoría y solo después de rechazo o vencimiento inicia Autobúsqueda.
4. Publicar el servicio Socket.IO en ejecución continua con HTTPS, configurar `VITE_REALTIME_URL`, `SAYTAXI_REALTIME_JWT_SECRET` y el origen HTTPS de Passenger.
5. Emitir desde el backend de Passenger un JWT breve, validando que el actor autenticado pertenece al viaje antes de permitir unirse a `trip-{id}`.
6. Realizar una prueba de dos dispositivos: solicitud, selección manual, chat dispatcher, GPS del conductor, aceptación y recuperación de historial al recargar.

## Reglas que no se deben relajar

El dispatcher no puede reemplazar al conductor elegido manualmente. El cambio a Autobúsqueda solo puede surgir de un rechazo o vencimiento registrado. Un perfil pendiente de identidad no publica foto, no se muestra como disponible y no recibe ofertas. El pago sigue siendo directo al conductor: los métodos solo describen lo que el conductor acepta y la plataforma no procesa el importe del viaje.

## Límites de la versión actual

El panel mantiene datos demo como respaldo hasta que la migración esté aplicada y las consultas tRPC se conecten a cuentas OAuth reales. El chat visible reutiliza la sala de viaje, pero su durabilidad entre dispositivos depende de que el servicio Socket.IO permanente esté desplegado y reciba un JWT firmado. Los avisos de sistema en segundo plano son locales mientras no existan suscripciones Web Push y VAPID.
