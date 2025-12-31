-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Account status enum
CREATE TYPE account_status AS ENUM ('pending', 'approved', 'rejected', 'disabled');

-- Role enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

-- Registration status enum
CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'cancelled');

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  status account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  nij VARCHAR(50),
  class VARCHAR(100),
  gender VARCHAR(20),
  district VARCHAR(100),
  address TEXT,
  date_of_birth DATE,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  registration_open BOOLEAN DEFAULT false,
  registration_limit INTEGER,
  attendance_enabled BOOLEAN DEFAULT true,
  contact_persons JSONB,
  event_url TEXT,
  location TEXT,
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event sessions table
CREATE TABLE event_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event registrations table with queue system
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'registered',
  queue_position INTEGER,
  registration_data JSONB,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Attendance records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES accounts(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE(session_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_role ON accounts(role);
CREATE INDEX idx_user_profiles_account_id ON user_profiles(account_id);
CREATE INDEX idx_events_enabled ON events(enabled);
CREATE INDEX idx_events_registration_open ON events(registration_open);
CREATE INDEX idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
CREATE INDEX idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_user_id ON attendance_records(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_sessions_updated_at BEFORE UPDATE ON event_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
