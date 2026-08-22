CREATE TABLE `driverIdentitySubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`profilePhotoKey` text NOT NULL,
	`selfieKey` text NOT NULL,
	`licenseFrontKey` text NOT NULL,
	`status` enum('pending_review','approved','resubmission_required','rejected') NOT NULL DEFAULT 'pending_review',
	`consentAt` timestamp NOT NULL,
	`consentVersion` varchar(32) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverIdentitySubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityVerificationStatus` enum('unsubmitted','pending_review','approved','resubmission_required','rejected') DEFAULT 'unsubmitted' NOT NULL;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identitySubmittedAt` timestamp;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityReviewedAt` timestamp;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityReviewedBy` int;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityReviewNote` text;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityResubmissionCount` int DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityConsentAt` timestamp;
--> statement-breakpoint
ALTER TABLE `drivers` ADD `identityConsentVersion` varchar(32);
