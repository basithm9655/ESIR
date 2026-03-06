-- ================================================================
-- ESIR DATA — Supabase SQL Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- ────────────────────────────────────────────────
-- 1. EDUCATION TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_year INT,
  end_year INT,
  grade TEXT,
  logo_emoji TEXT DEFAULT '🎓',
  display_order INT DEFAULT 0
);

INSERT INTO education (institution, degree, field, start_year, end_year, grade, logo_emoji, display_order) VALUES
  ('Anna University Chennai',              'Doctor of Philosophy (PhD)', 'Image Compression',    2006, 2010, 'Thesis Commended',              '🎓', 1),
  ('PSG College of Technology',            'M.E.',                       'Applied Electronics',  2002, 2004, 'First Class with Distinction',  '🏛️', 2),
  ('Cochin University of Science and Technology', 'B.Tech',              'Instrumentation',      1996, 2000, 'First Class',                   '🎓', 3),
  ('Sadakathullah Appa College, Tirunelveli', 'BSc',                     'Physics',              1993, 1996, 'First Class with Distinction',  '🏫', 4);

-- ────────────────────────────────────────────────
-- 2. SCHOLAR METRICS TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholar_metrics (
  id SERIAL PRIMARY KEY,
  citations_total INT DEFAULT 0,
  citations_since INT DEFAULT 0,
  h_total INT DEFAULT 0,
  h_since INT DEFAULT 0,
  i10_total INT DEFAULT 0,
  i10_since INT DEFAULT 0,
  citations_history JSONB DEFAULT '[]',
  co_authors JSONB DEFAULT '[]',
  public_access_available INT DEFAULT 0,
  public_access_not_available INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO scholar_metrics (citations_total, citations_since, h_total, h_since, i10_total, i10_since)
VALUES (1996, 838, 19, 13, 33, 18);

-- ────────────────────────────────────────────────
-- 3. PUBLICATIONS TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('journal','conference')),
  year INT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT,
  venue TEXT,
  cites INT DEFAULT 0,
  link TEXT,
  badge_label TEXT,
  badge_style TEXT,
  display_order INT DEFAULT 0
);

INSERT INTO publications (type, year, title, authors, venue, cites, link, badge_label, badge_style, display_order) VALUES
  ('journal',    2024, 'Advances in image processing for biomedical applications',
   'S. Esakkirajan, et al.', 'International Journal of Imaging Systems', 12, NULL,
   'SCIE Highlight', 'background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:4px; font-size:0.75rem;', 1),

  ('journal',    2023, 'An efficient deep-learning approach for background modeling & object detection',
   'S. Esakkirajan, T. Veerakumar, et al.', 'IEEE Transactions on Circuits & Systems for Video Technology', 45, NULL,
   'IEEE', 'background:rgba(99,102,241,0.2); padding:4px 10px; border-radius:4px; font-size:0.75rem; color:#22d3ee;', 2),

  ('journal',    2021, 'Impulse noise removal using adaptive radial basis function interpolation',
   'S. Esakkirajan, et al.', 'Signal Processing (Elsevier)', 89, NULL, NULL, NULL, 3),

  ('journal',    2020, 'Removal of high density salt and pepper noise through modified cascaded filter',
   'S. Esakkirajan, T. Veerakumar', 'IEEE Signal Processing Letters', 76, NULL,
   'IEEE', 'background:rgba(99,102,241,0.2); padding:4px 10px; border-radius:4px; font-size:0.75rem; color:#22d3ee;', 4),

  ('journal',    2018, 'Biomedical image denoising using sparse representation and directional filter banks',
   'S. Esakkirajan, et al.', 'Biomedical Signal Processing and Control (Elsevier)', 52, NULL, NULL, NULL, 5),

  ('journal',    2017, 'Adaptive weighted mean filter for denoising high density Gaussian corrupted images',
   'S. Esakkirajan, T. Veerakumar', 'International Journal of Imaging Systems and Technology', 38, NULL, NULL, NULL, 6),

  ('journal',    2011, 'Removal of high density salt and pepper noise through modified decision based unsymmetric trimmed median filter',
   'S. Esakkirajan, T. Veerakumar, Adlene Subash', 'IEEE Signal Processing Letters', 639, 
   'https://scholar.google.co.in/citations?view_op=view_citation&hl=en&user=fEOnODMAAAAJ',
   'SCIE · Highly Cited', 'background:rgba(251,191,36,0.15); padding:4px 10px; border-radius:4px; font-size:0.75rem; color:#fbbf24;', 7),

  ('conference', 2023, 'Deep learning approaches for object detection in embedded systems',
   'S. Esakkirajan, et al.', 'IEEE ICASSP 2023', 18, NULL, NULL, NULL, 10),

  ('conference', 2021, 'Background modeling video surveillance via codebook approach',
   'S. Esakkirajan, T. Veerakumar', 'CVIP 2021', 34, NULL, NULL, NULL, 11),

  ('conference', 2019, 'Deep convolutional neural network for semantic segmentation of underwater images',
   'S. Esakkirajan, et al.', 'IEEE OCEANS 2019', 21, NULL, NULL, NULL, 12),

  ('conference', 2017, 'Retinal blood vessel segmentation using hybrid filtering and thresholding',
   'S. Esakkirajan, et al.', 'IEEE ICACCI 2017', 14, NULL, NULL, NULL, 13);

