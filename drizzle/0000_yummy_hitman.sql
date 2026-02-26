CREATE TABLE `domain_order` (
	`position` integer PRIMARY KEY NOT NULL,
	`zone_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`host` text,
	`provider` text,
	`region` text,
	`panel_url` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`probe_uuid` text,
	`cpu_name` text,
	`cpu_cores` integer,
	`os` text,
	`arch` text,
	`mem_total` integer,
	`disk_total` integer,
	`price` real,
	`billing_cycle` text,
	`currency` text,
	`expired_at` text,
	`sort_order` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`server_id` text,
	`proxy_server_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`deployment_type` text DEFAULT 'other' NOT NULL,
	`repo_url` text,
	`github` text,
	`urls` text DEFAULT '[]' NOT NULL,
	`management_urls` text DEFAULT '[]' NOT NULL,
	`healthcheck_url` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`monitor_id` integer,
	`monitor_group` text,
	`proxy` text,
	`docker` text,
	`vercel` text,
	`sort_order` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
