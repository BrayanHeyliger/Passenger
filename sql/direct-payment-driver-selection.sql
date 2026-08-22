-- UnPasajero.Com
-- Migración de referencia: pago directo y selección manual de conductor.
-- MySQL 8.4 / InnoDB. Ejecutar mediante migración revisada; no aplicar en producción sin backup y staging.

START TRANSACTION;

ALTER TABLE drivers
  ADD COLUMN verification_status ENUM('unverified', 'pending', 'verified', 'suspended') NOT NULL DEFAULT 'unverified' AFTER status,
  ADD COLUMN service_radius_miles DECIMAL(5,2) NOT NULL DEFAULT 12.00 AFTER verification_status,
  ADD COLUMN public_profile_enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER service_radius_miles;

ALTER TABLE trips
  ADD COLUMN selection_mode ENUM('manual', 'auto_search') NOT NULL DEFAULT 'manual' AFTER driverId,
  ADD COLUMN assignment_state ENUM('choosing_driver', 'awaiting_driver', 'accepted', 'manual_declined', 'auto_searching', 'cancelled', 'expired') NOT NULL DEFAULT 'choosing_driver' AFTER selection_mode,
  ADD COLUMN selected_driver_id INT NULL AFTER assignment_state,
  ADD COLUMN selection_expires_at TIMESTAMP NULL AFTER selected_driver_id,
  ADD COLUMN auto_search_reason ENUM('driver_declined', 'offer_expired') NULL AFTER selection_expires_at,
  ADD COLUMN selection_version INT NOT NULL DEFAULT 0 AFTER auto_search_reason,
  ADD KEY idx_trips_client_assignment (clientId, assignment_state, requestedAt),
  ADD KEY idx_trips_driver_status (driverId, status, requestedAt),
  ADD CONSTRAINT fk_trips_selected_driver
    FOREIGN KEY (selected_driver_id) REFERENCES drivers(id)
    ON DELETE SET NULL;

CREATE TABLE driver_payment_methods (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  driver_id INT NOT NULL,
  method ENUM('cash', 'zelle', 'cash_app', 'paypal', 'bank_transfer') NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  disclose_at ENUM('offer', 'accepted', 'arrival') NOT NULL DEFAULT 'accepted',
  handle_ciphertext VARBINARY(1024) NULL,
  handle_key_version VARCHAR(32) NULL,
  handle_hint VARCHAR(64) NULL,
  verification_status ENUM('self_declared', 'reviewed', 'disabled') NOT NULL DEFAULT 'self_declared',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_driver_payment_method (driver_id, method),
  KEY idx_driver_payment_visible (driver_id, enabled, disclose_at),
  CONSTRAINT fk_driver_payment_methods_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE driver_presence (
  driver_id INT NOT NULL,
  availability ENUM('offline', 'online', 'paused', 'busy') NOT NULL DEFAULT 'offline',
  location POINT NOT NULL SRID 4326,
  accuracy_meters DECIMAL(7,2) NULL,
  heading_degrees DECIMAL(6,2) NULL,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (driver_id),
  KEY idx_presence_online_recent (availability, last_seen_at),
  SPATIAL INDEX spx_presence_location (location),
  CONSTRAINT fk_driver_presence_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trip_driver_offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id INT NOT NULL,
  driver_id INT NOT NULL,
  offer_sequence SMALLINT UNSIGNED NOT NULL,
  source ENUM('manual', 'auto_search') NOT NULL,
  status ENUM('pending', 'seen', 'accepted', 'declined', 'expired', 'cancelled', 'skipped') NOT NULL DEFAULT 'pending',
  asked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  responded_at TIMESTAMP NULL,
  response_reason VARCHAR(255) NULL,
  active_offer_guard TINYINT GENERATED ALWAYS AS (
    CASE WHEN status IN ('pending', 'seen') THEN 1 ELSE NULL END
  ) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_trip_offer_sequence (trip_id, offer_sequence),
  UNIQUE KEY uq_trip_one_active_offer (trip_id, active_offer_guard),
  KEY idx_offer_driver_inbox (driver_id, status, expires_at),
  KEY idx_offer_trip_status (trip_id, status, asked_at),
  CONSTRAINT fk_trip_driver_offers_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_driver_offers_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trip_selection_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trip_id INT NOT NULL,
  offer_id BIGINT UNSIGNED NULL,
  actor_type ENUM('client', 'driver', 'system', 'admin') NOT NULL,
  actor_user_id INT NULL,
  event_type ENUM('candidate_listed', 'driver_selected', 'offer_sent', 'offer_seen', 'offer_accepted', 'offer_declined', 'offer_expired', 'auto_search_started', 'auto_candidate_recommended', 'trip_cancelled') NOT NULL,
  metadata JSON NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_selection_event_trip_time (trip_id, occurred_at),
  KEY idx_selection_event_offer_time (offer_id, occurred_at),
  CONSTRAINT fk_selection_events_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_selection_events_offer
    FOREIGN KEY (offer_id) REFERENCES trip_driver_offers(id) ON DELETE SET NULL,
  CONSTRAINT fk_selection_events_actor
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trip_direct_payment_confirmations (
  trip_id INT NOT NULL,
  selected_method ENUM('cash', 'zelle', 'cash_app', 'paypal', 'bank_transfer') NULL,
  confirmation_status ENUM('not_recorded', 'passenger_declared', 'driver_acknowledged', 'disputed') NOT NULL DEFAULT 'not_recorded',
  passenger_acknowledged_at TIMESTAMP NULL,
  driver_acknowledged_at TIMESTAMP NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (trip_id),
  CONSTRAINT fk_direct_payment_confirmation_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

-- No usar la tabla `payments` para pagos del pasajero al conductor.
-- Debe quedar reservada para facturación SaaS de empresas, o migrarse y retirarse tras auditoría.
