-- DM Automation System
-- Allows admins to configure automated direct messages triggered by various events

-- ============================================
-- DM AUTOMATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dm_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  -- Trigger types:
  -- 'welcome' - When a new member joins (profile created)
  -- 'purchase' - When any product is purchased
  -- 'purchase_specific' - When a specific product is purchased
  -- 'course_started' - When user starts their first lesson in a course
  -- 'course_progress_25' - When user reaches 25% completion
  -- 'course_progress_50' - When user reaches 50% completion
  -- 'course_progress_75' - When user reaches 75% completion
  -- 'course_completed' - When user completes all lessons in a course
  -- 'inactivity_7d' - No login for 7 days
  -- 'inactivity_14d' - No login for 14 days
  -- 'inactivity_30d' - No login for 30 days
  -- 'anniversary_30d' - 30 days since joining
  -- 'anniversary_90d' - 90 days since joining
  -- 'anniversary_1y' - 1 year since joining
  -- 'first_community_post' - When user makes their first community post

  trigger_config JSONB DEFAULT '{}',
  -- For 'purchase_specific': { "product_id": "uuid" }
  -- For course triggers: { "product_id": "uuid" } (optional, for specific course)

  message_template TEXT NOT NULL,
  -- Supports variables: {{member_name}}, {{member_first_name}}, {{product_name}}, {{progress_percent}}, {{days_since_join}}

  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- The admin who "sends" the message. If null, uses first admin.

  is_enabled BOOLEAN DEFAULT TRUE,
  delay_minutes INTEGER DEFAULT 0,
  -- Delay before sending (e.g., send welcome 5 minutes after signup)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_dm_automations_trigger_type ON dm_automations(trigger_type) WHERE is_enabled = TRUE;
CREATE INDEX idx_dm_automations_enabled ON dm_automations(is_enabled);

-- ============================================
-- DM AUTOMATION LOGS TABLE
-- Track which automations have been sent to which users
-- ============================================
CREATE TABLE IF NOT EXISTS dm_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES dm_automations(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
  trigger_data JSONB DEFAULT '{}',
  -- Stores context like product_id, progress_percent, etc.

  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'sent', 'failed', 'skipped'

  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dm_automation_logs_automation_id ON dm_automation_logs(automation_id);
CREATE INDEX idx_dm_automation_logs_recipient_id ON dm_automation_logs(recipient_id);
CREATE INDEX idx_dm_automation_logs_status ON dm_automation_logs(status) WHERE status = 'pending';
-- Unique constraint to prevent duplicate automations for same trigger
CREATE UNIQUE INDEX idx_dm_automation_logs_unique_trigger ON dm_automation_logs(automation_id, recipient_id, (trigger_data->>'context_key'))
  WHERE trigger_data->>'context_key' IS NOT NULL;

-- ============================================
-- CANNED RESPONSES TABLE
-- Pre-saved message templates for admins
-- ============================================
CREATE TABLE IF NOT EXISTS dm_canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  shortcut VARCHAR(50),
  -- Optional shortcut like "/welcome" to quickly insert

  category VARCHAR(100),
  -- For organizing: 'greeting', 'support', 'sales', 'followup'

  is_shared BOOLEAN DEFAULT TRUE,
  -- If true, all admins can use it. If false, only creator.

  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dm_canned_responses_category ON dm_canned_responses(category);
CREATE INDEX idx_dm_canned_responses_shortcut ON dm_canned_responses(shortcut) WHERE shortcut IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_dm_automations_updated_at
  BEFORE UPDATE ON dm_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_canned_responses_updated_at
  BEFORE UPDATE ON dm_canned_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE dm_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_canned_responses ENABLE ROW LEVEL SECURITY;

-- DM Automations: Admin only
CREATE POLICY "Admins can manage automations" ON dm_automations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Service role full access automations" ON dm_automations FOR ALL
  USING (auth.role() = 'service_role');

-- DM Automation Logs: Admin only
CREATE POLICY "Admins can view automation logs" ON dm_automation_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Service role full access automation logs" ON dm_automation_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Canned Responses: Admins can see shared + own, manage own
CREATE POLICY "Admins can view canned responses" ON dm_canned_responses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    AND (is_shared = TRUE OR created_by = auth.uid())
  );

CREATE POLICY "Admins can create canned responses" ON dm_canned_responses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update own canned responses" ON dm_canned_responses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins can delete own canned responses" ON dm_canned_responses FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    AND created_by = auth.uid()
  );

CREATE POLICY "Service role full access canned responses" ON dm_canned_responses FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SEED DEFAULT AUTOMATIONS (disabled by default)
-- ============================================
INSERT INTO dm_automations (name, description, trigger_type, message_template, is_enabled, delay_minutes)
VALUES
  (
    'Welcome Message',
    'Sent to new members when they first join',
    'welcome',
    E'Hey {{member_first_name}}! 👋\n\nWelcome to Inner Wealth Initiate! I''m so glad you''re here.\n\nIf you have any questions as you get started, just reply to this message - I''m here to help!\n\nWishing you an amazing journey ahead.',
    FALSE,
    5
  ),
  (
    'Purchase Thank You',
    'Sent when a member purchases any product',
    'purchase',
    E'{{member_first_name}}, thank you for your purchase of {{product_name}}! 🙏\n\nI''m excited for you to dive in. If you have any questions or need guidance, don''t hesitate to reach out.\n\nLet me know how it goes!',
    FALSE,
    2
  ),
  (
    'Course Completion Celebration',
    'Sent when a member completes all lessons in a course',
    'course_completed',
    E'Congratulations {{member_first_name}}! 🎉\n\nYou''ve completed {{product_name}}! That''s a huge accomplishment.\n\nI''d love to hear about your experience and any insights you''ve gained. How are you feeling?',
    FALSE,
    0
  ),
  (
    '7-Day Inactivity Check-in',
    'Sent when a member hasn''t logged in for 7 days',
    'inactivity_7d',
    E'Hey {{member_first_name}}, I noticed you haven''t been around lately.\n\nJust wanted to check in - is everything okay? If there''s anything I can help with or if you''re stuck on something, let me know!\n\nI''m here for you.',
    FALSE,
    0
  ),
  (
    'Progress Milestone (50%)',
    'Sent when a member reaches 50% course completion',
    'course_progress_50',
    E'Amazing progress {{member_first_name}}! 🌟\n\nYou''re halfway through {{product_name}}! How are you finding it so far?\n\nKeep up the great work - you''re doing fantastic!',
    FALSE,
    0
  );

-- Seed some default canned responses
INSERT INTO dm_canned_responses (title, content, shortcut, category, is_shared)
VALUES
  (
    'Quick Welcome',
    E'Welcome to the community! I''m here if you need anything.',
    '/welcome',
    'greeting',
    TRUE
  ),
  (
    'Check-in',
    E'Hey! Just checking in to see how you''re doing. Any questions?',
    '/checkin',
    'followup',
    TRUE
  ),
  (
    'Course Recommendation',
    E'Based on your progress, I think you''d really benefit from [COURSE NAME]. Would you like to learn more about it?',
    '/recommend',
    'sales',
    TRUE
  ),
  (
    'Support Response',
    E'Thanks for reaching out! I''m looking into this and will get back to you shortly.',
    '/support',
    'support',
    TRUE
  );
