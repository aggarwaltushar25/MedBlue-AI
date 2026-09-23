-- ============================================================================
-- MEDBLUE-AI (MEDISHIELD AI) - SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================================
-- Copy and paste this script directly into the Supabase SQL Editor.
-- Dashboard URL: https://supabase.com/dashboard/project/_/sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'patient', 'chemist', 'pharmacist', 'wholesaler', 'manufacturer', 'admin', 'regulatory'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM (
    'Accepted', 'Hold', 'Quarantined', 'DISPATCHED', 'RECEIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM (
    'All', 'Low', 'Medium', 'High'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_severity AS ENUM (
    'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM (
    'NEW', 'UNDER REVIEW', 'INVESTIGATION', 'ESCALATED', 'ACTION TAKEN', 'CLOSED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM (
    'store', 'supplier', 'manufacturer', 'batch', 'location'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_status AS ENUM (
    'Active', 'Under Investigation', 'Suspended', 'High-Risk Watchlist', 'Compliant'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hologram_result AS ENUM (
    'PASS', 'FLAGGED', 'UNABLE_TO_VERIFY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hologram_ref_status AS ENUM (
    'Reference Available', 'Reference Missing'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inventory_status AS ENUM (
    'Verified', 'Hold', 'Quarantined', 'Expired', 'Requires Review'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_item_status AS ENUM (
    'Verified', 'Review Required', 'Quarantine Required', 'Expired', 'Duplicate Serial', 'Cold Chain Breach'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE supply_chain_action AS ENUM (
    'MANUFACTURED', 'VERIFIED', 'DISPATCHED', 'RECEIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM (
    'ACCEPTED_PENDING_REVIEW', 'FLAGGED_FOR_INSPECTION', 'DIRECTIVE_ISSUED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- 3.1 Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Manufacturer', 'Wholesaler', 'Pharmacy', 'Regulator', etc.
  location VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 User Profiles (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  license_number VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Medicines Catalog
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gtin VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  dosage_form VARCHAR(100),
  safe_temp_min NUMERIC(5,2) DEFAULT 2.0,
  safe_temp_max NUMERIC(5,2) DEFAULT 8.0,
  patient_guide JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Batches
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number VARCHAR(100) UNIQUE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.organizations(id),
  mfg_date DATE NOT NULL,
  exp_date DATE NOT NULL,
  total_units_produced INT DEFAULT 0,
  total_suppliers_count INT DEFAULT 1,
  overall_status VARCHAR(100) DEFAULT 'Verified Pristine',
  integrity_score INT DEFAULT 100 CHECK (integrity_score BETWEEN 0 AND 100),
  risk_summary TEXT,
  reference_hologram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Hologram Reference Data
CREATE TABLE IF NOT EXISTS public.hologram_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.organizations(id),
  reference_image_url TEXT NOT NULL,
  batch_image_url TEXT,
  status hologram_ref_status DEFAULT 'Reference Available',
  blockchain_tx_hash VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Unit Serials
CREATE TABLE IF NOT EXISTS public.unit_serials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.organizations(id),
  consignment_id VARCHAR(100),
  status VARCHAR(100) DEFAULT 'Genuine Verified',
  optical_hologram_score INT DEFAULT 95,
  on_chain_tx VARCHAR(100),
  risk_rating risk_level DEFAULT 'Low',
  first_seen_location VARCHAR(255),
  first_seen_time TIMESTAMPTZ,
  duplicate_seen_location VARCHAR(255),
  duplicate_seen_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 Shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id VARCHAR(100) PRIMARY KEY, -- e.g. SHP-9021
  medicine_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  supplier_id UUID REFERENCES public.organizations(id),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  risk_score INT DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  status verification_status DEFAULT 'Accepted',
  primary_issue VARCHAR(255) DEFAULT 'None',
  origin_location VARCHAR(255),
  destination_location VARCHAR(255),
  current_location VARCHAR(255),
  batch_number VARCHAR(100) NOT NULL,
  expiry_date DATE,
  serial_count INT DEFAULT 0,
  duplicate_serials_count INT DEFAULT 0,
  scanned_serial_count INT DEFAULT 0,
  verified_serial_count INT DEFAULT 0,
  cold_chain_compliant BOOLEAN DEFAULT TRUE,
  serial_check_passed BOOLEAN DEFAULT TRUE,
  packaging_score INT DEFAULT 100,
  rfid_tag VARCHAR(100),
  gs1_data_matrix VARCHAR(255),
  parent_shipment_id VARCHAR(100),
  quantity INT DEFAULT 1,
  blockchain_tx_hash VARCHAR(100),
  inspector_notes TEXT,
  reference_hologram_url TEXT,
  batch_image_url TEXT,
  hologram_status hologram_ref_status DEFAULT 'Reference Available',
  last_hologram_check_result hologram_result DEFAULT 'PASS',
  risk_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Cold-Chain Temperature Logs
CREATE TABLE IF NOT EXISTS public.temperature_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id VARCHAR(100) REFERENCES public.shipments(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  temp NUMERIC(5,2) NOT NULL,
  humidity NUMERIC(5,2),
  status VARCHAR(50) DEFAULT 'normal', -- 'normal', 'warning', 'breach'
  is_breach BOOLEAN DEFAULT FALSE,
  location VARCHAR(255)
);

-- 3.9 Custody Nodes & Handoff Stages
CREATE TABLE IF NOT EXISTS public.custody_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id VARCHAR(100) REFERENCES public.shipments(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  actor_type VARCHAR(50) NOT NULL, -- 'manufacturer', 'freight', 'distributor', 'pharmacy'
  location VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'verified',
  temp_range JSONB DEFAULT '{}'::jsonb,
  blockchain_hash VARCHAR(100),
  block_number INT,
  units_passed INT DEFAULT 0,
  notes TEXT,
  handoff_seal_verified BOOLEAN DEFAULT TRUE,
  tamper_evidence TEXT,
  iot_humidity NUMERIC(5,2),
  gps_coordinates VARCHAR(100)
);

-- 3.10 Supply Chain Hash-Chained Events
CREATE TABLE IF NOT EXISTS public.supply_chain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(100) UNIQUE NOT NULL,
  shipment_id VARCHAR(100) REFERENCES public.shipments(id) ON DELETE CASCADE,
  parent_shipment_id VARCHAR(100),
  medicine_id VARCHAR(255),
  batch_id VARCHAR(100),
  quantity INT DEFAULT 1,
  from_organization_id VARCHAR(255) NOT NULL,
  to_organization_id VARCHAR(255) NOT NULL,
  action supply_chain_action NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  performed_by_role user_role NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  previous_hash VARCHAR(100) NOT NULL,
  current_hash VARCHAR(100) NOT NULL
);

-- 3.11 Hologram AI Check Logs
CREATE TABLE IF NOT EXISTS public.hologram_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
  medicine_name VARCHAR(255),
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  batch_number VARCHAR(100),
  shipment_id VARCHAR(100) REFERENCES public.shipments(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(255),
  actor_role user_role,
  organization VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location VARCHAR(255),
  result hologram_result NOT NULL,
  result_label VARCHAR(100),
  captured_image_url TEXT,
  reference_image_url TEXT,
  evidence_reference TEXT,
  notes TEXT,
  blockchain_tx_hash VARCHAR(100),
  risk_score INT DEFAULT 0
);

-- 3.12 Inventory Management
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  category VARCHAR(100),
  batch_number VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255),
  supplier VARCHAR(255),
  shipment_id VARCHAR(100),
  quantity INT DEFAULT 1,
  expiry_date DATE,
  mfg_date DATE,
  verification_status inventory_status DEFAULT 'Verified',
  risk_score INT DEFAULT 0,
  risk_level risk_level DEFAULT 'Low',
  location VARCHAR(255),
  last_verified TIMESTAMPTZ DEFAULT NOW(),
  cold_chain_compliant BOOLEAN DEFAULT TRUE,
  is_duplicate BOOLEAN DEFAULT FALSE,
  is_packaging_anomaly BOOLEAN DEFAULT FALSE,
  quarantine_reason TEXT,
  quarantine_notes TEXT,
  quarantined_at TIMESTAMPTZ,
  quarantined_by VARCHAR(255),
  released_at TIMESTAMPTZ,
  released_by VARCHAR(255),
  release_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13 Stock Audit Scan Sessions
CREATE TABLE IF NOT EXISTS public.stock_scan_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_scanned INT DEFAULT 0,
  verified_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  quarantine_count INT DEFAULT 0,
  expired_count INT DEFAULT 0,
  duplicate_count INT DEFAULT 0,
  cold_chain_count INT DEFAULT 0,
  anomaly_count INT DEFAULT 0,
  is_live BOOLEAN DEFAULT TRUE
);

-- 3.14 Stock Audit Scan Items
CREATE TABLE IF NOT EXISTS public.stock_scan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.stock_scan_sessions(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  supplier VARCHAR(255),
  status stock_item_status DEFAULT 'Verified',
  risk_score INT DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- 3.15 Regulatory Incidents
CREATE TABLE IF NOT EXISTS public.regulatory_incidents (
  id VARCHAR(100) PRIMARY KEY, -- e.g. INC-2026-0881
  title VARCHAR(255) NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'HIGH',
  status incident_status NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  store_id UUID REFERENCES public.organizations(id),
  store_name VARCHAR(255),
  store_location VARCHAR(255),
  store_license VARCHAR(100),
  supplier_id UUID REFERENCES public.organizations(id),
  supplier_name VARCHAR(255),
  manufacturer_id UUID REFERENCES public.organizations(id),
  manufacturer_name VARCHAR(255),
  medicine_name VARCHAR(255) NOT NULL,
  gtin VARCHAR(50),
  batch_number VARCHAR(100) NOT NULL,
  shipment_id VARCHAR(100),
  serial_number VARCHAR(100),
  detection_reason TEXT NOT NULL,
  risk_score INT DEFAULT 85,
  evidence JSONB DEFAULT '{}'::jsonb,
  assigned_reviewer_name VARCHAR(255),
  assigned_reviewer_role VARCHAR(100),
  assigned_reviewer_agency VARCHAR(255),
  related_incidents JSONB DEFAULT '[]'::jsonb,
  regulatory_notes TEXT,
  escalated_to_agency VARCHAR(255),
  action_taken_summary TEXT
);

-- 3.16 Incident Timeline Events
CREATE TABLE IF NOT EXISTS public.incident_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id VARCHAR(100) REFERENCES public.regulatory_incidents(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor VARCHAR(255) NOT NULL,
  actor_type VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  shipment_id VARCHAR(100),
  entity VARCHAR(255),
  reason TEXT,
  status_from incident_status,
  status_to incident_status,
  hash_proof VARCHAR(100)
);

-- 3.17 Regulatory Investigation Cases
CREATE TABLE IF NOT EXISTS public.regulatory_cases (
  id VARCHAR(100) PRIMARY KEY, -- e.g. CASE-2026-0042
  case_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  priority incident_severity DEFAULT 'HIGH',
  status incident_status DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  lead_investigator VARCHAR(255),
  agency VARCHAR(255) DEFAULT 'CDSCO',
  incident_ids JSONB DEFAULT '[]'::jsonb,
  shipment_ids JSONB DEFAULT '[]'::jsonb,
  affected_stores JSONB DEFAULT '[]'::jsonb,
  affected_suppliers JSONB DEFAULT '[]'::jsonb,
  affected_manufacturers JSONB DEFAULT '[]'::jsonb,
  medicines JSONB DEFAULT '[]'::jsonb,
  batches JSONB DEFAULT '[]'::jsonb,
  detection_pattern TEXT,
  evidence_summary TEXT,
  evidence_package_hash VARCHAR(100),
  regulatory_action_directives JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb
);

-- 3.18 Regulatory Submissions (CDSCO Gateway Sync)
CREATE TABLE IF NOT EXISTS public.regulatory_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id VARCHAR(100) UNIQUE NOT NULL,
  case_id VARCHAR(100) REFERENCES public.regulatory_cases(id) ON DELETE SET NULL,
  incident_id VARCHAR(100) REFERENCES public.regulatory_incidents(id) ON DELETE SET NULL,
  agency_code VARCHAR(100) DEFAULT 'CDSCO',
  submission_type VARCHAR(100) NOT NULL,
  evidence_hash VARCHAR(100),
  acknowledgement_number VARCHAR(100),
  agency VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status submission_status DEFAULT 'ACCEPTED_PENDING_REVIEW',
  message TEXT,
  payload_data JSONB DEFAULT '{}'::jsonb
);

-- 3.19 Entity Risk Profiles (Stores, Suppliers, Manufacturers)
CREATE TABLE IF NOT EXISTS public.entity_profiles (
  id VARCHAR(100) PRIMARY KEY, -- e.g. store_001
  name VARCHAR(255) NOT NULL,
  type entity_type NOT NULL,
  location VARCHAR(255) NOT NULL,
  status entity_status DEFAULT 'Active',
  license_number VARCHAR(100),
  first_observed DATE,
  last_incident TIMESTAMPTZ,
  total_shipments INT DEFAULT 0,
  suspicious_shipments INT DEFAULT 0,
  quarantined_shipments INT DEFAULT 0,
  incident_count INT DEFAULT 0,
  avg_risk_score NUMERIC(5,2) DEFAULT 0,
  risk_trend VARCHAR(50) DEFAULT 'stable', -- 'increasing', 'stable', 'decreasing'
  incident_summary JSONB DEFAULT '{}'::jsonb,
  recurring_patterns JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '{}'::jsonb,
  audit_history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.20 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id VARCHAR(100) UNIQUE NOT NULL,
  recipient_org VARCHAR(255) NOT NULL,
  recipient_role VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'CREATED',
  priority VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ,
  related_route VARCHAR(255),
  shipment_id VARCHAR(100),
  batch_id VARCHAR(100)
);

-- 3.21 System & High-Priority Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity VARCHAR(50) NOT NULL, -- 'critical', 'warning', 'info'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  shipment_id VARCHAR(100) REFERENCES public.shipments(id) ON DELETE CASCADE,
  issue_type VARCHAR(100),
  batch_number VARCHAR(100),
  is_acknowledged BOOLEAN DEFAULT FALSE
);

-- 3.22 Reports Summary
CREATE TABLE IF NOT EXISTS public.reports (
  id VARCHAR(100) PRIMARY KEY, -- e.g. REP-2026-1029
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  date_range VARCHAR(100) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  format VARCHAR(20) NOT NULL, -- 'pdf', 'csv'
  file_size VARCHAR(50),
  file_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3.23 Blockchain On-Chain Records
CREATE TABLE IF NOT EXISTS public.blockchain_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network VARCHAR(100) DEFAULT 'Polygon Enterprise / Hyperledger Besu',
  block_number INT NOT NULL,
  tx_hash VARCHAR(100) UNIQUE NOT NULL,
  contract_address VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  merkle_root VARCHAR(100) NOT NULL,
  manufacturer_signer VARCHAR(100) NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'Confirmed',
  gas_used VARCHAR(50),
  explorer_url TEXT
);

-- ============================================================================
-- 4. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shipments_supplier ON public.shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_risk_score ON public.shipments(risk_score);
CREATE INDEX IF NOT EXISTS idx_shipments_batch ON public.shipments(batch_number);

CREATE INDEX IF NOT EXISTS idx_supply_chain_events_shipment ON public.supply_chain_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_hash ON public.supply_chain_events(current_hash);

CREATE INDEX IF NOT EXISTS idx_temp_logs_shipment ON public.temperature_logs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_temp_logs_breach ON public.temperature_logs(is_breach);

CREATE INDEX IF NOT EXISTS idx_inventory_org ON public.inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON public.inventory(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_serial ON public.inventory(serial_number);

CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.regulatory_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.regulatory_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_store ON public.regulatory_incidents(store_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_org, recipient_role);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hologram_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hologram_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_scan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_records ENABLE ROW LEVEL SECURITY;

-- 5.1 Public Access Policies (For QR Scanning / Patient Authenticity Checks)
DO $$ BEGIN
  CREATE POLICY "Public Read Access to Medicines Catalog"
    ON public.medicines FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Access to Hologram References"
    ON public.hologram_references FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Access to Blockchain Records"
    ON public.blockchain_records FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5.2 Authenticated Profile Policies
DO $$ BEGIN
  CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5.3 Supply Chain & Operations Policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view shipments"
    ON public.shipments FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view events"
    ON public.supply_chain_events FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert hologram check logs"
    ON public.hologram_checks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view hologram check logs"
    ON public.hologram_checks FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view inventory"
    ON public.inventory FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert or update inventory"
    ON public.inventory FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5.4 Regulatory & Incident Policies
DO $$ BEGIN
  CREATE POLICY "Regulators and Admins full access to Incidents"
    ON public.regulatory_incidents FOR ALL USING (
      auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Regulators and Admins full access to Regulatory Cases"
    ON public.regulatory_cases FOR ALL USING (
      auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 6. AUTOMATED TRIGGERS FOR TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_organizations ON public.organizations;
CREATE TRIGGER set_timestamp_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_medicines ON public.medicines;
CREATE TRIGGER set_timestamp_medicines
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_batches ON public.batches;
CREATE TRIGGER set_timestamp_batches
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_shipments ON public.shipments;
CREATE TRIGGER set_timestamp_shipments
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_inventory ON public.inventory;
CREATE TRIGGER set_timestamp_inventory
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_incidents ON public.regulatory_incidents;
CREATE TRIGGER set_timestamp_incidents
  BEFORE UPDATE ON public.regulatory_incidents
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_cases ON public.regulatory_cases;
CREATE TRIGGER set_timestamp_cases
  BEFORE UPDATE ON public.regulatory_cases
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- ============================================================================
-- 7. INITIAL SAMPLE SEED DATA
-- ============================================================================

INSERT INTO public.medicines (gtin, name, generic_name, category, dosage_form, safe_temp_min, safe_temp_max, patient_guide)
VALUES 
  ('08901234567890', 'Covishield Vaccine', 'ChAdOx1 nCoV-19', 'Vaccine', 'Injectable', 2.0, 8.0, '{"safetyStatus": "Safe", "plainEnglishSummary": "Genuine certified COVID-19 vaccine.", "howToTake": "Administered by healthcare professional.", "storageAdvice": "Refrigerate between 2C and 8C.", "safeExpiryLabel": "Expires Oct 2027", "genuinePackagingTip": "Check holographic security seal on box."}'::jsonb),
  ('08901234567891', 'Augmentin 625 Duo', 'Amoxicillin & Potassium Clavulanate', 'Antibiotics', 'Tablet', 15.0, 25.0, '{"safetyStatus": "Safe", "plainEnglishSummary": "Genuine broad-spectrum antibiotic.", "howToTake": "Take 1 tablet twice daily after meals.", "storageAdvice": "Store in a cool dry place below 25C.", "safeExpiryLabel": "Expires May 2028", "genuinePackagingTip": "Verify silver embossed GS1 barcode."}'::jsonb),
  ('08901234567892', 'Insulin Glargine (Lantus)', 'Insulin Glargine', 'Endocrinology', 'Subcutaneous Injection', 2.0, 8.0, '{"safetyStatus": "Safe", "plainEnglishSummary": "Long-acting human insulin analogue.", "howToTake": "Inject once daily at same time.", "storageAdvice": "Keep refrigerated 2C-8C. Do not freeze.", "safeExpiryLabel": "Expires Dec 2026", "genuinePackagingTip": "Scan micro-hologram sticker on vial."}'::jsonb)
ON CONFLICT (gtin) DO NOTHING;
