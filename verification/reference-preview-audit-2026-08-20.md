# Auditoría de versión contra preview de referencia

## Estado del preview indicado

El preview `?product-improvements=1` ya no respondió porque su servidor temporal está inactivo. Se intentó reactivarlo desde la página de wake-up, pero no volvió a cargar. La comparación se completó con el estado recuperado del proyecto, las capturas de QA existentes y el conjunto de mejoras registradas durante la construcción de esa versión.

## Elementos restaurados

| Área | Restauración aplicada |
|---|---|
| Hero Passenger | Se preservó el hero oscuro con mapa, pasos de reserva, cotización inicial y CTA. Se reemplazó la prueba social no verificable por información operativa de seguridad. |
| Identidad | Navbar, login, registro, footer, metadatos y valores de configuración por defecto usan SayTaxi Mobility Platform. |
| Pasajeros y conductores | Se restauraron tarjetas narrativas dark premium con estados visuales, CTA y microinteracciones respetuosas de movimiento reducido. |
| Landing de producto | Se conservaron seguridad, calculadora ROI, comparador de planes, demo guiada de flotilla y selector de casos de uso. |
| Administración | Se restauró la pestaña RealTime; evita generar métricas ficticias y verifica el endpoint solo si está configurado. |
| Confianza | Footer con badges Pago Seguro, SSL Encriptado y Conductores Verificados, más los métodos de pago locales. |

## Validación

El build de producción finalizó correctamente. La captura de la landing estática confirma el hero SayTaxi, mapa, cotización inicial, tarjeta dark premium, navegación y footer unificado. La autenticación local muestra SayTaxi en una sesión limpia. La comprobación DOM final encontró el activo de marca `/saytaxi-brand.svg`, dos tarjetas narrativas dark premium y los bloques de seguridad y comparador presentes.

## Nota de publicación

El paquete está actualizado localmente. La publicación permanente sigue condicionada a que Netlify acepte el despliegue; los intentos anteriores fueron omitidos por la restricción de cuenta del servicio.
