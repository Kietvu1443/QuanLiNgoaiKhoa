--
-- PostgreSQL database dump
--

\restrict oVYeXwPyeADLQCh1dfBthqYuXNd25LM93mzVgkIjxgZg5ghPbUIkdXSWQDvTZPq

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-17 13:56:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16741)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16799)
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT activities_points_check CHECK ((points >= 0))
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16798)
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 222
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- TOC entry 228 (class 1259 OID 16863)
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    user_id integer NOT NULL,
    activity_id integer NOT NULL,
    status character varying(20) NOT NULL,
    latitude double precision,
    longitude double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attendances_status_check CHECK (((status)::text = ANY ((ARRAY['approved'::character varying, 'pending'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16862)
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendances_id_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 227
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- TOC entry 230 (class 1259 OID 16889)
-- Name: points_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    activity_id integer NOT NULL,
    points integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.points_history OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16888)
-- Name: points_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.points_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.points_history_id_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 229
-- Name: points_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.points_history_id_seq OWNED BY public.points_history.id;


--
-- TOC entry 226 (class 1259 OID 16843)
-- Name: qr_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_tokens (
    id integer NOT NULL,
    activity_id integer NOT NULL,
    token character varying(128) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.qr_tokens OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16842)
-- Name: qr_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qr_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 225
-- Name: qr_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qr_tokens_id_seq OWNED BY public.qr_tokens.id;


--
-- TOC entry 224 (class 1259 OID 16823)
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    user_id integer NOT NULL,
    activity_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16780)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    student_code character varying(30) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16779)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4874 (class 2604 OID 16802)
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 16866)
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16892)
-- Name: points_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_history ALTER COLUMN id SET DEFAULT nextval('public.points_history_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 16846)
-- Name: qr_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_tokens ALTER COLUMN id SET DEFAULT nextval('public.qr_tokens_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 16783)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5067 (class 0 OID 16799)
-- Dependencies: 223
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.activities VALUES (2, 'Ngày tình nguyện', 'Hoạt động cộng đồng', 10.77653, 106.700981, '2026-04-07 21:06:02.388808+07', '2026-04-08 00:06:02.388808+07', 15, 1, '2026-04-05 21:06:02.388808+07');
INSERT INTO public.activities VALUES (3, 'Chạy tình nguyện', 'Hoạt động chạy tình nguyện', 10.773, 106.659, '2026-04-08 21:06:02.388808+07', '2026-04-08 22:06:02.388808+07', 8, 1, '2026-04-05 21:06:02.388808+07');
INSERT INTO public.activities VALUES (1, 'AI Workshop', 'Giới thiệu về AI cho sinh viên', 11.107120958253606, 106.63008208474946, '2026-04-06 21:06:02.388808+07', '2026-04-06 23:06:02.388808+07', 10, 1, '2026-04-05 21:06:02.388808+07');
INSERT INTO public.activities VALUES (4, 'Hiến máu tình nguyện', 'Hiến máu nhân đạo kỉ niệm', 10.77653, 106.700981, '2026-04-09 08:25:00+07', '2026-04-11 08:25:00+07', 30, 1, '2026-04-06 08:25:42.516106+07');
INSERT INTO public.activities VALUES (5, 'Trại hè vui vẻ', 'Công tác làm việc trại hè', 11.107194564880595, 106.63010745393007, '2026-04-11 15:18:00+07', '2026-04-16 15:18:00+07', 50, 1, '2026-04-06 15:19:31.21392+07');
INSERT INTO public.activities VALUES (6, 'Tình nguyện trung thu', 'Hoạt động gắn bó tình nguyện', 11.107194564880595, 106.63010745393007, '2026-04-17 15:23:00+07', '2026-04-17 15:23:00+07', 40, 1, '2026-04-06 15:23:13.309457+07');
INSERT INTO public.activities VALUES (7, 'Mùa đông ấm áp', 'Mùa đông cho những hoàn cảnh khó khăn', 11.107178652338881, 106.63007819456297, '2026-04-15 22:51:00+07', '2026-04-16 22:51:00+07', 34, 1, '2026-04-06 22:52:13.13109+07');
INSERT INTO public.activities VALUES (8, 'Lễ hội vui vẻ BDU', 'Sự kiện vui vẻ ở bdu', 10.990528750000003, 106.66475025, '2026-04-07 07:37:00+07', '2026-04-09 07:37:00+07', 61, 1, '2026-04-07 07:37:42.217597+07');


--
-- TOC entry 5072 (class 0 OID 16863)
-- Dependencies: 228
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.attendances VALUES (1, 2, 1, 'approved', 11.107120958253606, 106.63008208474946, '2026-04-05 21:55:17.632899+07');
INSERT INTO public.attendances VALUES (2, 2, 4, 'pending', NULL, NULL, '2026-04-06 15:16:45.525467+07');
INSERT INTO public.attendances VALUES (3, 2, 5, 'approved', 11.107231500416473, 106.63011165541117, '2026-04-06 15:20:20.065113+07');
INSERT INTO public.attendances VALUES (4, 2, 6, 'approved', 11.107146208948958, 106.63008703014575, '2026-04-06 15:24:07.514786+07');
INSERT INTO public.attendances VALUES (5, 2, 7, 'approved', 11.10713222438724, 106.63008692417826, '2026-04-06 22:54:09.680716+07');
INSERT INTO public.attendances VALUES (6, 2, 8, 'approved', 10.990528750000003, 106.66475025, '2026-04-07 07:38:37.56226+07');


--
-- TOC entry 5074 (class 0 OID 16889)
-- Dependencies: 230
-- Data for Name: points_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.points_history VALUES (1, 2, 1, 10, '2026-04-05 21:55:17.632899+07');
INSERT INTO public.points_history VALUES (2, 2, 4, 30, '2026-04-06 15:16:45.525467+07');
INSERT INTO public.points_history VALUES (3, 2, 5, 50, '2026-04-06 15:20:20.065113+07');
INSERT INTO public.points_history VALUES (4, 2, 6, 40, '2026-04-06 15:24:07.514786+07');
INSERT INTO public.points_history VALUES (5, 2, 7, 34, '2026-04-06 22:54:09.680716+07');
INSERT INTO public.points_history VALUES (6, 2, 8, 61, '2026-04-07 07:38:37.56226+07');


--
-- TOC entry 5070 (class 0 OID 16843)
-- Dependencies: 226
-- Data for Name: qr_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.qr_tokens VALUES (1, 1, '59740643aa65ee857945cfe3f9d7dc1a045fa426e6547ecc', '2026-04-05 21:56:52.196861+07', '2026-04-05 21:51:52.196861+07');
INSERT INTO public.qr_tokens VALUES (2, 4, '70b89bae865bd94439ada49c2cb88dafcf5d2e493cf6a419', '2026-04-06 08:27:43.083917+07', '2026-04-06 08:26:43.083917+07');
INSERT INTO public.qr_tokens VALUES (3, 4, '0c767ca61569d75d35166dceecbc1ce3563d1ec6033fd222', '2026-04-06 15:20:15.56381+07', '2026-04-06 15:15:15.56381+07');
INSERT INTO public.qr_tokens VALUES (4, 5, '40da375906c95e5c37116417e604ce4d94e9fde4fbc7c23c', '2026-04-06 15:29:57.035052+07', '2026-04-06 15:19:57.035052+07');
INSERT INTO public.qr_tokens VALUES (5, 6, '4d4dceb5445101998710cfcddc5991fabfcb5faa88e4d066', '2026-04-06 15:33:28.192718+07', '2026-04-06 15:23:28.192718+07');
INSERT INTO public.qr_tokens VALUES (6, 7, 'b5d1862400bc06b7e0426f8b93704c07eeedeea10997dee0', '2026-04-06 23:05:42.45247+07', '2026-04-06 22:53:42.45247+07');
INSERT INTO public.qr_tokens VALUES (7, 8, '885fc9147e7e192e81a86327141820db3e5c09144c90ea45', '2026-04-07 09:18:02.954997+07', '2026-04-07 07:38:02.954997+07');
INSERT INTO public.qr_tokens VALUES (8, 8, 'f57d69a117ed604d57bfd3826cd687a63d4103c499c584c3', '2026-04-08 02:24:44.988455+07', '2026-04-07 09:44:44.988455+07');


--
-- TOC entry 5068 (class 0 OID 16823)
-- Dependencies: 224
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.registrations VALUES (2, 1, '2026-04-05 21:52:42.348814+07');
INSERT INTO public.registrations VALUES (2, 4, '2026-04-06 15:08:31.451485+07');
INSERT INTO public.registrations VALUES (2, 3, '2026-04-06 15:09:43.119242+07');
INSERT INTO public.registrations VALUES (2, 2, '2026-04-06 15:10:03.308106+07');
INSERT INTO public.registrations VALUES (2, 5, '2026-04-06 15:20:11.718726+07');
INSERT INTO public.registrations VALUES (2, 6, '2026-04-06 15:23:56.681885+07');
INSERT INTO public.registrations VALUES (2, 7, '2026-04-06 22:52:31.447633+07');
INSERT INTO public.registrations VALUES (2, 8, '2026-04-07 07:38:28.130499+07');


--
-- TOC entry 5065 (class 0 OID 16780)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'admin001', 'admin123', 'admin', '2026-04-05 21:06:02.385831+07');
INSERT INTO public.users VALUES (2, 'sv001', '123456', 'student', '2026-04-05 21:06:02.385831+07');
INSERT INTO public.users VALUES (3, 'sv002', '123456', 'student', '2026-04-06 15:28:49.966016+07');


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 222
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_id_seq', 8, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 227
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendances_id_seq', 6, true);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 229
-- Name: points_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.points_history_id_seq', 6, true);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 225
-- Name: qr_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qr_tokens_id_seq', 8, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 4892 (class 2606 OID 16817)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 16875)
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 16877)
-- Name: attendances attendances_user_id_activity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_user_id_activity_id_key UNIQUE (user_id, activity_id);