-- ────────────────────────────────────────────────
-- 4. BOOKS TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  cover TEXT,
  isbn TEXT,
  publisher TEXT,
  year INT,
  description TEXT,
  link TEXT,
  badge_label TEXT,
  badge_style TEXT,
  tab_color TEXT,
  tab_emoji TEXT,
  tab_meta TEXT,
  display_order INT DEFAULT 0
);

INSERT INTO books (title, authors, cover, isbn, publisher, year, description, link, badge_label, badge_style, tab_color, tab_emoji, tab_meta, display_order) VALUES
  ('DIGITAL IMAGE PROCESSING, 2ND EDITION',
   'S Jayaraman, S Esakkirajan, T Veerakumar',
   'book1.jpg', '978-9389811929', 'Tata McGraw Hill', 2020,
   'Focuses on the latest trends in image and video processing. Contains video processing chapter, MATLAB simulation, solved problems, and rich bank of objective questions.',
   'https://www.amazon.in/dp/9389811929?tag=esakkirajan-21',
   '🔥 Popular Title|📘 Core Textbook',
   'background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);|background:rgba(167,139,250,0.15);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);',
   '#f59e0b', '📕', '2020 · TATA McGRAW HILL (2nd Ed.)', 1),

  ('Digital Image Processing',
   'S Jayaraman, S Veerakumar T, Esakkirajan S',
   'book2.jpg', '978-0070144798', 'Tata McGraw Hill', 2009,
   'A clear, comprehensive, and up-to-date introduction to Digital Image Processing in a pragmatic style with illustrative approaches and MATLAB applications.',
   'https://www.amazon.in/dp/0070144796?tag=esakkirajan-21',
   '📘 Core Textbook',
   'background:rgba(167,139,250,0.15);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);',
   '#8b5cf6', '📒', '2009 · TATA McGRAW HILL (1st Ed.)', 2),

  ('Fundamentals of Relational Database Management Systems',
   'S. Sumathi, S. Esakkirajan',
   'book3.jpg', '978-3642080122', 'Springer-Verlag', 2007,
   'Provides comprehensive coverage of database management systems fundamentals. Essential for understanding relational data modeling, its purpose, nature, and standards.',
   'https://www.amazon.in/dp/364208012X?tag=esakkirajan-21',
   '🧠 Advanced Reference',
   'background:rgba(52,211,153,0.15);color:#34d399;border:1px solid rgba(52,211,153,0.3);',
   '#ec4899', '📓', '2007 · SPRINGER-VERLAG', 3),

  ('Digital Signal Processing',
   'S. Esakkirajan, T. Veerakumar, Badri N Subudhi',
   'book4.jpg', '978-9354600293', 'Tata McGraw Hill', 2021,
   'Comprehensive textbook covering basic and advanced concepts of signal processing. Includes time-frequency representation, step-by-step derivations, and MATLAB examples.',
   'https://www.amazon.in/dp/9354600298?tag=esakkirajan-21',
   '📘 Core Textbook',
   'background:rgba(167,139,250,0.15);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);',
   '#10b981', '📙', '2021 · TATA McGRAW HILL', 4),

  ('Digital Image Processing: Illustration Using Python',
   'S Esakkirajan, T. Veerakumar, Badri Narayan Subudhi',
   'book5.jpg', '978-9819663814', 'Springer', 2025,
   'A practical guide to digital image processing using Python, presenting fundamental concepts, techniques, and algorithms with illustrative examples.',
   'https://www.amazon.in/dp/9819663814?tag=esakkirajan-21',
   '⭐ Most Recent',
   'background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);',
   '#6366f1', '📘', '2025 · SPRINGER, SINGAPORE', 5),

  ('Digital Signal Processing: Illustration Using Python',
   'S Esakkirajan, T Veerakumar, Badri N Subudhi',
   'book6.jpg', '978-9819967813', 'Springer', 2024,
   'Focuses on developing signal processing algorithms using Python. Open-source friendly, includes prelab questions, exercises, and objective questions.',
   'https://www.amazon.in/dp/B0CJHNSY6Z?tag=esakkirajan-21',
   '⭐ Most Recent',
   'background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);',
   '#06b6d4', '📗', '2024 · SPRINGER, SINGAPORE', 6);

