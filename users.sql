-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 25, 2025 at 03:51 PM
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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `family_id` (`family_id`);

--
-- Constraints for dumped tables
--

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
