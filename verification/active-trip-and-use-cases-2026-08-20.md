# QA — modo nocturno y casos de uso

## Hallazgo de modo nocturno

El modo nocturno se activó correctamente desde la pantalla de seguimiento. Al activarlo, la etiqueta cambia a **Modo enfoque**, la pantalla muestra **Modo noche · viaje activo**, se mantiene el mapa, la identidad del conductor, la ETA y las acciones de compartir, seguridad, chat y llamada. El detalle secundario de timeline se oculta para reducir distracciones.

## Casos de uso

El selector de landing se verificó con el caso **Paquetes**. Al elegirlo, cambian título, explicación, beneficios, CTA e icono hacia el flujo de envío. Las opciones de Taxi urbano, Aeropuerto y Flotillas están disponibles en el mismo selector para mantener el contenido organizado sin alargar la landing.

## Corrección aplicada

Durante la primera compilación, el componente tenía la clave `icon` repetida en cada caso de uso. Se renombró el segundo campo a `visualIcon`; la compilación posterior terminó correctamente y sin esas advertencias.

## Resultado

El modo nocturno activo y los casos de uso conservan el diseño dark premium y se integran sin alterar mapas, chat, seguimiento GPS ni las rutas existentes.
