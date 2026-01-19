-- Update Resistance Mapping Guide course structure
-- This replaces the previous module/lesson structure with the new layout

-- ============================================
-- DELETE EXISTING LESSONS AND MODULES
-- ============================================

-- First delete lessons (they reference modules)
DELETE FROM lessons
WHERE module_id IN (
  SELECT id FROM modules
  WHERE product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')
);

-- Then delete modules
DELETE FROM modules
WHERE product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide');

-- ============================================
-- NEW MODULES for Resistance Mapping Guide
-- ============================================

INSERT INTO modules (product_id, slug, title, description, sort_order) VALUES
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'fixing-a-broken-map',
  'Fixing a Broken Map',
  'Module 1: Introduction to your transformation journey.',
  1
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'surface-level-traps',
  'Surface Level Traps',
  'Module 2: Identifying and understanding surface level resistance patterns.',
  2
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'the-egos-labyrinth',
  'The Ego''s Labyrinth',
  'Module 3: Navigating the deeper layers of ego-based resistance.',
  3
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'the-final-veil',
  'The Final Veil',
  'Module 4: Uncovering what lies beneath the final layer of resistance.',
  4
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'completing-the-map',
  'Completing the Map',
  'Module 5: Bringing everything together to complete your resistance map.',
  5
);

-- ============================================
-- NEW LESSONS for Each Module
-- ============================================

-- Module 1: Fixing a Broken Map
INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order, is_free_preview) VALUES
(
  (SELECT id FROM modules WHERE slug = 'fixing-a-broken-map' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'welcome-to-your-transformation',
  'Welcome to your transformation',
  'Begin your journey into resistance mapping.',
  'video',
  NULL,
  1,
  true
);

-- Module 2: Surface Level Traps
INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'surface-level-traps' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'surface-level-traps-lesson',
  'Surface Level Traps',
  'Learn to identify the surface level traps that keep you stuck.',
  'video',
  NULL,
  1
);

-- Module 3: The Ego's Labyrinth
INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'the-egos-labyrinth' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'the-egos-labyrinth-lesson',
  'The Ego''s Labyrinth',
  'Navigate through the complex maze of ego-based resistance.',
  'video',
  NULL,
  1
);

-- Module 4: The Final Veil
INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'the-final-veil' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'the-final-veil-lesson',
  'The Final Veil',
  'Discover what lies beneath the final layer of resistance.',
  'video',
  NULL,
  1
);

-- Module 5: Completing the Map
INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'completing-the-map' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'completing-the-map-lesson',
  'Completing the Map',
  'Bring everything together to complete your resistance map.',
  'video',
  NULL,
  1
);
