PGDMP  7            	         }           proyectosTitulo    17.2    17.2 5               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16388    proyectosTitulo    DATABASE     �   CREATE DATABASE "proyectosTitulo" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Spain.1252';
 !   DROP DATABASE "proyectosTitulo";
                     postgres    false            �            1259    16390    estudiantes    TABLE     �   CREATE TABLE public.estudiantes (
    id bigint NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    email text NOT NULL
);
    DROP TABLE public.estudiantes;
       public         heap r       postgres    false            �            1259    16389    estudiantes_id_seq    SEQUENCE     �   ALTER TABLE public.estudiantes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estudiantes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    218            �            1259    16454    participacion_profesores    TABLE     ;  CREATE TABLE public.participacion_profesores (
    id bigint NOT NULL,
    profesor_id bigint NOT NULL,
    proyecto_id bigint NOT NULL,
    rol text NOT NULL,
    fecha_participacion date NOT NULL,
    CONSTRAINT participacion_profesores_rol_check CHECK ((rol = ANY (ARRAY['Guía'::text, 'Informante'::text])))
);
 ,   DROP TABLE public.participacion_profesores;
       public         heap r       postgres    false            �            1259    16453    participacion_profesores_id_seq    SEQUENCE     �   ALTER TABLE public.participacion_profesores ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.participacion_profesores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    228            �            1259    16473 	   practicas    TABLE     (  CREATE TABLE public.practicas (
    id bigint NOT NULL,
    estudiante_id bigint NOT NULL,
    empresa text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_termino date NOT NULL,
    supervisor text NOT NULL,
    contacto_supervisor text NOT NULL,
    nota numeric(3,2),
    tipo_practica text NOT NULL,
    carta_supervisor text,
    certificado_alumno text,
    formulario_inscripcion text,
    autorizacion_empresa text,
    CONSTRAINT practicas_tipo_practica_check CHECK ((tipo_practica = ANY (ARRAY['Profesional'::text, 'Inicial'::text])))
);
    DROP TABLE public.practicas;
       public         heap r       postgres    false            �            1259    16472    practicas_id_seq    SEQUENCE     �   ALTER TABLE public.practicas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.practicas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    230            �            1259    16400 
   profesores    TABLE     �   CREATE TABLE public.profesores (
    id bigint NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    email text NOT NULL,
    activo boolean DEFAULT true
);
    DROP TABLE public.profesores;
       public         heap r       postgres    false            �            1259    16399    profesores_id_seq    SEQUENCE     �   ALTER TABLE public.profesores ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.profesores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    220            �            1259    16410 	   proyectos    TABLE       CREATE TABLE public.proyectos (
    id bigint NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    estudiante_id bigint NOT NULL,
    profesor_guia_id bigint NOT NULL,
    profesor_informante_id bigint NOT NULL,
    nota numeric(3,2),
    documento bytea,
    estado character varying(20),
    area_aplicacion text,
    CONSTRAINT estado_check CHECK (((estado)::text = ANY ((ARRAY['Aprobado'::character varying, 'Reprobado'::character varying])::text[]))),
    CONSTRAINT nota_check CHECK (((nota >= 1.0) AND (nota <= 7.0)))
);
    DROP TABLE public.proyectos;
       public         heap r       postgres    false                       0    0    COLUMN proyectos.nota    COMMENT     [   COMMENT ON COLUMN public.proyectos.nota IS 'Calificación final del proyecto (1.0 - 7.0)';
          public               postgres    false    222                       0    0    COLUMN proyectos.estado    COMMENT     Y   COMMENT ON COLUMN public.proyectos.estado IS 'Estado del proyecto (Aprobado/Reprobado)';
          public               postgres    false    222            �            1259    16409    proyectos_id_seq    SEQUENCE     �   ALTER TABLE public.proyectos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.proyectos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    222            �            1259    16433    secretarias    TABLE     �   CREATE TABLE public.secretarias (
    id bigint NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    email text NOT NULL,
    contrasena text NOT NULL
);
    DROP TABLE public.secretarias;
       public         heap r       postgres    false            �            1259    16432    secretarias_id_seq    SEQUENCE     �   ALTER TABLE public.secretarias ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.secretarias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    224            �            1259    16443    usuario    TABLE     �   CREATE TABLE public.usuario (
    id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    email character varying(120) NOT NULL
);
    DROP TABLE public.usuario;
       public         heap r       postgres    false            �            1259    16442    usuario_id_seq    SEQUENCE     �   CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.usuario_id_seq;
       public               postgres    false    226                       0    0    usuario_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;
          public               postgres    false    225            @           2604    16446 
   usuario id    DEFAULT     h   ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);
 9   ALTER TABLE public.usuario ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �          0    16390    estudiantes 
   TABLE DATA           B   COPY public.estudiantes (id, nombre, apellido, email) FROM stdin;
    public               postgres    false    218   D       �          0    16454    participacion_profesores 
   TABLE DATA           j   COPY public.participacion_profesores (id, profesor_id, proyecto_id, rol, fecha_participacion) FROM stdin;
    public               postgres    false    228   $F       �          0    16473 	   practicas 
   TABLE DATA           �   COPY public.practicas (id, estudiante_id, empresa, fecha_inicio, fecha_termino, supervisor, contacto_supervisor, nota, tipo_practica, carta_supervisor, certificado_alumno, formulario_inscripcion, autorizacion_empresa) FROM stdin;
    public               postgres    false    230   AF       �          0    16400 
   profesores 
   TABLE DATA           I   COPY public.profesores (id, nombre, apellido, email, activo) FROM stdin;
    public               postgres    false    220   HI       �          0    16410 	   proyectos 
   TABLE DATA           �   COPY public.proyectos (id, titulo, descripcion, estudiante_id, profesor_guia_id, profesor_informante_id, nota, documento, estado, area_aplicacion) FROM stdin;
    public               postgres    false    222   �I       �          0    16433    secretarias 
   TABLE DATA           N   COPY public.secretarias (id, nombre, apellido, email, contrasena) FROM stdin;
    public               postgres    false    224   �J       �          0    16443    usuario 
   TABLE DATA           4   COPY public.usuario (id, nombre, email) FROM stdin;
    public               postgres    false    226   �K       	           0    0    estudiantes_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.estudiantes_id_seq', 24, true);
          public               postgres    false    217            
           0    0    participacion_profesores_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public.participacion_profesores_id_seq', 1, false);
          public               postgres    false    227                       0    0    practicas_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.practicas_id_seq', 51, true);
          public               postgres    false    229                       0    0    profesores_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.profesores_id_seq', 8, true);
          public               postgres    false    219                       0    0    proyectos_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.proyectos_id_seq', 17, true);
          public               postgres    false    221                       0    0    secretarias_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.secretarias_id_seq', 2, true);
          public               postgres    false    223                       0    0    usuario_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.usuario_id_seq', 1, false);
          public               postgres    false    225            F           2606    16398 !   estudiantes estudiantes_email_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_email_key UNIQUE (email);
 K   ALTER TABLE ONLY public.estudiantes DROP CONSTRAINT estudiantes_email_key;
       public                 postgres    false    218            H           2606    16396    estudiantes estudiantes_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.estudiantes DROP CONSTRAINT estudiantes_pkey;
       public                 postgres    false    218            X           2606    16461 6   participacion_profesores participacion_profesores_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.participacion_profesores
    ADD CONSTRAINT participacion_profesores_pkey PRIMARY KEY (id);
 `   ALTER TABLE ONLY public.participacion_profesores DROP CONSTRAINT participacion_profesores_pkey;
       public                 postgres    false    228            Z           2606    16480    practicas practicas_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.practicas
    ADD CONSTRAINT practicas_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.practicas DROP CONSTRAINT practicas_pkey;
       public                 postgres    false    230            J           2606    16408    profesores profesores_email_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_email_key UNIQUE (email);
 I   ALTER TABLE ONLY public.profesores DROP CONSTRAINT profesores_email_key;
       public                 postgres    false    220            L           2606    16406    profesores profesores_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.profesores DROP CONSTRAINT profesores_pkey;
       public                 postgres    false    220            N           2606    16416    proyectos proyectos_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.proyectos DROP CONSTRAINT proyectos_pkey;
       public                 postgres    false    222            P           2606    16441 !   secretarias secretarias_email_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.secretarias
    ADD CONSTRAINT secretarias_email_key UNIQUE (email);
 K   ALTER TABLE ONLY public.secretarias DROP CONSTRAINT secretarias_email_key;
       public                 postgres    false    224            R           2606    16439    secretarias secretarias_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.secretarias
    ADD CONSTRAINT secretarias_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.secretarias DROP CONSTRAINT secretarias_pkey;
       public                 postgres    false    224            T           2606    16450    usuario usuario_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_email_key;
       public                 postgres    false    226            V           2606    16448    usuario usuario_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_pkey;
       public                 postgres    false    226            ^           2606    16462 B   participacion_profesores participacion_profesores_profesor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.participacion_profesores
    ADD CONSTRAINT participacion_profesores_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesores(id);
 l   ALTER TABLE ONLY public.participacion_profesores DROP CONSTRAINT participacion_profesores_profesor_id_fkey;
       public               postgres    false    228    220    4684            _           2606    16467 B   participacion_profesores participacion_profesores_proyecto_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.participacion_profesores
    ADD CONSTRAINT participacion_profesores_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id);
 l   ALTER TABLE ONLY public.participacion_profesores DROP CONSTRAINT participacion_profesores_proyecto_id_fkey;
       public               postgres    false    222    228    4686            `           2606    16481 &   practicas practicas_estudiante_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.practicas
    ADD CONSTRAINT practicas_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id);
 P   ALTER TABLE ONLY public.practicas DROP CONSTRAINT practicas_estudiante_id_fkey;
       public               postgres    false    218    230    4680            [           2606    16417 &   proyectos proyectos_estudiante_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id);
 P   ALTER TABLE ONLY public.proyectos DROP CONSTRAINT proyectos_estudiante_id_fkey;
       public               postgres    false    4680    218    222            \           2606    16422 )   proyectos proyectos_profesor_guia_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_profesor_guia_id_fkey FOREIGN KEY (profesor_guia_id) REFERENCES public.profesores(id);
 S   ALTER TABLE ONLY public.proyectos DROP CONSTRAINT proyectos_profesor_guia_id_fkey;
       public               postgres    false    4684    220    222            ]           2606    16427 /   proyectos proyectos_profesor_informante_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_profesor_informante_id_fkey FOREIGN KEY (profesor_informante_id) REFERENCES public.profesores(id);
 Y   ALTER TABLE ONLY public.proyectos DROP CONSTRAINT proyectos_profesor_informante_id_fkey;
       public               postgres    false    4684    220    222            �     x�]��n�0���!b����q� )�����Z��JJF��!C᭫^������t>���hL����A�h�o�h|~2�V]ժʎ&�̡�`z����`X�ޕ�9�q�>�S�o�U�R�7%7��p���?+\�)��w��oj�����:/AX-��S	�c�i{�Tu�N�\ߧ[�q�\��Y����9��L��oL&+�I��7��K���	=�~/���Z����T�ƾ0z
%��J�,�1k٦�����1�l(����У�]j�U��H�$�_H�@ϱ�����7���R!�����f؂xz�W����T����ͭZ*��0v˴>j�.�K�ղag�iZ4��tA_�\aYa,X�E9냡\6
��x��t#i�u6�>�1F�NcG�V�{d6�C�_��3��]b����I��6���uϪ��rP��NJpB��V����6h���GOUG�8u�\#�\{d���ح�[�੨�n��CS촳�ͻ�Kn�R5���F��_�e��      �      x������ � �      �   �  x��U�N�@>O��/�v~Hni�HMH	�"Y��	ۮw�];*��q8p@}�Xg��(���|���v���]��<�q&J�W�@�ͺԃ�&l�pX��<F�P�RA�,p�,��ÍU
���X�3Ć�P���4F���L�`zɍ���Bc�QxQ����lp��NGѧ�����?�{�"��0���$�D(�T����)��5'.M��"�㾃j:�>_s�Y����z�W��=Xײ᱒+����c^"wiQ����({m_��<�o:�~�.t`�~e�Ln��:��A�Ltqk�qq��
� 3.�V���9�k���[ڕ�����l���Ԫ��𤸍3��	
.��5��5%6�*��_T����P��i6��m���r�h2.�\c7����H��>�&4`�f���d,5�����(���Fg̊{ac2Sbh(є��t��P��u��E�{#�ĝpt��w�2.��-
���o��0Ii̞��f
����0-�l�P9VSn�X�7���߆ɏ�w�l���5Ұ�|����(����i	CS�lZ��E���B�%ӆ�(��3�Ҳ�t�2�Խ�̙pN���P����K�#��̍�k���-F��ބ�:mӏ�U�	s�%�B����X��9Ɲ��z}=�4�@=#�Ps��\&�r(hV�6��8�yq������[��rlw��� �:�;6k��K�)z��΢�g����Q��BӇ�Km�uwMx�͵��Jo�o�>��|Sm��j��Oɏd      �   �   x�E�1�0Eg�0 ��@$Ffc�*�%'e�mz.V'R������?���gʦ H*\�$2���	�:��-������vn�p��x�S'N��
tih������z���:g�)���g�w��A      �   �   x�m�=�0��9�O����#C׊��!.B�$r���o�������5Я��a�I��edq<Y4i�F<�hI�*�4�%���3�6�VE��O� oxW��a����/W�\��m+���g�p�2ZUjUɴ�x�gM	m�'Ɛ)��>�`i      �     x�u�MKC1E�}���L�#�J�R��SAp3�$�Z����_ot���p��s�/v�.6�8���šW6��8��e����:��r���}N��0~��	���(jS!ͦ�s��ZD��K�VS
�3��A��"+��(�dPZ�B.���cՔ:O<�H�)g!	)����y��~{��n���������Rb���w�����K�ȩ{ר	j����k �
LF�����q���sྍ���bsI9�BIĈ1�O����čn*      �      x������ � �     