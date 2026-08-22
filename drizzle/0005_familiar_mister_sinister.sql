CREATE TABLE `driverDirectPaymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`method` enum('cash','zelle','cash_app','paypal','transfer') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`publicLabel` varchar(120),
	`privateAccountKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverDirectPaymentMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverPresenceSnapshots` (
	`driverId` int NOT NULL,
	`status` enum('offline','online','away','on_trip') NOT NULL DEFAULT 'offline',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`heading` decimal(6,2),
	`activeTripId` int,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverPresenceSnapshots_driverId` PRIMARY KEY(`driverId`)
);
--> statement-breakpoint
CREATE TABLE `tripDriverOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`driverId` int NOT NULL,
	`offeredByUserId` int,
	`offeredByRole` enum('client','dispatcher','system') NOT NULL,
	`mode` enum('manual','autosearch','dispatcher') NOT NULL,
	`status` enum('pending','accepted','declined','expired','withdrawn') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`respondedAt` timestamp,
	`declineReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripDriverOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripOperationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`actorUserId` int,
	`actorRole` enum('client','driver','dispatcher','admin','system') NOT NULL,
	`eventType` enum('trip_requested','driver_selected','offer_created','offer_accepted','offer_declined','offer_expired','autosearch_started','dispatcher_assigned','trip_cancelled','dispatcher_note','realtime_message','notification_requested') NOT NULL,
	`detail` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripOperationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trips` MODIFY COLUMN `status` enum('requested','choosing_driver','awaiting_driver','driver_declined','searching','accepted','in_progress','completed','cancelled','expired') DEFAULT 'requested';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','client','driver','dispatcher') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `trips` ADD `assignmentMode` enum('manual','autosearch','dispatcher') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `selectedDriverId` int;--> statement-breakpoint
ALTER TABLE `trips` ADD `assignedByUserId` int;--> statement-breakpoint
ALTER TABLE `trips` ADD `responseDeadlineAt` timestamp;--> statement-breakpoint
ALTER TABLE `trips` ADD `autoSearchStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `trips` ADD `paymentModel` enum('direct_to_driver','platform_collection') DEFAULT 'direct_to_driver' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `directPaymentMethod` enum('cash','zelle','cash_app','paypal','transfer');--> statement-breakpoint
CREATE INDEX `driverDirectPaymentMethods_driver_enabled_idx` ON `driverDirectPaymentMethods` (`driverId`,`enabled`);--> statement-breakpoint
CREATE INDEX `driverPresenceSnapshots_status_seen_idx` ON `driverPresenceSnapshots` (`status`,`lastSeenAt`);--> statement-breakpoint
CREATE INDEX `tripDriverOffers_trip_status_idx` ON `tripDriverOffers` (`tripId`,`status`);--> statement-breakpoint
CREATE INDEX `tripDriverOffers_driver_status_idx` ON `tripDriverOffers` (`driverId`,`status`);--> statement-breakpoint
CREATE INDEX `tripOperationEvents_trip_created_idx` ON `tripOperationEvents` (`tripId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `tripOperationEvents_actor_created_idx` ON `tripOperationEvents` (`actorUserId`,`createdAt`);