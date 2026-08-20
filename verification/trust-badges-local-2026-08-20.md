# QA local — badges de seguridad y pagos

## Resultado

El footer local de SayTaxi muestra tres badges de confianza: **Pago Seguro**, **SSL Encriptado** y **Conductores Verificados**. A su derecha muestra los métodos visuales locales Visa, Mastercard, AMEX, Zelle y PayPal.

En `/payments`, cada CTA de plan conserva su acción original y ahora presenta los tres badges inmediatamente debajo. El bloque inferior repite los badges y los cinco métodos aceptados para reforzar la confianza antes de checkout.

## Validación

| Área | Resultado |
|---|---|
| Build Vite + backend | Correcto |
| Checkout Básico, Pro y Enterprise | Botones conservados y badges visibles |
| Footer | Badges y métodos visibles, enlaces existentes preservados |
| Estilo | Contraste dark premium legible en tarjetas claras y oscuras |
| Dependencias visuales | Iconos Lucide y nombres de métodos renderizados localmente; sin imágenes externas |

## Nota

Los badges comunican prácticas de seguridad previstas. Antes de afirmar certificaciones comerciales específicas, se recomienda completar la configuración real de SSL, proveedor de pagos y verificación de conductores en producción.