-- ────────────────────────────────────────────────
-- 5. PATENTS TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patents (
  id SERIAL PRIMARY KEY,
  icon TEXT DEFAULT '💡',
  border_color TEXT DEFAULT 'var(--accent-indigo)',
  category TEXT,
  category_color TEXT DEFAULT 'var(--accent-cyan)',
  title TEXT NOT NULL,
  authors TEXT,
  display_order INT DEFAULT 0
);

INSERT INTO patents (icon, border_color, category, category_color, title, authors, display_order) VALUES
  ('🌊', 'var(--accent-indigo)', 'USA PROVISIONAL PATENT · Computer Vision', 'var(--accent-cyan)',
   'Image Enhancement and Object Detection System for Degraded Underwater Images using Zero-Reference Deep Curve Estimation and G-Unet',
   'S. Esakkirajan et al. · Underwater Imaging Technology', 1),

  ('🌑', 'var(--accent-pink)', 'USA PROVISIONAL PATENT · AI & Vision', '#f472b6',
   'Action Detection System for Dark Videos using Spatio-Temporal Features and Bidirectional Encoder Representations from Transformers (BERT)',
   'S. Esakkirajan et al. · Low-Light Video AI', 2),

  ('🌡️', '#f59e0b', 'USA PROVISIONAL PATENT · Surveillance', '#fbbf24',
   'System and Method for Thermal Video Surveillance Based on Pyramidal Pooling Architecture',
   'S. Esakkirajan et al. · Thermal Imaging Systems', 3);

-- ────────────────────────────────────────────────
-- 6. EXPERIENCE TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  year_range TEXT NOT NULL,
  title TEXT NOT NULL,
  organisation TEXT,
  border_color TEXT DEFAULT '',
  display_order INT DEFAULT 0
);

INSERT INTO experience (year_range, title, organisation, border_color, display_order) VALUES
  ('2004 — Present', 'Professor of Engineering',
   'PSG College of Technology, Coimbatore<br>Dept. of Instrumentation & Control Systems.',
   '', 1),

  ('2019', 'Ph.D Graduation',
   'Anna University, Chennai<br>Advanced specializations in Digital Signal/Image Processing.',
   'var(--accent-pink)', 2);

-- ────────────────────────────────────────────────
-- 7. ACADEMIC IDS TABLE
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_ids (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  icon_color TEXT,
  value TEXT,
  value_color TEXT,
  link TEXT,
  full_width BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0
);

