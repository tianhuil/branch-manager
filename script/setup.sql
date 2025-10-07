-- Set variables (can be passed via psql -v or set here)
-- Example usage: psql -v db_name='mydb' -v db_user='myuser' -v db_password='mypassword' -f setup.sql
\set HISTCONTROL ignorespace

-- Terminate all connections to the target database (except this one)
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = :'db_name'
  AND pid <> pg_backend_pid();

-- Drop database and user if they exist
DROP DATABASE IF EXISTS :db_name;
DROP USER IF EXISTS :db_user;

-- Create user with password
 CREATE USER :db_user WITH PASSWORD :'db_password';

-- Create database if not exists
CREATE DATABASE :db_name;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE :db_name TO :db_user;

-- Connect to the database and grant schema privileges
\c :db_name
GRANT USAGE ON SCHEMA public TO :db_user;
GRANT CREATE ON SCHEMA public TO :db_user;
