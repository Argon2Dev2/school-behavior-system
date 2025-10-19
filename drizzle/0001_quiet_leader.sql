CREATE TABLE `academic_years` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `academic_years_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `action_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`severity` enum('minor','moderate','severe') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `action_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`details` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disciplinary_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`actionTypeId` int NOT NULL,
	`violationId` int,
	`date` datetime NOT NULL,
	`description` text,
	`documentUrl` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `disciplinary_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`level` int NOT NULL,
	`academicYearId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guardian_communications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`date` datetime NOT NULL,
	`method` enum('phone','meeting','letter','other') NOT NULL,
	`subject` varchar(300) NOT NULL,
	`notes` text NOT NULL,
	`followUpRequired` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `guardian_communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `improvement_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`goals` text,
	`progress` text,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `improvement_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`type` enum('violation_alert','plan_update','general') NOT NULL,
	`title` varchar(300) NOT NULL,
	`message` text NOT NULL,
	`relatedStudentId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plan_follow_ups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`date` datetime NOT NULL,
	`notes` text NOT NULL,
	`rating` int,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `plan_follow_ups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`gradeId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentNumber` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`gradeId` int NOT NULL,
	`sectionId` int NOT NULL,
	`academicYearId` int NOT NULL,
	`guardianName` varchar(200),
	`guardianPhone` varchar(50),
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentNumber_unique` UNIQUE(`studentNumber`)
);
--> statement-breakpoint
CREATE TABLE `violation_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`severity` enum('minor','moderate','severe') NOT NULL,
	`points` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `violation_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `violations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`violationTypeId` int NOT NULL,
	`date` datetime NOT NULL,
	`location` varchar(200),
	`description` text,
	`points` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`createdBy` varchar(64) NOT NULL,
	CONSTRAINT `violations_id` PRIMARY KEY(`id`)
);
