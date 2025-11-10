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
	('00000000-0000-0000-0000-000000000000', '428f349a-4f2c-402e-9cf8-61f82053b427', '{"action":"login","actor_id":"3592c60c-6c56-41e5-8c4e-5fe547dee908","actor_username":"stephen@clemenger.io","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-10 20:31:02.282686+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '5097c61c-6414-4878-92ed-467b60844fbb', 'authenticated', 'authenticated', 'grjeff@gmail.com', '$2a$10$je3lfgCY9KeUZBwbNAx7kO5yKbQAy2KdDPdBf/5QmvUIEHyJSTnAW', '2025-11-10 20:29:03.052857+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 20:30:03.871754+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5097c61c-6414-4878-92ed-467b60844fbb", "email": "grjeff@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 20:29:03.046282+00', '2025-11-10 20:30:03.872871+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'authenticated', 'authenticated', 'stephen@clemenger.io', '$2a$10$wXB6jn6Marezng4ZrkEzf.JPV78oUOsGXfJtN4gNHrNBNPVezhHq6', '2025-11-10 20:31:02.281415+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-10 20:31:02.282925+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3592c60c-6c56-41e5-8c4e-5fe547dee908", "email": "stephen@clemenger.io", "email_verified": true, "phone_verified": false}', NULL, '2025-11-10 20:31:02.27837+00', '2025-11-10 20:31:02.283752+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('5097c61c-6414-4878-92ed-467b60844fbb', '5097c61c-6414-4878-92ed-467b60844fbb', '{"sub": "5097c61c-6414-4878-92ed-467b60844fbb", "email": "grjeff@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 20:29:03.050944+00', '2025-11-10 20:29:03.050982+00', '2025-11-10 20:29:03.050982+00', 'f1dbd02e-ba66-41e7-8ad8-b11308ef5f45'),
	('3592c60c-6c56-41e5-8c4e-5fe547dee908', '3592c60c-6c56-41e5-8c4e-5fe547dee908', '{"sub": "3592c60c-6c56-41e5-8c4e-5fe547dee908", "email": "stephen@clemenger.io", "email_verified": false, "phone_verified": false}', 'email', '2025-11-10 20:31:02.280126+00', '2025-11-10 20:31:02.28016+00', '2025-11-10 20:31:02.28016+00', '233851d4-425f-4878-b437-f30a68412bd9');


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
	('46355ce8-21da-4cfc-a0d8-439610c5b6f3', '3592c60c-6c56-41e5-8c4e-5fe547dee908', '2025-11-10 20:31:02.28296+00', '2025-11-10 20:31:02.28296+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '172.30.1.1', NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('46355ce8-21da-4cfc-a0d8-439610c5b6f3', '2025-11-10 20:31:02.283891+00', '2025-11-10 20:31:02.283891+00', 'password', 'e8e2f69e-6f9c-499e-bc2c-075e03c1b62f');


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
	('00000000-0000-0000-0000-000000000000', 3, '7yz23dddvnxx', '3592c60c-6c56-41e5-8c4e-5fe547dee908', false, '2025-11-10 20:31:02.283317+00', '2025-11-10 20:31:02.283317+00', NULL, '46355ce8-21da-4cfc-a0d8-439610c5b6f3');


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
', '{"Economic Club of Grand Rapids"}', '{Bamboo}', '{Healthcare,"Real Estate"}', 'male', 'any', NULL, NULL, 0, 10, NULL, NULL, '2025-11-10 20:31:02.789+00', '2025-11-10 20:31:02.789+00', 'Stephen', 'Clemenger', 'Clemenger', 1999, 'No Preference', 'OX5 1TF', NULL, 'Either', '', '', '', '["Personal Interests *\n"]');


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

INSERT INTO "public"."matches" ("id", "user_id", "matched_user_id", "compatibility_score", "match_reasons", "status", "pending_since", "created_at", "updated_at", "hidden_by_user_id", "perhaps_since") VALUES
	('b6bcfc73-ea6d-4ada-b9c1-de2ab05a5ab4', '5097c61c-6414-4878-92ed-467b60844fbb', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 33, NULL, 'recommended', NULL, '2025-11-10 20:32:14.164827+00', '2025-11-10 20:32:14.164827+00', NULL, NULL),
	('fd7b41ce-dd26-473c-a867-c532e90d5f4a', '3592c60c-6c56-41e5-8c4e-5fe547dee908', '5097c61c-6414-4878-92ed-467b60844fbb', 33, NULL, 'recommended', NULL, '2025-11-10 20:33:32.793154+00', '2025-11-10 20:33:32.793154+00', NULL, NULL);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "from_user_id", "type", "message", "is_read", "created_at", "updated_at") VALUES
	('90406047-4e6d-46b3-9315-5fbbbe14cedc', '3592c60c-6c56-41e5-8c4e-5fe547dee908', NULL, 'connection_request', 'Jeff wants to connect with you', false, '2025-11-10 20:34:38.925252+00', '2025-11-10 20:34:38.925252+00');


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
	('3147f85b-fd41-42f3-9a5a-6db36d446ab9', '3592c60c-6c56-41e5-8c4e-5fe547dee908', 'inapp_event_reminders', 'false', '2025-11-10 20:31:02.804959+00', '2025-11-10 20:31:02.804959+00');


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 3, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
