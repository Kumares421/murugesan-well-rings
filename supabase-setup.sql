-- ============================================================
-- MgWellRings: Supabase Setup Script
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS materials (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  "desc"      TEXT,
  meta        TEXT,
  tag         TEXT,
  icon        TEXT DEFAULT 'fas fa-info-circle',
  img_url     TEXT DEFAULT 'logo.png',
  category    TEXT NOT NULL DEFAULT 'materials-only',
  price       NUMERIC DEFAULT 500,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  "desc"      TEXT,
  meta        TEXT,
  img_url     TEXT DEFAULT 'logo.png',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  "desc"      TEXT,
  meta        TEXT,
  img_url     TEXT DEFAULT 'logo.png',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS slideshow (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT,
  "desc"      TEXT,
  meta        TEXT,
  img_url     TEXT DEFAULT 'logo.png',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
-- ============================================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE services  ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshow ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Public Read
-- ============================================================

CREATE POLICY "Public can read materials"
  ON materials FOR SELECT
  USING (true);

CREATE POLICY "Public can read projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Public can read services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Public can read slideshow"
  ON slideshow FOR SELECT
  USING (true);

-- 4. RLS Policies: Admin-Only Write (Insert, Update, Delete)
--    Only authenticated users can modify data
-- ============================================================

-- Materials write policies
DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
DROP POLICY IF EXISTS "Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON materials;

CREATE POLICY "Admins can insert materials" ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update materials" ON materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete materials" ON materials FOR DELETE USING (auth.role() = 'authenticated');

-- Projects write policies
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Admins can insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- Services write policies
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;

CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update services" ON services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete services" ON services FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Create Public Storage Bucket for images
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;

-- Storage Policies: anyone can view, authenticated users can upload/update/delete
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

-- 6. Seed Default Data
-- ============================================================

INSERT INTO materials (title, "desc", meta, tag, icon, img_url, category) VALUES
  ('Standard 3ft Well Ring', 'Ideal for residential drinking water wells and rainwater harvesting pits.', '3ft Inner dia x 1ft height', '3 Feet Diameter', 'fas fa-ruler-combined', 'logo.png', 'materials-only'),
  ('Standard 4ft Well Ring', 'Heavy duty ring designed for agricultural and high-volume commercial wells.', '4ft Inner dia x 1ft height', '4 Feet Diameter', 'fas fa-ruler-combined', 'logo.png', 'materials-only'),
  ('3ft Well Ring + Installation', 'Standard 3ft concrete ring package including manual digging, lowering, and safety alignment.', 'Material + Manual Digging', 'Digging + Supply', 'fas fa-tools', 'logo.png', 'installation'),
  ('4ft Well Ring + Installation', 'Complete commercial setup with 4ft rings, manual excavation, alignment support, and sandbed packing.', 'Material + Manual Digging', 'Digging + Supply', 'fas fa-tools', 'logo.png', 'installation');

INSERT INTO projects (title, "desc", meta, img_url) VALUES
  ('Residential Well Sinking', 'Completed 35ft manual digging and reinforcement setup for clean water retrieval.', 'Kovilpathagai, Chennai', 'logo.png'),
  ('Drainage Well Ring Installation', 'Supplied and lowered 20 heavy concrete rings for stormwater drainage systems.', 'Avadi, Chennai', 'logo.png');

INSERT INTO services (title, "desc", meta, img_url) VALUES
  ('Material Manufacturing', 'We manufacture reinforced concrete rings using premium cement and strong iron grids to prevent cracking.', '', 'logo.png'),
  ('Manual Digging', 'Traditional hands-on manual digging by seasoned experts, achieving perfect vertical alignment.', '', 'logo.png');

-- ============================================================
-- 7. Slideshow Table (Added for dynamic slideshow)
-- ============================================================
CREATE TABLE IF NOT EXISTS slideshow (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT,
  "desc"      TEXT,
  meta        TEXT,
  img_url     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE slideshow ENABLE ROW LEVEL SECURITY;

-- Public Read policy
CREATE POLICY "Public can read slideshow"
  ON slideshow FOR SELECT
  USING (true);

-- Admin Write policies
DROP POLICY IF EXISTS "Admins can insert slideshow" ON slideshow;
DROP POLICY IF EXISTS "Admins can update slideshow" ON slideshow;
DROP POLICY IF EXISTS "Admins can delete slideshow" ON slideshow;

CREATE POLICY "Admins can insert slideshow" ON slideshow FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update slideshow" ON slideshow FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete slideshow" ON slideshow FOR DELETE USING (auth.role() = 'authenticated');

-- Seed default slideshow slides
INSERT INTO slideshow (title, "desc", meta, img_url) VALUES
  ('Concrete Well Rings Yard', '', '', 'slide3.png'),
  ('Reinforced Concrete Rings Stack', '', '', 'slide4.png'),
  ('Concrete Fencing Posts', '', '', 'slide5.png'),
  ('Concrete Well Covers', '', '', 'slide6.png'),
  ('Deep Well Sinking Site', '', '', 'slide7.jpg');

-- Ensure price column exists if table was created previously
ALTER TABLE materials ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 500;

-- 8. Customer Profiles & Cart Sync Table
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  email       TEXT PRIMARY KEY,
  name        TEXT,
  phone       TEXT,
  place       TEXT,
  photo       TEXT,
  cart        JSONB DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Public insert customer_profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Public update customer_profiles" ON customer_profiles;

CREATE POLICY "Public select customer_profiles" ON customer_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert customer_profiles" ON customer_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update customer_profiles" ON customer_profiles FOR UPDATE USING (true);


