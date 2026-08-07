# WhatsApp Taxi SaaS — Ideas de Diseño

## Tres Enfoques Estilísticos

### 1. Verde Operacional (Seleccionado)
Plataforma B2B de alto rendimiento con identidad visual anclada en el verde WhatsApp. Sensación de confianza empresarial, modernidad y eficiencia operacional.
**Probabilidad:** 0.07

### 2. Azul Corporativo Minimalista
Diseño limpio y corporativo con fondo blanco puro, tipografía sans-serif y acentos azul marino. Estilo SaaS clásico.
**Probabilidad:** 0.02

### 3. Dark Premium
Fondo oscuro casi negro con acentos verdes neón y efectos de brillo. Estética tech/startup nocturna.
**Probabilidad:** 0.01

---

## Enfoque Seleccionado: Verde Operacional

### Design Movement
Material Design + SaaS Enterprise — interfaces funcionales con jerarquía visual clara, inspiradas en plataformas como Stripe, Twilio y Linear. Combinación de densidad informativa con espaciado generoso.

### Core Principles
1. **Confianza operacional**: Cada elemento comunica estabilidad y profesionalismo empresarial.
2. **Claridad funcional**: La arquitectura de información guía al usuario de forma intuitiva hacia la conversión.
3. **Identidad WhatsApp**: El verde icónico (#25D366) como color primario crea reconocimiento inmediato.
4. **Densidad elegante**: Secciones ricas en contenido sin sensación de saturación.

### Color Philosophy
- **Verde WhatsApp** `#25D366` / `oklch(0.76 0.18 148)` — color de marca primario, acción y CTA
- **Verde oscuro** `#128C7E` / `oklch(0.52 0.12 180)` — profundidad, hover states
- **Carbón** `oklch(0.13 0.01 250)` — fondo hero y secciones oscuras
- **Blanco roto** `oklch(0.97 0.005 100)` — fondo secciones claras
- **Gris cálido** `oklch(0.55 0.01 80)` — texto secundario

### Layout Paradigm
Asimétrico y orientado a flujo narrativo: hero de pantalla completa con mockup flotante, secciones alternadas (texto izquierda/imagen derecha), cards en grid 3 columnas para features, y pricing en cards destacadas.

### Signature Elements
1. **Burbujas de chat WhatsApp** — mockups realistas de conversaciones de WhatsApp integrados en las secciones de demostración.
2. **Gradiente verde diagonal** — fondo del hero con gradiente de `#128C7E` a `#25D366` con textura sutil.
3. **Badges de estado** — indicadores visuales de "En camino", "Viaje activo", "Completado" con colores semánticos.

### Interaction Philosophy
Micro-interacciones que refuerzan la sensación de plataforma viva: cards que elevan con sombra al hover, botones con feedback táctil (scale), contadores animados en estadísticas, y scroll reveal suave para secciones.

### Animation
- Entrance: fade-up con 40px de desplazamiento, 500ms ease-out, stagger de 80ms entre items
- Cards: translateY(-4px) + shadow en hover, 200ms ease-out
- Botones: scale(0.97) en active, 160ms
- Hero mockup: float animation suave de 6s loop
- Contadores: count-up animation al entrar en viewport

### Typography System
- **Display**: Sora (700, 800) — headings impactantes y modernos
- **Body**: Inter (400, 500, 600) — legibilidad perfecta para texto de plataforma
- **Mono**: JetBrains Mono — snippets de código y datos técnicos
- Escala: 12/14/16/18/20/24/32/40/48/64px

### Brand Essence
**"WhatsApp Taxi SaaS — La plataforma que convierte WhatsApp en tu central de taxis"**
Personalidad: Confiable, Eficiente, Moderno

### Brand Voice
- Directo y orientado a resultados: "Gestiona tu flota desde WhatsApp. Sin apps. Sin complicaciones."
- CTA de alto impacto: "Empieza gratis hoy" / "Ver demo en vivo"

### Wordmark & Logo
Ícono de taxi (auto de perfil) dentro de una burbuja de chat con fondo verde WhatsApp. Sin texto en el símbolo.

### Signature Brand Color
`#25D366` — Verde WhatsApp, inconfundible y con reconocimiento global instantáneo.

## Style Decisions
- Usar Sora para todos los headings H1-H3, Inter para body y UI
- El hero siempre tendrá fondo oscuro carbón con gradiente verde sutil
- Los mockups de WhatsApp son elementos decorativos clave en hero y features
- Pricing card "Pro" siempre destacada con fondo verde y texto blanco
- Cada sección principal debe incluir al menos un artefacto operacional de taxi: burbuja de chat, snippet de tarifa, badge de estado, o detalle de dashboard
- Composición alternada: máximo 2 secciones consecutivas con el mismo patrón badge-headline-grid
- Copy directo y orientado a resultados de despacho: "asigna conductores", "calcula tarifas", "confirma viajes", no genérico SaaS
