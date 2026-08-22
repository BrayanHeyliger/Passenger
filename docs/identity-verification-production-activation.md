# Activación de verificación de identidad de conductor

## Objetivo

El flujo implementado exige foto de perfil, selfie, licencia y consentimiento antes de que un conductor de producción pueda quedar disponible. La coincidencia entre cara y licencia queda bajo **revisión humana administrativa**; no se declara ni simula una decisión biométrica automática.

| Etapa | Estado en código | Requisito de activación |
|---|---|---|
| Persistencia | Modelo Drizzle y migraciones `0003` / `0004` creados | Aplicar las migraciones en la base de datos de Passenger. |
| Evidencias | Router protegido guarda claves en almacenamiento privado | Usar autenticación OAuth/sesión firmada real de conductor. |
| Revisión | Cola administrativa y decisiones auditables creadas | El revisor debe iniciar sesión como administrador OAuth. |
| Foto a pasajeros | Solo se expone `drivers.profileImage` después de aprobar | Poblar conductores reales con ubicación, vehículo y métodos directos persistidos. |

## Orden de activación recomendado

1. Respaldar la base de datos y aplicar `drizzle/0003_gorgeous_shiver_man.sql` y `drizzle/0004_large_famine.sql` en un entorno de staging de Passenger. No aplicar estas migraciones en la base del servicio separado `saytaxi-realtime-service`.
2. Verificar que el login OAuth crea o recupera el perfil de `drivers` asociado al usuario autenticado.
3. Probar con una cuenta de conductor real: subir imágenes JPG/PNG/WebP menores de 5 MB, aceptar el consentimiento y enviar a revisión.
4. Probar con una cuenta administradora real: cargar solicitudes, abrir las tres evidencias temporales, emitir una decisión y comprobar que se registra la nota.
5. Confirmar que un conductor no aprobado no puede ponerse en línea ni aceptar un viaje, y que al aprobarse se publica solamente la foto de perfil aprobada al pasajero.

## Protección de datos

Las claves de selfie y licencia viven en `driverIdentitySubmissions` y solo el procedimiento administrativo entrega enlaces temporales para revisar evidencias. El pasajero no recibe esas claves. La foto expuesta al pasajero se establece tras la aprobación y se guarda separadamente en `drivers.profileImage`.

> Los retratos actuales de la experiencia demo siguen identificados como demostrativos. No se deben sustituir por fotos reales hasta completar y aprobar el flujo de identidad de cada conductor.

## Restricciones vigentes

La sesión de demostración local no es una sesión OAuth y no puede subir ni persistir documentos reales. Se muestra como verificada exclusivamente para mantener las pruebas de viaje del demo; la interfaz lo declara explícitamente. El almacenamiento de evidencias y la cola privada deben validarse con sesiones de producción después de aplicar las migraciones.
