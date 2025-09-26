-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 25, 2025 at 03:54 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ashram_receipts`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_types`
--

CREATE TABLE `booking_types` (
  `id` char(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` char(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields`
--

CREATE TABLE `custom_fields` (
  `id` char(36) NOT NULL,
  `label` varchar(128) NOT NULL,
  `type` enum('text','checkbox','radio','dropdown','number','date') NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_field_options`
--

CREATE TABLE `custom_field_options` (
  `id` char(36) NOT NULL,
  `field_id` char(36) NOT NULL,
  `label` varchar(128) NOT NULL,
  `value` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `families`
--

CREATE TABLE `families` (
  `id` char(36) NOT NULL,
  `primary_user_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `families`
--

INSERT INTO `families` (`id`, `primary_user_id`, `created_at`) VALUES
('008696cd-ca91-4634-9cc0-2eabf621ea49', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:09:59'),
('0089f292-7f1b-4516-8c8b-0e911ddde4ad', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:19:11'),
('12c0fbeb-f05c-46e4-887a-662a54f1ae51', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:03:42'),
('30c4ff6c-73bd-44ce-b068-44eb987def7e', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:03:57'),
('363dd768-7dd8-4e0f-887f-1d4ce503f8e6', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 16:28:43'),
('661c21c4-972d-4115-a0cf-5d1e0b0f6536', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 16:07:52'),
('6d5fe308-3f63-4e40-a8e7-a41a47c294b1', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:15:02'),
('6f57552f-ba93-4d96-8303-90aee6c2ce19', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:22:30'),
('7353c895-94a2-4476-8bb7-c02030a2edef', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-25 13:38:57'),
('75531fdd-bd99-4ea2-aefd-c03939c77461', '916046cc-55ea-4f38-ae7d-63c91ed31533', '2025-07-24 13:55:15'),
('94d8c3cf-808e-4a08-948f-db5c3f19b901', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-25 13:38:39'),
('981ae3af-9c3b-4205-b65e-9398c9d4cfae', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:09:49'),
('9e727504-b3f1-4477-b306-ebf2406e784a', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:14:36'),
('b2d25262-ffde-48f5-9d15-3b138762eff4', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:15:28'),
('b7b0f933-2c6a-4c82-8c72-ee83d737314e', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 16:04:27'),
('bf470270-7dc9-4183-9214-52ae61854127', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-25 13:29:36'),
('c2d7b27e-5ca0-4853-b851-4e3634a6f753', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:29:32'),
('c4fac157-f2ba-45d9-ad79-9035895034e0', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:21:59'),
('c503c8bb-2641-4b69-b661-814ceb8730ae', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:26:38'),
('d32304c2-37d5-4921-8d4f-0763f50ddcb7', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:31:52'),
('e1ee006f-96b0-4f67-83f1-15311764ddc4', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-25 13:38:26'),
('e4067436-4da9-402b-bf52-3332ebeb747d', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-25 13:37:38'),
('f097f226-e9f6-4720-b41c-21109cc34e25', '42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', '2025-07-24 15:37:17');

-- --------------------------------------------------------

--
-- Table structure for table `payment_config`
--

CREATE TABLE `payment_config` (
  `id` int(11) NOT NULL,
  `gateway` varchar(32) NOT NULL,
  `key_id` varchar(128) NOT NULL,
  `key_secret` varchar(128) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_config`
--

INSERT INTO `payment_config` (`id`, `gateway`, `key_id`, `key_secret`, `enabled`) VALUES
(2, 'razorpay', 'rzp_test_RYt7nO0hsl4EtZ', '2jWEkMooc77S4FSB4fHKXfTE', 1);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `serial` int(11) NOT NULL,
  `id` char(36) NOT NULL,
  `receipt_number` varchar(32) NOT NULL,
  `donor_name` varchar(128) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `payment_method` enum('Cash','Card','UPI','Cheque') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT NULL,
  `qr_code_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `star` varchar(32) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `family_member_id` char(36) DEFAULT NULL,
  `branch_id` char(36) DEFAULT NULL,
  `booking_type_id` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`serial`, `id`, `receipt_number`, `donor_name`, `amount`, `date`, `payment_method`, `remarks`, `created_by`, `payment_status`, `qr_code_data`, `created_at`, `star`, `dob`, `family_member_id`, `branch_id`, `booking_type_id`) VALUES
(1, '81bed181-e1f1-4bff-b110-4be8649dc20d', '231', 'Keerthanan', 50000.00, '2025-07-23', 'UPI', 'Annadhanam', '04a295a8-2290-4815-bea3-59be670ca9c1', 'paid', '', '2025-07-23 20:06:43', NULL, NULL, NULL, NULL, NULL),
(2, 'db5e4dac-cf23-49dc-9b08-bb870f6c0227', '123', 'Test', 222.00, '2025-07-23', 'Cash', 'Test', '2f791159-2200-4598-b292-84a1eb9cb83e', 'paid', 'data:image/png;base64,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', '2025-07-23 21:09:26', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `receipt_custom_fields`
--

CREATE TABLE `receipt_custom_fields` (
  `id` char(36) NOT NULL,
  `receipt_id` char(36) NOT NULL,
  `field_id` char(36) NOT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `active_theme_id` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `active_theme_id`) VALUES
(1, '806d2583-25d9-4162-991e-d5bbaebd94f5');

-- --------------------------------------------------------

--
-- Table structure for table `themes`
--

CREATE TABLE `themes` (
  `id` char(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `primary_color` varchar(7) NOT NULL,
  `accent_color` varchar(7) NOT NULL,
  `pink_color` varchar(7) NOT NULL,
  `light_color` varchar(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `themes`
--

INSERT INTO `themes` (`id`, `name`, `primary_color`, `accent_color`, `pink_color`, `light_color`) VALUES
('29babe67-186f-43bf-b6aa-b77701cf854d', 'Green', '#27534a', '#377159', '#8eb26f', '#dde172'),
('806d2583-25d9-4162-991e-d5bbaebd94f5', 'Vintage', '#004131', '#329883', '#dbd1ac', '#fefae7'),
('87dd4c88-9649-4e5d-963f-ae34020cee5b', 'Sunset', '#ff7081', '#c86a83', '#715979', '#355a7b'),
('9735988f-a717-4098-a53a-e97617ee0d1b', 'Retro', '#f5f7f8', '#f2d143', '#455e57', '#45474b'),
('abfa5339-c83b-494c-8c51-a2a056902549', 'Sage', '#7d9b92', '#a1c2aa', '#ced9c0', '#edf0e1'),
('d3188a7c-cdb9-440b-b91b-2de9d215e875', 'Summer', '#007f9b', '#faf9df', '#fddb43', '#d2b24b');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` char(36) NOT NULL,
  `type` enum('staff','support') NOT NULL,
  `created_by` char(36) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `sender_id` char(36) NOT NULL,
  `sender_role` enum('admin','staff','public') NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','staff','public') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(128) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `family_id` char(36) DEFAULT NULL,
  `star` varchar(32) DEFAULT NULL,
  `dob` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `created_at`, `name`, `phone`, `email`, `address`, `family_id`, `star`, `dob`) VALUES
('04a295a8-2290-4815-bea3-59be670ca9c1', 'public', '$2b$08$yct.fb8S4B9s4klik0b/nuHVlNNLLrV1XhyeEifHwC9wRPqa39a0W', 'public', '2025-07-23 20:02:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0668c4bc-cb1c-4232-bffa-0e806f4741db', 'testfammem1@test.com', '$2b$08$7vrHRsuqeUSVNQFh5BsGg.LfA6btXn/887OeLRfG1FkbNKowL/zOC', 'public', '2025-07-24 13:55:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('19a32a12-a27b-487f-8cb3-1c8d64504f43', 'staff', '$2b$08$EDIBB3zz1/FCyCnGKATSDe1yim5FFGQi/GT23gy6ngfSmxd.lXAEm', 'staff', '2025-07-23 20:02:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('2e719015-cc60-445a-a9e1-94d162aae0a1', 'root@example.com', '$2b$08$lb8rZVpJQvGO8OmHW7J5Jegl3RczZf7k9VYz2VkOLLSt/aphuYiU.', 'admin', '2025-07-23 20:01:53', NULL, NULL, 'root@example.com', NULL, NULL, NULL, NULL),
('2f791159-2200-4598-b292-84a1eb9cb83e', 'admin', '$2b$08$HTNfx1K/4GUQOU8uIPRFx.zqLaDQmEpou9nmRNcUth8tee0m6XQUO', 'admin', '2025-07-23 19:59:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('39fbd124-86e3-4679-966c-ed6609441935', 'test526@test.com', '$2b$08$y7MRSEwRvoWFR4MTfP27peucVgpDBGCbm.thQ8ylVIYbY5ZLdzitu', 'public', '2025-07-24 15:22:31', 'test', '1231287281', 'test526@test.com', NULL, '6f57552f-ba93-4d96-8303-90aee6c2ce19', 'star', '2123-03-12'),
('42e7bf7e-6383-4f48-9981-6c8f8b31c8bd', 'test4@test.com', '$2b$08$xLAOaXdbFA3wO7wnTMcrpelTRy9NehiXSL5.N4cB8hYZFKFZSUamK', 'public', '2025-07-24 14:17:17', 'test 4', '6754567898', 'test4@test.com', 'test', '7353c895-94a2-4476-8bb7-c02030a2edef', NULL, NULL),
('5a75642c-3870-4edd-8a96-cd3dcb2aa421', 'test23@test4.com', '$2b$08$gqjLlSjNQ11srg8RKtjD6ezaockAY61zKACfMILQcVYJKO9svgx.C', 'public', '2025-07-24 15:22:00', 'test', '4627227326', 'test23@test4.com', NULL, 'c4fac157-f2ba-45d9-ad79-9035895034e0', 'star', '1988-12-21'),
('619b9536-2a4a-41bf-83a4-a4309b983be2', 'keerthanan@tutanota.de', '$2b$08$wP7WyLvh1zMesSBRbMBrm.5RQqSmHbUOBG0avDEc6KqRWvY0T3Ve2', 'staff', '2025-07-23 22:37:12', 'Keerthanan', '7907795883', 'keerthanan@tutanota.de', 'Savitham, Pulikkakonam, Santhigiri PO, Poolanthara, Pothencode, Thiruvananthapuram', NULL, NULL, NULL),
('668eda69-2f38-49b4-aa43-472deff39e1f', 'test2123@test.com', '$2b$08$zlxfWSw7A1pZBsi96IWgQupRf.AAY5XXzvcMdioRDbQWJpqJ/clY.', 'public', '2025-07-24 15:31:53', 'mem1', '1982345678', 'test2123@test.com', NULL, 'd32304c2-37d5-4921-8d4f-0763f50ddcb7', 'star1', '1988-02-12'),
('6f29d15f-4c76-44b6-bbc2-3a7b9d9d72a5', 'test2738@test332.com', '$2b$08$WjDtq8KBV1Yofncd.b6AiOjdWeWHw30Wrajq9VduqiScOv10N/9w2', 'public', '2025-07-24 15:37:18', 'test', '0987654321', 'test2738@test332.com', NULL, 'f097f226-e9f6-4720-b41c-21109cc34e25', 'star1', '1988-02-12'),
('7add4221-b67b-46ca-ae67-d13d92edbd4e', 'mem1@test4.com', '$2b$08$hYJnFs/ni31vPaSPs41EpuoT1Oll.yDbGwUQ5xBIM8SljT521UuEK', 'public', '2025-07-25 13:37:38', 'Mem 1', '7865748289', 'mem1@test4.com', NULL, 'e4067436-4da9-402b-bf52-3332ebeb747d', 'test', '2003-04-12'),
('7b3e623e-0dc8-4068-a144-a7ea50c11c5c', 'testuser3@test.com', '$2b$08$sWjXPuHxTYRDyghXGmgNj.3MO1/oZJf/tP2cvHx.rast09ftxQjtO', 'public', '2025-07-24 13:50:52', 'Test User 3', '3457867438', 'testuser3@test.com', 'test', NULL, NULL, NULL),
('7fc3cec4-e2ac-4406-b655-5dbd3ffd865f', 'test@example.com', '$2b$08$gsDp5Yrit4V41a3sa6f9BuJB2JOqGC1RsWSooW6Xdftg/ldPcGGBm', 'public', '2025-07-24 06:25:10', 'Test User', '0123456789', 'test@example.com', 'Test Address', NULL, NULL, NULL),
('80176f3d-d637-41ff-9925-8cd6fbf84f36', 'test12313@test12313.com', '$2b$08$aZXrJdJ02YMP7BQQTRDPtu0sdcdjKz2J.ln.UjGoOJaBWI9bRBWPm', 'public', '2025-07-24 16:04:28', 'mem1', '0987650987', 'test12313@test12313.com', NULL, 'b7b0f933-2c6a-4c82-8c72-ee83d737314e', 'star3', '1989-12-23'),
('916046cc-55ea-4f38-ae7d-63c91ed31533', 'test@test.com', '$2b$08$GChnfylWiNanRcV1lo5FiOmgCX78TZ4VhTigrdhm.hKXn/awDNvrG', 'public', '2025-07-24 12:51:12', 'Test User 2', '1234567890', 'test@test.com', 'Test Address 2', NULL, NULL, NULL),
('a5e9a591-19f1-4a99-b55d-a3819d0f1044', 'test234@test5.com', '$2b$08$1Qt7ZwWGHkBdzhEgfls.F.sFkhe5WzvvGGZ6jw.GbEF9CF3iwMuka', 'public', '2025-07-24 15:26:38', 'mem1', '0987654321', 'test234@test5.com', NULL, 'c503c8bb-2641-4b69-b661-814ceb8730ae', 'star1', '1988-02-12'),
('ae2bd86c-f1ce-4da7-9bc9-3677097f1aa9', 'test12313@test123.com', '$2b$08$eO3zDjYY8tEbuU.Sdx1.l.ITWZlgSN6fB2SZCQ0xPDWFH7/ZSLyPC', 'public', '2025-07-24 16:28:44', 'test', '0912345678', 'test12313@test123.com', NULL, '363dd768-7dd8-4e0f-887f-1d4ce503f8e6', 'star1', '1988-12-12'),
('b817b1c3-1c17-4067-870d-90ebca92e164', 'test@test432.com', '$2b$08$C/0VKAtHJCPc6DtowBiNZuAQvtHEC94wcGplxdelYrcnX.PPJvfeG', 'public', '2025-07-24 16:07:53', 'test ', '0987658983', 'test@test432.com', NULL, '661c21c4-972d-4115-a0cf-5d1e0b0f6536', 'asads', '1988-02-12'),
('ccd1f382-ccd1-4f04-97de-d5163b71342c', 'test4232@gmail.com', '$2b$08$Nc.I2nTfuGW.9xkXDu8Na.C3yfJwJ4wRBGKIQLo2V7W2IfQjPqhRK', 'public', '2025-07-25 13:29:36', 'test', '1232323439', 'test4232@gmail.com', NULL, 'bf470270-7dc9-4183-9214-52ae61854127', 'test', '1989-12-12'),
('d572edc1-f6c9-49a4-9a1f-78eb6c6ff3b6', 'test2345@test33.com', '$2b$08$35MPqjFW8.8YopC2iz2Bu.53oUYYeZP9zBhCMpE6eG05N.EkwHFNu', 'public', '2025-07-24 15:29:32', 'mem1', '1983198323', 'test2345@test33.com', NULL, 'c2d7b27e-5ca0-4853-b851-4e3634a6f753', 'star2', '1929-12-12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_types`
--
ALTER TABLE `booking_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_field_options`
--
ALTER TABLE `custom_field_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `field_id` (`field_id`);

--
-- Indexes for table `families`
--
ALTER TABLE `families`
  ADD PRIMARY KEY (`id`),
  ADD KEY `primary_user_id` (`primary_user_id`);

--
-- Indexes for table `payment_config`
--
ALTER TABLE `payment_config`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial` (`serial`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `family_member_id` (`family_member_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `booking_type_id` (`booking_type_id`);

--
-- Indexes for table `receipt_custom_fields`
--
ALTER TABLE `receipt_custom_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receipt_id` (`receipt_id`),
  ADD KEY `field_id` (`field_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `active_theme_id` (`active_theme_id`);

--
-- Indexes for table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `family_id` (`family_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `payment_config`
--
ALTER TABLE `payment_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `serial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `custom_field_options`
--
ALTER TABLE `custom_field_options`
  ADD CONSTRAINT `custom_field_options_ibfk_1` FOREIGN KEY (`field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `families`
--
ALTER TABLE `families`
  ADD CONSTRAINT `families_ibfk_1` FOREIGN KEY (`primary_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `receipts_ibfk_2` FOREIGN KEY (`family_member_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `receipts_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `receipts_ibfk_4` FOREIGN KEY (`booking_type_id`) REFERENCES `booking_types` (`id`);

--
-- Constraints for table `receipt_custom_fields`
--
ALTER TABLE `receipt_custom_fields`
  ADD CONSTRAINT `receipt_custom_fields_ibfk_1` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `receipt_custom_fields_ibfk_2` FOREIGN KEY (`field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`active_theme_id`) REFERENCES `themes` (`id`);

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD CONSTRAINT `ticket_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
