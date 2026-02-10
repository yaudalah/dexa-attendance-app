-- Dexa App - Database Initialization
-- PostgreSQL schema for Apple Silicon (Mac)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types (match TypeORM convention)
DO $$ BEGIN
  CREATE TYPE tbl_employees_position_enum AS ENUM ('staff', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tbl_attendance_type_enum AS ENUM ('in', 'out');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: tbl_employees
CREATE TABLE IF NOT EXISTS tbl_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  position tbl_employees_position_enum NOT NULL,
  phone VARCHAR(50),
  photo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: tbl_attendance
CREATE TABLE IF NOT EXISTS tbl_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES tbl_employees(id) ON DELETE CASCADE,
  type tbl_attendance_type_enum NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON tbl_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON tbl_attendance(timestamp);

-- Table: tbl_employee_audit_trail
CREATE TABLE IF NOT EXISTS tbl_employee_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_employee_id ON tbl_employee_audit_trail(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON tbl_employee_audit_trail(timestamp);
