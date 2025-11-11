SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'cc6a46dd-594c-45fc-8906-d9cf3855a0b9', '{"action":"user_signedup","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-10 20:29:03.052408+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d8cbb28-237e-4937-8401-7333089c0220', '{"action":"login","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 20:29:03.054839+00', ''),
	('00000000-0000-0000-0000-000000000000', '30043ae3-8164-4ee2-9154-b019b8cc18c3', '{"action":"login","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 20:30:03.871156+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b4f0d8ee-7fe2-4c88-8e42-9a9d015c37c7', '{"action":"logout","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-10 20:30:08.730941+00', ''),
	('00000000-0000-0000-0000-000000000000', '027c663c-0cff-4b55-b757-581a5ad7220c', '{"action":"user_signedup","actor_id":"3592c60c-6c56-41e5-8c4e-5fe547dee908","actor_username":"stephen@clemenger.io","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-10 20:31:02.281146+00', ''),
	('00000000-0000-0000-0000-000000000000', '428f349a-4f2c-402e-9cf8-61f82053b427', '{"action":"login","actor_id":"3592c60c-6c56-41e5-8c4e-5fe547dee908","actor_username":"stephen@clemenger.io","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 20:31:02.282686+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e809301-1a9b-434c-8a0a-d327c8f76fc9', '{"action":"logout","actor_id":"3592c60c-6c56-41e5-8c4e-5fe547dee908","actor_username":"stephen@clemenger.io","actor_via_sso":false,"log_type":"account"}', '2025-11-10 21:17:03.101824+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5283f8a-e213-42ce-b8d2-1e4d5c46c672', '{"action":"login","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 21:17:14.692067+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5fd3f5d-dce9-45ee-9eab-3a2b447c642d', '{"action":"logout","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-10 21:19:52.508688+00', ''),
	('00000000-0000-0000-0000-000000000000', '75549d02-e851-4904-9899-3b33c5b08b11', '{"action":"user_signedup","actor_id":"63cfe4af-dba5-4824-af66-1c9a1b7546be","actor_username":"neil@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-10 21:21:58.531783+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a40d2fc-226b-41a7-bf73-2989378bc8d7', '{"action":"login","actor_id":"63cfe4af-dba5-4824-af66-1c9a1b7546be","actor_username":"neil@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 21:21:58.533553+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c9c1c6b-be4a-4c40-b6f7-0e3a763dda51', '{"action":"logout","actor_id":"63cfe4af-dba5-4824-af66-1c9a1b7546be","actor_username":"neil@example.com","actor_via_sso":false,"log_type":"account"}', '2025-11-10 21:29:05.271465+00', ''),
	('00000000-0000-0000-0000-000000000000', '661c4890-2e7d-4076-83a9-480c909c88a5', '{"action":"login","actor_id":"5097c61c-6414-4878-92ed-467b60844fbb","actor_username":"grjeff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 21:29:14.639789+00', ''),
	('00000000-0000-0000-0000-000000000000', '43d943f1-345e-477c-884a-8ac71087cf1b', '{"action":"user_signedup","actor_id":"a5d74a2f-f592-49c8-8dee-b2e134cc8881","actor_username":"ford@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-10 22:29:00.273286+00', ''),
	('00000000-0000-0000-0000-000000000000', '87346b6f-e419-4164-a9ca-ab945f7072d0', '{"action":"login","actor_id":"a5d74a2f-f592-49c8-8dee-b2e134cc8881","actor_username":"ford@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 22:29:00.274759+00', ''),
	('00000000-0000-0000-0000-000000000000', '696d65ee-289b-4d95-8d6b-ea8175cc1d01', '{"action":"logout","actor_id":"a5d74a2f-f592-49c8-8dee-b2e134cc8881","actor_username":"ford@example.com","actor_via_sso":false,"log_type":"account"}', '2025-11-10 22:51:46.548539+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'authenticated', 'authenticated', 'stephen@clemenger.io', '$2a$10$wXB6jn6Marezng4ZrkEzf.JPV78oUOsGXfJtN4gNHrNBNPVezhHq6', '2025-11-10 20:31:02.281415+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 20:31:02.282925+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3592c60c-6c56-41e5-8c4e-5fe547dee908", "email": "stephen@clemenger.io", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 20:31:02.27837+00', '2025-11-10 20:31:02.283752+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'authenticated', 'authenticated', 'neil@example.com', '$2a$10$HJR27xWUC4urHRKOY47JdO69wiIURsiTCamM8X7o5OvBOOlAwub8C', '2025-11-10 21:21:58.532046+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 21:21:58.533803+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "63cfe4af-dba5-4824-af66-1c9a1b7546be", "email": "neil@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 21:21:58.527033+00', '2025-11-10 21:21:58.534644+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5097c61c-6414-4878-92ed-467b60844fbb', 'authenticated', 'authenticated', 'grjeff@gmail.com', '$2a$10$je3lfgCY9KeUZBwbNAx7kO5yKbQAy2KdDPdBf/5QmvUIEHyJSTnAW', '2025-11-10 20:29:03.052857+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 21:29:14.640323+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5097c61c-6414-4878-92ed-467b60844fbb", "email": "grjeff@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 20:29:03.046282+00', '2025-11-10 21:29:14.641376+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'authenticated', 'authenticated', 'ford@example.com', '$2a$10$iTB448S05J5XW7jWH167E.uFp0xtOW7916cgpc8e64MsPiplWx2vK', '2025-11-10 22:29:00.273534+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 22:29:00.275013+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a5d74a2f-f592-49c8-8dee-b2e134cc8881", "email": "ford@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 22:29:00.269601+00', '2025-11-10 22:29:00.275822+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('5097c61c-6414-4878-92ed-467b60844fbb', '5097c61c-6414-4878-92ed-467b60844fbb', '{"sub": "5097c61c-6414-4878-92ed-467b60844fbb", "email": "grjeff@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 20:29:03.050944+00', '2025-11-10 20:29:03.050982+00', '2025-11-10 20:29:03.050982+00', 'f1dbd02e-ba66-41e7-8ad8-b11308ef5f45'),
	('3592c60c-6c56-41e5-8c4e-5fe547dee908', '3592c60c-6c56-41e5-8c4e-5fe547dee908', '{"sub": "3592c60c-6c56-41e5-8c4e-5fe547dee908", "email": "stephen@clemenger.io", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 20:31:02.280126+00', '2025-11-10 20:31:02.28016+00', '2025-11-10 20:31:02.28016+00', '233851d4-425f-4878-b437-f30a68412bd9'),
	('63cfe4af-dba5-4824-af66-1c9a1b7546be', '63cfe4af-dba5-4824-af66-1c9a1b7546be', '{"sub": "63cfe4af-dba5-4824-af66-1c9a1b7546be", "email": "neil@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 21:21:58.530387+00', '2025-11-10 21:21:58.530431+00', '2025-11-10 21:21:58.530431+00', '7c9ec6f1-a738-44d0-ac8e-fbcbce1c0815'),
	('a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', '{"sub": "a5d74a2f-f592-49c8-8dee-b2e134cc8881", "email": "ford@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 22:29:00.27211+00', '2025-11-10 22:29:00.27213+00', '2025-11-10 22:29:00.27213+00', 'f0bbdce0-bd73-4473-b804-9ee14eb36578');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter") VALUES
	('2d4f3cd8-33cb-4833-ad5a-e1229f6ae94e', '5097c61c-6414-4878-92ed-467b60844fbb', '2025-11-10 21:29:14.640403+00', '2025-11-10 21:29:14.640403+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '172.30.1.1', NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('2d4f3cd8-33cb-4833-ad5a-e1229f6ae94e', '2025-11-10 21:29:14.641525+00', '2025-11-10 21:29:14.641525+00', 'password', 'a63744af-a853-41e0-a7a3-7915a5741546');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 6, 'uua33bcagu6c', '5097c61c-6414-4878-92ed-467b60844fbb', false, '2025-11-10 21:29:14.64094+00', '2025-11-10 21:29:14.64094+00', NULL, '2d4f3cd8-33cb-4833-ad5a-e1229f6ae94e');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "name", "photo", "title", "company", "industry", "location", "networking_goals", "organizations_current", "organizations_interested", "professional_interests", "gender", "gender_preference", "age_range", "age_preference", "connection_count", "max_connections", "last_suggestion_sent_at", "next_suggestion_due_at", "created_at", "updated_at", "first_name", "last_name", "username", "year_born", "year_born_connect", "zip_code", "zip_code_radius", "same_industry_preference", "organizations_other", "organizations_to_check_out_other", "professional_interests_other", "personal_interests") VALUES
	('5097c61c-6414-4878-92ed-467b60844fbb', 'grjeff@gmail.com', 'Jeff Hill', NULL, 'Founder', 'BudE', 'events', '12345', 'Goals', '{"GR Chamber of Commerce"}', '{"Creative Mornings"}', '{Marketing,Healthcare}', 'male', 'any', NULL, NULL, 0, 10, NULL, NULL, '2025-11-10 20:29:03.563+00', '2025-11-10 20:29:03.564+00', 'Jeff', 'Hill', 'Jeff', 1999, 'No Preference', '12345', NULL, 'Either', '', '', 'Test', '["Interests"]'),
	('3592c60c-6c56-41e5-8c4e-5fe547dee908', 'stephen@clemenger.io', 'Stephen Clemenger', NULL, 'Founder', 'Clemenger Labs', 'events', 'OX5 1TF', 'Networking Goals *
', '{"Economic Club of Grand Rapids"}', '{Bamboo}', '{Healthcare,"Real Estate"}', 'male', 'any', NULL, NULL, 0, 10, NULL, NULL, '2025-11-10 20:31:02.789+00', '2025-11-10 20:31:02.789+00', 'Stephen', 'Clemenger', 'Clemenger', 1999, 'No Preference', 'OX5 1TF', NULL, 'Either', '', '', '', '["Personal Interests *\n"]'),
	('63cfe4af-dba5-4824-af66-1c9a1b7546be', 'neil@example.com', 'Neil Armstrong', NULL, 'Astronaut', 'NASA', 'construction', 'The Moon', 'Earthlings', '{"Economic Club of Grand Rapids","Create Great Leaders"}', '{CARWM}', '{Sustainability}', 'male', 'any', NULL, NULL, 0, 10, NULL, NULL, '2025-11-10 21:21:59.039+00', '2025-11-10 21:21:59.039+00', 'Neil', 'Armstrong', '', 1900, 'No Preference', 'The Moon', NULL, 'Either', '', '', '', '["Space Travel"]'),
	('a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'ford@example.com', 'Gerald Ford', NULL, 'President', 'USA', 'media', '111111', 'International Diplomacy', '{CREW}', '{"Create Great Leaders"}', '{Leadership}', 'male', 'any', NULL, NULL, 0, 10, NULL, NULL, '2025-11-10 22:29:00.78+00', '2025-11-10 22:29:00.78+00', 'Gerald', 'Ford', 'POTUS', 1913, 'No Preference', '111111', NULL, 'Either', '', '', '', '["USA"]');


--
-- Data for Name: connection_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: featured_content; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "from_user_id", "type", "message", "is_read", "created_at", "updated_at") VALUES
	('90406047-4e6d-46b3-9315-5fbbbe14cedc', '3592c60c-6c56-41e5-8c4e-5fe547dee908', NULL, 'connection_request', 'Jeff wants to connect with you', true, '2025-11-10 20:34:38.925252+00', '2025-11-10 20:34:38.925252+00'),
	('a4b21dca-0694-4b59-bc9d-dbe0ed324f3c', '63cfe4af-dba5-4824-af66-1c9a1b7546be', NULL, 'connection_request', 'One small step for you!  One giant networking leap for me.', true, '2025-11-10 21:27:29.603418+00', '2025-11-10 21:27:29.603418+00'),
	('c693b47b-80ff-4d3a-a01e-2cfba2d5f8bf', '5097c61c-6414-4878-92ed-467b60844fbb', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'connection_request', 'Hello, Jeff, I''d like to connect - Neil', true, '2025-11-10 21:30:10.374097+00', '2025-11-10 21:30:10.374097+00'),
	('1238ac96-5a62-4b96-84b2-f9095fd08176', '5097c61c-6414-4878-92ed-467b60844fbb', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'connection_request', 'Hi Jeff - Stephen', true, '2025-11-10 21:40:16.171088+00', '2025-11-10 21:40:16.171088+00');


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_settings" ("id", "user_id", "setting_key", "setting_value", "created_at", "updated_at") VALUES
	('7bbcd932-9960-42ef-8e5a-e6b1652e6bc6', '5097c61c-6414-4878-92ed-467b60844fbb', 'email_connection_requests', 'true', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('1f56c0d2-0390-4376-bc76-73f990142870', '5097c61c-6414-4878-92ed-467b60844fbb', 'email_new_matches', 'true', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('ab29917f-df91-40e0-ab1f-602527d06958', '5097c61c-6414-4878-92ed-467b60844fbb', 'email_messages', 'false', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('853fe525-30a1-4a8f-8cab-9b5900188b98', '5097c61c-6414-4878-92ed-467b60844fbb', 'email_event_reminders', 'false', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('6682e58a-5d85-46c7-a179-4e722202d19d', '5097c61c-6414-4878-92ed-467b60844fbb', 'email_weekly_digest', 'false', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('238cc1d7-dbe5-46e8-818a-545264881580', '5097c61c-6414-4878-92ed-467b60844fbb', 'inapp_connection_requests', 'true', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('901986eb-1242-412d-87bf-7f6ea36efeea', '5097c61c-6414-4878-92ed-467b60844fbb', 'inapp_new_matches', 'true', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('6f8ead82-293e-4541-8fc1-eed3a17c661d', '5097c61c-6414-4878-92ed-467b60844fbb', 'inapp_messages', 'false', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('79fdd213-16bb-464f-aaaf-577b299ec263', '5097c61c-6414-4878-92ed-467b60844fbb', 'inapp_event_reminders', 'false', '2025-11-10 20:29:03.578297+00', '2025-11-10 20:29:03.578297+00'),
	('4378ebb0-6077-4039-b598-96de8657716e', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'email_connection_requests', 'true', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('cd75b868-f3f9-4664-acb3-9edfdb0859a4', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'email_new_matches', 'true', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('e429e479-36fa-4866-a07c-67964db3f707', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'email_messages', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('5a46973d-6573-4710-9680-0348dddc919c', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'email_event_reminders', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('cf31f0c1-e490-46fb-99c5-37385f77c638', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'email_weekly_digest', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('7a82d656-6e25-40a9-bdd9-f120d01387e3', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'inapp_connection_requests', 'true', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('6c500c44-c310-40d5-ab19-83a5c0939ae0', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'inapp_new_matches', 'true', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('95501703-1a58-4080-a8d1-d72aad0b67ee', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'inapp_messages', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('3147f85b-fd41-42f3-9a5a-6db36d446ab9', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'inapp_event_reminders', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00'),
	('cbebc6b5-7190-416d-ad24-6ee06b558fc4', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'email_connection_requests', 'true', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('6bbbb98d-b17d-4ad2-ae22-4724a39ee561', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'email_new_matches', 'true', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('e3bd8c2a-2467-4a9e-ae07-9d913d311e66', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'email_messages', 'false', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('9e59045a-f7d2-492d-85d2-bf8eab5414bc', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'email_event_reminders', 'false', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('3219327b-a623-45b3-8519-b80f6feea511', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'email_weekly_digest', 'false', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('3d6f851b-043a-4871-b516-ae78569a2cf0', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'inapp_connection_requests', 'true', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('776462cf-a1aa-432c-95a3-8269bcf4a763', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'inapp_new_matches', 'true', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('41f86f47-a9a9-4ff6-8ef3-bb332dadbdbd', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'inapp_messages', 'false', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('1d58d8f2-fab9-4130-9d81-d35d47cb395f', '63cfe4af-dba5-4824-af66-1c9a1b7546be', 'inapp_event_reminders', 'false', '2025-11-10 21:21:59.056625+00', '2025-11-10 21:21:59.056625+00'),
	('68853e93-a019-4d4b-bb10-418cda7a7786', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'email_connection_requests', 'true', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('b3383dc1-97d9-44ce-beb2-e664dd9d7b12', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'email_new_matches', 'true', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('e0ded09e-5ad6-4572-9496-007eec8d1a56', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'email_messages', 'false', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('b40d239b-c853-41f4-bc8c-4779d48ee721', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'email_event_reminders', 'false', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('f94c3c38-423d-4d73-a9c7-05c2e3191f3a', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'email_weekly_digest', 'false', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('fe956177-711c-4e28-bc76-8088ee6b3c7e', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'inapp_connection_requests', 'true', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('7cdd410d-0d70-4f26-a267-4a80f8927b6e', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'inapp_new_matches', 'true', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('85eb1502-a144-4463-92ff-49aeee8bf02d', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'inapp_messages', 'false', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00'),
	('1715d38b-8ec8-4a86-896e-7a8da4a1ae7b', 'a5d74a2f-f592-49c8-8dee-b2e134cc8881', 'inapp_event_reminders', 'false', '2025-11-10 22:29:00.795091+00', '2025-11-10 22:29:00.795091+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 7, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
