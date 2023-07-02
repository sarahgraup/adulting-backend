\echo 'Delete and recreate adulting db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE adulting;
CREATE DATABASE adulting;
\connect adulting

\i adulting-schema.sql
\i adulting-seed.sql

\echo 'Delete and recreate adulting_ db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE adulting_test;
CREATE DATABASE adulting_test;
\connect adulting_test

\i adulting-schema.sql