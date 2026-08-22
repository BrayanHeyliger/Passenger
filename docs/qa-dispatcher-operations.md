# QA — Operación de dispatcher

**Fecha:** 22 de agosto de 2026.

| Comprobación | Resultado |
|---|---|
| Ruta operativa | Aprobada: el panel está disponible en `/dispatcher`; `/dispatcher-dashboard` es un enlace heredado inexistente. |
| Cola de viajes | Aprobada: muestra pago directo, métodos habilitados y estados de elección manual o Autobúsqueda. |
| Selección manual | Aprobada: al abrir un viaje con elección protegida el modal ofrece únicamente al conductor elegido. |
| Identidad | Aprobada: los conductores de QA muestran foto demostrativa y estado de identidad; los pendientes no son asignables. |
| Autobúsqueda | Implementada y protegida: solo se habilita después de `driver_declined` y respeta la política administrativa. |
| Chat de soporte | Aprobado en QA: cada tarjeta muestra **Chat** y abre el componente reutilizable dentro de la sala del viaje, sin crear un canal paralelo. |
| Integración real | Pendiente: la lista, GPS, chat y estado de viajes aún requieren la base compartida y Socket.IO persistente para sincronizar dispositivos reales. |
