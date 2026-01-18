-- Seed Products for Inner Wealth Initiate Funnel
-- Run after 001_initial_schema.sql

-- ============================================
-- PRODUCTS
-- ============================================

INSERT INTO products (slug, name, description, price_cents, product_type, thumbnail_url, sort_order) VALUES
(
  'resistance-mapping-guide',
  'Resistance Mapping Guide™ - Expanded 2nd Edition',
  'The complete guide to uncovering what has been running your inner life, and where to aim the light. Includes the 5-Phase Mapping System, printable worksheets, guided practices, and bonus mini-course.',
  700, -- $7.00
  'main',
  '/images/Products/hero-product.png',
  1
),
(
  'golden-thread-technique',
  'Golden Thread Technique (Advanced)',
  'Advanced technique for tracing resistance patterns to their origin point. The most direct path to understanding ''where it all began''.',
  200, -- $2.00
  'order_bump',
  NULL,
  2
),
(
  'pathless-path',
  'The Pathless Path™ - Flagship Program',
  'Complete inner architecture rebuild. Where Resistance Mapping reveals what is running, The Pathless Path™ retrains where it is running from. Includes Past Life & Ancestral Regression, Subconscious Reprogramming, Nervous System Training, Body Release, and Integration Sessions.',
  14700, -- $147.00
  'upsell',
  NULL,
  3
),
(
  'nervous-system-reset',
  'Nervous System Reset Kit™',
  'A focused extraction from The Pathless Path. Everything you need to stabilize your nervous system in 10 minutes a day. Includes guided sessions, somatic protocols, emergency reset plan, and progress tracker.',
  4700, -- $47.00
  'downsell',
  NULL,
  4
),
(
  'bridge-to-mastery',
  'Bridge to Mastery™ - Personal Guidance',
  '8-week formative personal guidance program. Personal 1-on-1 support to bridge the gap between intellectual understanding and embodied transformation.',
  0, -- Discovery call, no upfront price
  'upsell',
  NULL,
  5
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  product_type = EXCLUDED.product_type,
  thumbnail_url = EXCLUDED.thumbnail_url,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- MODULES for Resistance Mapping Guide
-- ============================================

INSERT INTO modules (product_id, slug, title, description, sort_order) VALUES
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'getting-started',
  'Getting Started',
  'Welcome and orientation to the Resistance Mapping system.',
  1
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'the-five-phases',
  'The 5-Phase Mapping System',
  'The core framework for uncovering and mapping your resistance patterns.',
  2
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'guided-practices',
  'Guided Practices',
  'Quick Run and Deep Run practices for daily use.',
  3
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'worksheets-trackers',
  'Worksheets & Trackers',
  'Printable resources to support your mapping practice.',
  4
),
(
  (SELECT id FROM products WHERE slug = 'resistance-mapping-guide'),
  'mini-course',
  'Bonus: Mini-Course',
  'Walk through different layers of mind where blocks and beliefs are hiding.',
  5
)
ON CONFLICT (product_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- LESSONS for Getting Started Module
-- ============================================

INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order, is_free_preview) VALUES
(
  (SELECT id FROM modules WHERE slug = 'getting-started' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'welcome',
  'Welcome to Resistance Mapping',
  'An introduction to what you will learn and how to get the most from this guide.',
  'video',
  300, -- 5 minutes
  1,
  true -- Free preview
),
(
  (SELECT id FROM modules WHERE slug = 'getting-started' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'how-to-use',
  'How to Use This Guide',
  'Practical guidance on navigating the materials and setting up your practice.',
  'video',
  420, -- 7 minutes
  2,
  false
),
(
  (SELECT id FROM modules WHERE slug = 'getting-started' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'the-guide-pdf',
  'Download: The Complete Guide',
  'The full Resistance Mapping Guide PDF - Expanded 2nd Edition.',
  'download',
  NULL,
  3,
  false
)
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  duration_seconds = EXCLUDED.duration_seconds,
  sort_order = EXCLUDED.sort_order,
  is_free_preview = EXCLUDED.is_free_preview;

-- ============================================
-- LESSONS for The Five Phases Module
-- ============================================

INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'the-five-phases' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'phase-1-recognition',
  'Phase 1: Recognition',
  'Learning to recognize when resistance is present.',
  'video',
  600, -- 10 minutes
  1
),
(
  (SELECT id FROM modules WHERE slug = 'the-five-phases' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'phase-2-sensation',
  'Phase 2: Sensation',
  'Dropping from thought into felt experience.',
  'video',
  720, -- 12 minutes
  2
),
(
  (SELECT id FROM modules WHERE slug = 'the-five-phases' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'phase-3-origin',
  'Phase 3: Origin',
  'Tracing the pattern to its source.',
  'video',
  840, -- 14 minutes
  3
),
(
  (SELECT id FROM modules WHERE slug = 'the-five-phases' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'phase-4-integration',
  'Phase 4: Integration',
  'Allowing what was resisted to be felt fully.',
  'video',
  660, -- 11 minutes
  4
),
(
  (SELECT id FROM modules WHERE slug = 'the-five-phases' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'phase-5-release',
  'Phase 5: Release',
  'The natural dissolution that follows integration.',
  'video',
  540, -- 9 minutes
  5
)
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  duration_seconds = EXCLUDED.duration_seconds,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- LESSONS for Guided Practices Module
-- ============================================

INSERT INTO lessons (module_id, slug, title, description, content_type, duration_seconds, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'guided-practices' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'quick-run',
  'Quick Run Practice (15 min)',
  'A condensed practice for daily use when time is limited.',
  'audio',
  900, -- 15 minutes
  1
),
(
  (SELECT id FROM modules WHERE slug = 'guided-practices' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'deep-run',
  'Deep Run Practice (45 min)',
  'The full practice for deeper exploration and integration.',
  'audio',
  2700, -- 45 minutes
  2
)
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  duration_seconds = EXCLUDED.duration_seconds,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- LESSONS for Worksheets Module
-- ============================================

INSERT INTO lessons (module_id, slug, title, description, content_type, sort_order) VALUES
(
  (SELECT id FROM modules WHERE slug = 'worksheets-trackers' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'mapping-worksheet',
  'Resistance Mapping Worksheet',
  'The core worksheet for documenting your mapping sessions.',
  'download',
  1
),
(
  (SELECT id FROM modules WHERE slug = 'worksheets-trackers' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'progress-tracker',
  '30-Day Progress Tracker',
  'Track your daily practice and notice patterns over time.',
  'download',
  2
),
(
  (SELECT id FROM modules WHERE slug = 'worksheets-trackers' AND product_id = (SELECT id FROM products WHERE slug = 'resistance-mapping-guide')),
  'pattern-journal',
  'Pattern Recognition Journal',
  'A structured journal for deeper pattern recognition.',
  'download',
  3
)
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- MODULES for The Pathless Path
-- ============================================

INSERT INTO modules (product_id, slug, title, description, sort_order) VALUES
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'foundation',
  'Foundation: The Inner Architecture',
  'Understanding the layers of your inner system and how they interconnect.',
  1
),
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'past-life-ancestral',
  'Past Life & Ancestral Regression',
  'Accessing the deeper origins of current patterns.',
  2
),
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'subconscious-reprogramming',
  'Subconscious & Mental Reprogramming',
  'Retraining the automatic mind.',
  3
),
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'nervous-system',
  'Nervous System Training',
  'Building capacity and resilience in the body.',
  4
),
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'body-release',
  'Body Release Work',
  'Somatic practices for releasing stored tension.',
  5
),
(
  (SELECT id FROM products WHERE slug = 'pathless-path'),
  'integration',
  'Integration & Embodiment',
  'Bringing all layers together into lived experience.',
  6
)
ON CONFLICT (product_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- MODULES for Nervous System Reset Kit
-- ============================================

INSERT INTO modules (product_id, slug, title, description, sort_order) VALUES
(
  (SELECT id FROM products WHERE slug = 'nervous-system-reset'),
  'quick-start',
  'Quick Start Guide',
  'Get started with nervous system regulation in under 10 minutes.',
  1
),
(
  (SELECT id FROM products WHERE slug = 'nervous-system-reset'),
  'reset-sessions',
  'Guided Reset Sessions',
  'Complete guided sessions for nervous system reset.',
  2
),
(
  (SELECT id FROM products WHERE slug = 'nervous-system-reset'),
  'somatic-protocols',
  'Somatic Body Release Protocol',
  'Step-by-step somatic practices.',
  3
),
(
  (SELECT id FROM products WHERE slug = 'nervous-system-reset'),
  'emergency-tools',
  'Emergency Tools',
  'The Trigger-to-Reset plan and other emergency resources.',
  4
)
ON CONFLICT (product_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
