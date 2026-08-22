import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * WhatsApp Taxi SaaS — Complete Database Schema
 * Includes: Users, Clients, Drivers, Vehicles, Trips, Payments, Ratings
 */

// ===== USERS (Base Auth) =====
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "client", "driver", "dispatcher"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== CLIENTS (Taxi Customers) =====
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  profileImage: text("profileImage"),
  homeAddress: text("homeAddress"),
  workAddress: text("workAddress"),
  preferredPaymentMethod: mysqlEnum("preferredPaymentMethod", ["cash", "card", "paypal", "stripe"]).default("cash"),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("5.00"),
  totalTrips: int("totalTrips").default(0),
  walletBalance: decimal("walletBalance", { precision: 10, scale: 2 }).default("0.00"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ===== DRIVERS (Taxi Drivers) =====
export const drivers = mysqlTable("drivers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  profileImage: text("profileImage"),
  licenseNumber: varchar("licenseNumber", { length: 50 }).notNull().unique(),
  licenseExpiry: timestamp("licenseExpiry"),
  licenseDocument: text("licenseDocument"),
  identityVerificationStatus: mysqlEnum("identityVerificationStatus", ["unsubmitted", "pending_review", "approved", "resubmission_required", "rejected"]).default("unsubmitted").notNull(),
  identitySubmittedAt: timestamp("identitySubmittedAt"),
  identityReviewedAt: timestamp("identityReviewedAt"),
  identityReviewedBy: int("identityReviewedBy"),
  identityReviewNote: text("identityReviewNote"),
  identityResubmissionCount: int("identityResubmissionCount").default(0).notNull(),
  identityConsentAt: timestamp("identityConsentAt"),
  identityConsentVersion: varchar("identityConsentVersion", { length: 32 }),
  insuranceDocument: text("insuranceDocument"),
  status: mysqlEnum("status", ["active", "inactive", "suspended", "pending"]).default("pending"),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("5.00"),
  totalTrips: int("totalTrips").default(0),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0.00"),
  bankAccountHolder: varchar("bankAccountHolder", { length: 100 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }),
  bankRoutingNumber: varchar("bankRoutingNumber", { length: 20 }),
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  currentLocation: json("currentLocation"), // { lat, lng }
  isOnline: boolean("isOnline").default(false),
  currentTrip: int("currentTrip"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

// ===== DRIVER IDENTITY SUBMISSIONS (Private evidence; never exposed to passengers) =====
export const driverIdentitySubmissions = mysqlTable("driverIdentitySubmissions", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  profilePhotoKey: text("profilePhotoKey").notNull(),
  selfieKey: text("selfieKey").notNull(),
  licenseFrontKey: text("licenseFrontKey").notNull(),
  status: mysqlEnum("status", ["pending_review", "approved", "resubmission_required", "rejected"]).default("pending_review").notNull(),
  consentAt: timestamp("consentAt").notNull(),
  consentVersion: varchar("consentVersion", { length: 32 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("driverIdentitySubmissions_driver_idx").on(table.driverId),
  index("driverIdentitySubmissions_status_submitted_idx").on(table.status, table.submittedAt),
]);

export type DriverIdentitySubmission = typeof driverIdentitySubmissions.$inferSelect;
export type InsertDriverIdentitySubmission = typeof driverIdentitySubmissions.$inferInsert;

// ===== DRIVER DIRECT PAYMENT METHODS (No platform collection of ride funds) =====
export const driverDirectPaymentMethods = mysqlTable("driverDirectPaymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  method: mysqlEnum("method", ["cash", "zelle", "cash_app", "paypal", "transfer"]).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  publicLabel: varchar("publicLabel", { length: 120 }),
  privateAccountKey: text("privateAccountKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("driverDirectPaymentMethods_driver_enabled_idx").on(table.driverId, table.enabled),
]);

export type DriverDirectPaymentMethod = typeof driverDirectPaymentMethods.$inferSelect;
export type InsertDriverDirectPaymentMethod = typeof driverDirectPaymentMethods.$inferInsert;

// ===== DRIVER PRESENCE (Last known, shared dispatcher snapshot) =====
export const driverPresenceSnapshots = mysqlTable("driverPresenceSnapshots", {
  driverId: int("driverId").primaryKey(),
  status: mysqlEnum("status", ["offline", "online", "away", "on_trip"]).default("offline").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  heading: decimal("heading", { precision: 6, scale: 2 }),
  activeTripId: int("activeTripId"),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("driverPresenceSnapshots_status_seen_idx").on(table.status, table.lastSeenAt),
]);

export type DriverPresenceSnapshot = typeof driverPresenceSnapshots.$inferSelect;

// ===== VEHICLES (Taxi Fleet) =====
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  licensePlate: varchar("licensePlate", { length: 20 }).notNull().unique(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year"),
  color: varchar("color", { length: 50 }),
  vin: varchar("vin", { length: 50 }).unique(),
  registrationDocument: text("registrationDocument"),
  insuranceDocument: text("insuranceDocument"),
  inspectionDocument: text("inspectionDocument"),
  seats: int("seats").default(4),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ===== TRIPS (Taxi Rides) =====
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  driverId: int("driverId"),
  vehicleId: int("vehicleId"),
  pickupLocation: text("pickupLocation").notNull(),
  pickupLatLng: json("pickupLatLng").notNull(), // { lat, lng }
  dropoffLocation: text("dropoffLocation").notNull(),
  dropoffLatLng: json("dropoffLatLng").notNull(), // { lat, lng }
  distance: decimal("distance", { precision: 8, scale: 2 }), // in km
  duration: int("duration"), // in minutes
  status: mysqlEnum("status", ["requested", "choosing_driver", "awaiting_driver", "driver_declined", "searching", "accepted", "in_progress", "completed", "cancelled", "expired"]).default("requested"),
  assignmentMode: mysqlEnum("assignmentMode", ["manual", "autosearch", "dispatcher"]).default("manual").notNull(),
  selectedDriverId: int("selectedDriverId"),
  assignedByUserId: int("assignedByUserId"),
  responseDeadlineAt: timestamp("responseDeadlineAt"),
  autoSearchStartedAt: timestamp("autoSearchStartedAt"),
  fare: decimal("fare", { precision: 10, scale: 2 }).notNull(),
  paymentModel: mysqlEnum("paymentModel", ["direct_to_driver", "platform_collection"]).default("direct_to_driver").notNull(),
  directPaymentMethod: mysqlEnum("directPaymentMethod", ["cash", "zelle", "cash_app", "paypal", "transfer"]),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "paypal", "stripe"]).default("cash"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

// ===== TRIP OFFERS (Manual selection, dispatcher offer and Autobúsqueda) =====
export const tripDriverOffers = mysqlTable("tripDriverOffers", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  driverId: int("driverId").notNull(),
  offeredByUserId: int("offeredByUserId"),
  offeredByRole: mysqlEnum("offeredByRole", ["client", "dispatcher", "system"]).notNull(),
  mode: mysqlEnum("mode", ["manual", "autosearch", "dispatcher"]).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "expired", "withdrawn"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  respondedAt: timestamp("respondedAt"),
  declineReason: text("declineReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("tripDriverOffers_trip_status_idx").on(table.tripId, table.status),
  index("tripDriverOffers_driver_status_idx").on(table.driverId, table.status),
]);

export type TripDriverOffer = typeof tripDriverOffers.$inferSelect;

// ===== TRIP OPERATION EVENTS (Immutable dispatcher / lifecycle audit) =====
export const tripOperationEvents = mysqlTable("tripOperationEvents", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  actorUserId: int("actorUserId"),
  actorRole: mysqlEnum("actorRole", ["client", "driver", "dispatcher", "admin", "system"]).notNull(),
  eventType: mysqlEnum("eventType", ["trip_requested", "driver_selected", "offer_created", "offer_accepted", "offer_declined", "offer_expired", "autosearch_started", "dispatcher_assigned", "trip_cancelled", "dispatcher_note", "realtime_message", "notification_requested"]).notNull(),
  detail: json("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("tripOperationEvents_trip_created_idx").on(table.tripId, table.createdAt),
  index("tripOperationEvents_actor_created_idx").on(table.actorUserId, table.createdAt),
]);

export type TripOperationEvent = typeof tripOperationEvents.$inferSelect;

// ===== RATINGS (Trip Ratings) =====
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull().unique(),
  clientId: int("clientId").notNull(),
  driverId: int("driverId").notNull(),
  clientRating: int("clientRating"), // 1-5 stars
  clientComment: text("clientComment"),
  driverRating: int("driverRating"), // 1-5 stars
  driverComment: text("driverComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

// ===== PAYMENTS (Payment History) =====
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  clientId: int("clientId").notNull(),
  driverId: int("driverId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "paypal", "stripe"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paypalTransactionId: varchar("paypalTransactionId", { length: 255 }),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  driverEarnings: decimal("driverEarnings", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ===== PRICING RULES (Fare Configuration) =====
export const pricingRules = mysqlTable("pricingRules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  baseFare: decimal("baseFare", { precision: 10, scale: 2 }).notNull(),
  costPerKm: decimal("costPerKm", { precision: 10, scale: 2 }).notNull(),
  costPerMinute: decimal("costPerMinute", { precision: 10, scale: 2 }).notNull(),
  minimumFare: decimal("minimumFare", { precision: 10, scale: 2 }).notNull(),
  nightSurgePercentage: decimal("nightSurgePercentage", { precision: 5, scale: 2 }).default("0.00"),
  peakHourSurgePercentage: decimal("peakHourSurgePercentage", { precision: 5, scale: 2 }).default("0.00"),
  holidaySurgePercentage: decimal("holidaySurgePercentage", { precision: 5, scale: 2 }).default("0.00"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;

// ===== SUBSCRIPTIONS (SaaS Plans) =====
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  planName: mysqlEnum("planName", ["basic", "pro", "enterprise"]).notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  maxTripsPerMonth: int("maxTripsPerMonth"),
  maxDrivers: int("maxDrivers"),
  features: json("features"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ===== COMPANY SUBSCRIPTIONS (Tenant Subscriptions) =====
export const companySubscriptions = mysqlTable("companySubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  subscriptionId: int("subscriptionId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  paypalSubscriptionId: varchar("paypalSubscriptionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "cancelled", "suspended", "expired"]).default("active"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySubscription = typeof companySubscriptions.$inferSelect;
export type InsertCompanySubscription = typeof companySubscriptions.$inferInsert;

// ===== SITE SETTINGS (Admin Editor Config) =====
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ===== CONTACT MESSAGES (Landing Page Form) =====
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 200 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["unread", "read", "replied", "archived"]).default("unread").notNull(),
  adminNotes: text("adminNotes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
