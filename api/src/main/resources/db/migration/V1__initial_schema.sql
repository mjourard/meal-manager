-- Initial Schema Setup for Meal Manager
CREATE TABLE public.recipeorder (
    id bigint NOT NULL,
    message TEXT,
    createdat timestamp without time zone,
    fulfilled boolean,
    CONSTRAINT pk_recipeorder PRIMARY KEY (id)
);



--
-- TOC entry 206 (class 1259 OID 16415)
-- Name: sysuser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sysuser (
    id bigint NOT NULL,
    defaultchecked boolean DEFAULT true NOT NULL,
    email character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    clerk_user_id character varying(255),
    CONSTRAINT pk_sysuser PRIMARY KEY (id)
);


-- Create recipe table
CREATE TABLE public.recipe (
    id bigint NOT NULL,
    description character varying(255),
    disabled boolean DEFAULT false NOT NULL,
    name character varying(255) NOT NULL,
    recipeurl TEXT,
    CONSTRAINT pk_recipe PRIMARY KEY (id)
);


-- Create recipeorderitem table 
CREATE TABLE public.recipeorderitem (
    id BIGSERIAL PRIMARY KEY,
    orderid BIGINT NOT NULL,
    recipeid BIGINT NOT NULL,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (orderid) REFERENCES recipeorder(id),
    CONSTRAINT fk_orderitem_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id)
);

-- Create recipeorderrecipient table
CREATE TABLE public.recipeorderrecipient (
    id BIGSERIAL PRIMARY KEY,
    orderid BIGINT NOT NULL,
    sysuserid BIGINT NOT NULL,
    CONSTRAINT fk_orderrecipient_order FOREIGN KEY (orderid) REFERENCES recipeorder(id),
    CONSTRAINT fk_orderrecipient_sysuser FOREIGN KEY (sysuserid) REFERENCES sysuser(id)
);

-- Create Hibernate sequence to handle ID generation
CREATE SEQUENCE public.hibernate_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