--
-- TOC entry 4908 (class 2606 OID 16900)
-- Name: points_history points_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_history
    ADD CONSTRAINT points_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 16854)
-- Name: qr_tokens qr_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_tokens
    ADD CONSTRAINT qr_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 16856)
-- Name: qr_tokens qr_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_tokens
    ADD CONSTRAINT qr_tokens_token_key UNIQUE (token);


--
-- TOC entry 4894 (class 2606 OID 16831)
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (user_id, activity_id);


--
-- TOC entry 4888 (class 2606 OID 16795)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16797)
-- Name: users users_student_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_code_key UNIQUE (student_code);


--
-- TOC entry 4905 (class 1259 OID 16913)
-- Name: idx_attendances_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendances_user ON public.attendances USING btree (user_id);


--
-- TOC entry 4906 (class 1259 OID 16914)
-- Name: idx_points_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_points_history_user ON public.points_history USING btree (user_id);


--
-- TOC entry 4895 (class 1259 OID 16912)
-- Name: idx_qr_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_tokens_expires ON public.qr_tokens USING btree (expires_at);


--
-- TOC entry 4896 (class 1259 OID 16911)
-- Name: idx_qr_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_tokens_token ON public.qr_tokens USING btree (token);


--
-- TOC entry 4909 (class 2606 OID 16818)
-- Name: activities activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4913 (class 2606 OID 16883)
-- Name: attendances attendances_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 16878)
-- Name: attendances attendances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4915 (class 2606 OID 16906)
-- Name: points_history points_history_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_history
    ADD CONSTRAINT points_history_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- TOC entry 4916 (class 2606 OID 16901)
-- Name: points_history points_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_history
    ADD CONSTRAINT points_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4912 (class 2606 OID 16857)
-- Name: qr_tokens qr_tokens_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_tokens
    ADD CONSTRAINT qr_tokens_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- TOC entry 4910 (class 2606 OID 16837)
-- Name: registrations registrations_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- TOC entry 4911 (class 2606 OID 16832)
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-04-17 13:56:03

--
-- PostgreSQL database dump complete
--

\unrestrict oVYeXwPyeADLQCh1dfBthqYuXNd25LM93mzVgkIjxgZg5ghPbUIkdXSWQDvTZPq

