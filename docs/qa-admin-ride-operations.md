# QA del panel administrativo de operación de viajes

**Fecha:** 22 de agosto de 2026.

| Comprobación | Resultado | Observación |
|---|---|---|
| Ruta administrativa | Protegida por rol | Al abrir `/admin` con una sesión demo de conductor, la aplicación redirigió a `/driver-dashboard`. Esta protección evita que un conductor acceda a configuración administrativa. |
| Ruta no registrada | Detectada | `/admin-dashboard` devuelve 404; la ruta administrativa válida es `/admin`. |
| Preparación de sesión administrativa | Completada | Se cerró la sesión de conductor y se abrió el acceso de QA para iniciar la cuenta administrativa. |
| Cuenta administrativa heredada | Bloqueada en este entorno | Las credenciales de demostración encontradas en el router heredado fueron rechazadas por el acceso local. La validación funcional queda respaldada por regresión y compilación; la verificación visual administrativa requiere una cuenta de admin activa o ajustar la configuración demo del entorno. |
| Módulo Operación de viajes | Aprobado visualmente mediante sesión administrativa temporal de QA | La navegación muestra la pestaña, los cinco métodos de pago directo, selección manual, Autobúsqueda, verificación, avisos, tiempos, radio, rating mínimo y antigüedad máxima de presencia. |
| Selección manual protegida | Aprobada visualmente | El panel muestra **Requerido** en lugar de un interruptor para esta regla, preservando la elección obligatoria del pasajero y evitando asignación automática silenciosa. |

La prueba visual del nuevo módulo continúa con la cuenta demo de administrador habilitada únicamente en el entorno de QA.
