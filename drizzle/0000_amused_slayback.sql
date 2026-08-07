CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100),
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`profileImage` text,
	`homeAddress` text,
	`workAddress` text,
	`preferredPaymentMethod` enum('cash','card','paypal','stripe') DEFAULT 'cash',
	`averageRating` decimal(3,2) DEFAULT '5.00',
	`totalTrips` int DEFAULT 0,
	`walletBalance` decimal(10,2) DEFAULT '0.00',
	`stripeCustomerId` varchar(255),
	`paypalEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `companySubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`subscriptionId` int NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`paypalSubscriptionId` varchar(255),
	`status` enum('active','cancelled','suspended','expired') DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companySubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100),
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`profileImage` text,
	`licenseNumber` varchar(50) NOT NULL,
	`licenseExpiry` timestamp,
	`licenseDocument` text,
	`insuranceDocument` text,
	`status` enum('active','inactive','suspended','pending') DEFAULT 'pending',
	`averageRating` decimal(3,2) DEFAULT '5.00',
	`totalTrips` int DEFAULT 0,
	`totalEarnings` decimal(12,2) DEFAULT '0.00',
	`bankAccountHolder` varchar(100),
	`bankAccountNumber` varchar(50),
	`bankRoutingNumber` varchar(20),
	`stripeAccountId` varchar(255),
	`paypalEmail` varchar(320),
	`currentLocation` json,
	`isOnline` boolean DEFAULT false,
	`currentTrip` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `drivers_email_unique` UNIQUE(`email`),
	CONSTRAINT `drivers_licenseNumber_unique` UNIQUE(`licenseNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`clientId` int NOT NULL,
	`driverId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('cash','card','paypal','stripe') NOT NULL,
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`paypalTransactionId` varchar(255),
	`commission` decimal(10,2) DEFAULT '0.00',
	`driverEarnings` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`baseFare` decimal(10,2) NOT NULL,
	`costPerKm` decimal(10,2) NOT NULL,
	`costPerMinute` decimal(10,2) NOT NULL,
	`minimumFare` decimal(10,2) NOT NULL,
	`nightSurgePercentage` decimal(5,2) DEFAULT '0.00',
	`peakHourSurgePercentage` decimal(5,2) DEFAULT '0.00',
	`holidaySurgePercentage` decimal(5,2) DEFAULT '0.00',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`clientId` int NOT NULL,
	`driverId` int NOT NULL,
	`clientRating` int,
	`clientComment` text,
	`driverRating` int,
	`driverComment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratings_tripId_unique` UNIQUE(`tripId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planName` enum('basic','pro','enterprise') NOT NULL,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`maxTripsPerMonth` int,
	`maxDrivers` int,
	`features` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`driverId` int,
	`vehicleId` int,
	`pickupLocation` text NOT NULL,
	`pickupLatLng` json NOT NULL,
	`dropoffLocation` text NOT NULL,
	`dropoffLatLng` json NOT NULL,
	`distance` decimal(8,2),
	`duration` int,
	`status` enum('requested','accepted','in_progress','completed','cancelled') DEFAULT 'requested',
	`fare` decimal(10,2) NOT NULL,
	`paymentMethod` enum('cash','card','paypal','stripe') DEFAULT 'cash',
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(20),
	`loginMethod` varchar(64),
	`role` enum('user','admin','client','driver') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`licensePlate` varchar(20) NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int,
	`color` varchar(50),
	`vin` varchar(50),
	`registrationDocument` text,
	`insuranceDocument` text,
	`inspectionDocument` text,
	`seats` int DEFAULT 4,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_licensePlate_unique` UNIQUE(`licensePlate`),
	CONSTRAINT `vehicles_vin_unique` UNIQUE(`vin`)
);
