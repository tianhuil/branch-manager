-- Set variables (can be passed via psql -v or set here)
-- Example usage: psql -v db_name='mydb' -v db_user='myuser' -v db_password='mypassword' -f setup.sql
\set HISTCONTROL ignorespace

-- Revoke all privileges from user on the database (if exists)
REVOKE ALL PRIVILEGES ON DATABASE :db_name FROM :db_user;

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
