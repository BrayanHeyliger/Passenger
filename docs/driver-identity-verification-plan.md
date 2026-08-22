# Verificación de identidad de conductores

## Propósito

Antes de que un conductor pueda activarse y recibir solicitudes, debe completar una foto de perfil actual, una fotografía del documento de licencia y un consentimiento explícito. El resultado no se debe resolver con una promesa de coincidencia automática: cualquier señal de diferencia, baja calidad o duda debe pasar a revisión humana y mantener el perfil bloqueado.

| Etapa | Requisito | Estado permitido |
|---|---|---|
| 1. Perfil | Foto de rostro actual, frontal y sin accesorios que oculten la cara. | `photo_pending` |
| 2. Documento | Anverso de licencia vigente, legible y no recortada. | `document_pending` |
| 3. Consentimiento | Aceptación específica para usar los documentos solo en validación de identidad. | `consent_pending` |
| 4. Revisión | Comparación entre selfie, fotografía de licencia y datos del perfil por personal autorizado. | `pending_review` |
| 5. Decisión | Aprobación, rechazo con motivo o solicitud de reenvío. | `approved`, `rejected`, `resubmission_required` |

## Regla operativa

> Un conductor no puede pasar a **Disponible** ni recibir viajes mientras `identity_verification_status` sea distinto de `approved`.

La foto pública de perfil puede mostrarse al pasajero solo después de la aprobación. Las imágenes de licencia y la selfie de verificación no deben colocarse en `localStorage`, en repositorios, ni en URLs públicas. Deben subirse mediante el servidor a almacenamiento privado, guardar únicamente claves de objeto en base de datos y entregar acceso temporal solo a administradores autorizados.

## Datos a persistir

| Campo | Uso |
|---|---|
| `driver_profile_photo_key` | Imagen aprobada visible al pasajero. |
| `identity_selfie_key` | Selfie privada para revisión. |
| `license_front_key` | Documento privado. |
| `identity_consent_at` y `identity_consent_version` | Prueba del consentimiento específico. |
| `identity_verification_status` | Bloqueo operativo y estado de decisión. |
| `identity_reviewed_by`, `identity_reviewed_at`, `identity_review_note` | Auditoría de revisión humana. |
| `identity_resubmission_count` | Control de reintentos. |

## Implementación recomendada

La primera versión debe ser una revisión manual asistida: carga segura de archivos, validación de formato/tamaño, cola administrativa, control de acceso y decisión auditable. Una comparación biométrica automatizada solo se debe añadir tras una evaluación legal, política de retención, aviso de privacidad, consentimiento explícito, procedimiento de apelación y proveedor especializado. Un resultado automatizado nunca debe ser la única causa de rechazo.

## Próximo cambio técnico

La siguiente implementación agrega tablas de perfil y revisión, carga a almacenamiento privado desde el servidor, una pantalla obligatoria de verificación para conductores y una cola administrativa. Hasta completar esa infraestructura, el panel actual debe seguir mostrando la verificación como requisito pendiente y no simular coincidencias de identidad.
