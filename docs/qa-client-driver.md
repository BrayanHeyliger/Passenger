# QA funcional: cliente y conductor

**Alcance:** verificación del flujo de solicitud, asignación, seguimiento, mensajería y acciones operativas en el entorno de QA con autenticación de demostración.

## Flujos comprobados

| Flujo | Resultado | Evidencia funcional |
|---|---|---|
| Cliente: edición de direcciones | Aprobado | Se seleccionaron Lake Eola Park y Orlando International Airport mediante autocompletado. |
| Cliente: cálculo de cotización | Aprobado | La ruta calculó 21.3 km, 27 min y tarifa de $28.04 para Económico. |
| Cliente: solicitar viaje | Aprobado | La acción creó una solicitud persistida y mostró el estado de búsqueda. |
| Conductor: disponibilidad y solicitud | Aprobado | Al conectarse, el conductor recibió la solicitud pendiente con origen, destino y tarifa. |
| Conductor: aceptar viaje | Aprobado | La solicitud cambió a aceptada y se habilitaron navegación, llegada, SOS y cancelación. |
| Navegación del conductor | Aprobado | “Ir a recoger” abrió Lake Eola Park en OpenStreetMap. |
| Chat cliente → conductor | Aprobado | El conductor leyó el mensaje enviado por el cliente. |
| Chat conductor → cliente | Aprobado | El cliente recibió la respuesta del conductor después de reiniciar su sesión. |
| Cliente: recuperar viaje activo | Aprobado | Tras salir e iniciar sesión, el cliente recuperó conductor, tarifa, ETA y conversación. |
| Cliente: paquetes | Corregido y validado en build | La pestaña incorpora un creador de envío persistente y abre el seguimiento del paquete recién creado. |

## Fallos encontrados y correcciones

| Hallazgo | Corrección aplicada |
|---|---|
| La portada no mostraba un botón operativo para solicitar el viaje desde el dashboard de cliente. | Se añadió una acción visible, deshabilitada hasta que origen y destino estén presentes, que invoca `handleRequestTrip`. |
| El botón WhatsApp del conductor solo desplazaba la página y no abría el chat. | Se añadió `driverChatOpen`; el botón ahora abre directamente `TripChat` con `forceOpen`. |
| El viaje activo y la conversación se perdían al recargar el panel del cliente. | El dashboard restaura el viaje activo propio desde `wt_pending_trips`, junto con el estado y las direcciones. |
| La autenticación no podía probarse desde el preview estático. | Se habilitó autenticación de demostración controlada para QA y Stripe se cargó de forma diferida para no bloquear el servidor sin una clave de pagos. |
| Vite tenía importaciones duplicadas heredadas en App, Login, Register y Home. | Se eliminaron las importaciones repetidas que impedían cargar el entorno de QA. |
| Seguían apareciendo coordenadas, etiquetas y marca de versiones anteriores. | Se migraron fallbacks cartográficos a Orlando y las pantallas de acceso usan UnPasajero.Com. |
| La pestaña de paquetes no permitía crear envíos y remitía al hero. | Se añadió un creador dentro del panel, con recogida, destino, código de rastreo y acceso al seguimiento. |

## Validación técnica

La suite específica de regresión terminó con **16 pruebas aprobadas**. El build de producción completó sin errores de compilación. La advertencia de tamaño de bundle de Vite permanece como una oportunidad de optimización, no como un bloqueo funcional.

## Recomendaciones priorizadas

| Prioridad | Recomendación | Impacto esperado |
|---|---|---|
| Alta | Migrar viajes, chat y asignaciones de `localStorage` a base de datos compartida. | Cliente, conductor y operación conservarán el estado entre dispositivos y sesiones. |
| Alta | Conectar el panel de conductor a Socket.IO desplegado para solicitudes y GPS reales. | Asignación y seguimiento verdaderamente en tiempo real. |
| Alta | Sustituir la asignación automática de demostración por aceptación explícita del conductor. | Flujo operativo real y control de oferta. |
| Media | Implementar pagos autorizados con Stripe antes de asignar conductor. | Mejor protección de cobro y menos solicitudes no confirmadas. |
| Media | Dividir el bundle de cliente por rutas y paneles. | Menor tiempo de carga inicial, especialmente en móvil. |