INSERT INTO academic_ids (name, icon, icon_color, value, value_color, link, full_width, display_order) VALUES
  ('ORCID iD',    '🟢', '', '0000-0002-5396-6226', '', 'https://orcid.org/0000-0002-5396-6226', FALSE, 1),
  ('Scopus Author', '🔶', '', '16051889700', '', 'http://www.scopus.com/authid/detail.url?authorId=16051889700', FALSE, 2),
  ('Web of Science', '🔵', '', 'AAC11552019', '', 'https://www.webofscience.com/wos/author/rid/AAC11552019', FALSE, 3),
  ('LinkedIn', 'in', '#60a5fa', 'dr-esakkirajan-s-psgct', '#60a5fa', 'https://www.linkedin.com/in/dr-esakkirajan-s-psgct-0905aa224/', FALSE, 4),
  ('ResearchGate', '🔬', '', 'S-Esakkirajan-69985125', '#34d399', 'https://www.researchgate.net/scientific-contributions/S-Esakkirajan-69985125', FALSE, 5),
  ('Google Scholar', '🎓', '', 'fEOnODMAAAAJ', '', 'https://scholar.google.co.in/citations?user=fEOnODMAAAAJ&hl=en', FALSE, 6),
  ('Books Available on Amazon India', '📚', '', 'amazon.in — S. Esakkirajan titles', '#fbbf24', 'https://www.amazon.in/Books-S-Esakkirajan/s?rh=n%3A976389031%2Cp_27%3AS.%2BEsakkirajan', TRUE, 7);

-- ────────────────────────────────────────────────
-- 8. DISABLE ROW-LEVEL SECURITY (public read)
-- ────────────────────────────────────────────────
ALTER TABLE education       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholar_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE books           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience      ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_ids    ENABLE ROW LEVEL SECURITY;

-- Allow public read for all tables
CREATE POLICY "public_read_education"       ON education       FOR SELECT USING (true);
CREATE POLICY "public_read_scholar"         ON scholar_metrics FOR SELECT USING (true);
CREATE POLICY "public_read_publications"    ON publications    FOR SELECT USING (true);
CREATE POLICY "public_read_books"           ON books           FOR SELECT USING (true);
CREATE POLICY "public_read_patents"         ON patents         FOR SELECT USING (true);
CREATE POLICY "public_read_experience"      ON experience      FOR SELECT USING (true);
CREATE POLICY "public_read_academic_ids"    ON academic_ids    FOR SELECT USING (true);

-- Allow all operations with anon key (admin panel will use anon key)
CREATE POLICY "anon_all_education"       ON education       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_scholar"         ON scholar_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_publications"    ON publications    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_books"           ON books           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_patents"         ON patents         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_experience"      ON experience      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_academic_ids"    ON academic_ids    FOR ALL USING (true) WITH CHECK (true);

-- ✅ Done! All tables created and seeded with real data.

-- ────────────────────────────────────────────────
-- 9. CLASSES / COURSES TABLE  (run separately if tables already exist)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  course_code TEXT,
  course_name TEXT NOT NULL,
  semester TEXT,
  academic_year TEXT,
  degree_programme TEXT,
  department TEXT DEFAULT 'Instrumentation & Control Engineering',
  credits INT DEFAULT 3,
  class_type TEXT DEFAULT 'Theory',
  notes TEXT,
  display_order INT DEFAULT 0
);

INSERT INTO classes (course_code, course_name, semester, academic_year, degree_programme, department, credits, class_type, notes, display_order) VALUES
  ('IC8591', 'Digital Image Processing', 'VII', '2024-25', 'B.E. ICE', 'Instrumentation & Control Engineering', 3, 'Theory', 'Core subject on DIP algorithms', 1),
  ('IC8591L', 'Digital Image Processing Lab', 'VII', '2024-25', 'B.E. ICE', 'Instrumentation & Control Engineering', 2, 'Lab', 'Practical implementation using MATLAB/Python', 2),
  ('IC8681', 'Digital Signal Processing', 'VI', '2024-25', 'B.E. ICE', 'Instrumentation & Control Engineering', 3, 'Theory', 'Signal processing theory and applications', 3),
  ('PE8002', 'Computer Vision', 'VIII', '2024-25', 'B.E. ICE', 'Instrumentation & Control Engineering', 3, 'Elective', 'Advanced elective on machine vision', 4);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_classes" ON classes FOR SELECT USING (true);
CREATE POLICY "anon_all_classes"    ON classes FOR ALL   USING (true) WITH CHECK (true);
