-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table if it doesn't exist (without foreign key constraint for demo data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  specialty TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add username column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Create prompts table if it doesn't exist (using existing schema column names)
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to prompts table one by one in the correct order
DO $$
BEGIN
  -- Add specialty column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE prompts ADD COLUMN specialty TEXT;
  END IF;
  
  -- Add votes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'votes'
  ) THEN
    ALTER TABLE prompts ADD COLUMN votes INTEGER DEFAULT 0;
  END IF;
  
  -- Add created_by column if it doesn't exist (without foreign key constraint for demo data)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE prompts ADD COLUMN created_by UUID;
  END IF;
  
  -- Add is_anonymous column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE prompts ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_specialty ON prompts(specialty);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_votes ON prompts(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can read prompts" ON prompts;
DROP POLICY IF EXISTS "Authenticated users can create prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;

-- Create policies for user_profiles (allow reading all profiles for demo purposes)
CREATE POLICY "Anyone can read user profiles"
  ON user_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for prompts (allow public read access)
CREATE POLICY "Anyone can read prompts"
  ON prompts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = created_by) OR 
    (created_by IS NULL)
  );

CREATE POLICY "Users can update own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND created_by IS NOT NULL);

CREATE POLICY "Users can delete own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND created_by IS NOT NULL);

-- Create demo user UUIDs as variables for consistency
DO $$
DECLARE
  demo_user_1 UUID := uuid_generate_v4();
  demo_user_2 UUID := uuid_generate_v4();
  demo_user_3 UUID := uuid_generate_v4();
  demo_user_4 UUID := uuid_generate_v4();
  demo_user_5 UUID := uuid_generate_v4();
BEGIN
  -- Insert demo user profiles only if table is empty
  IF NOT EXISTS (SELECT 1 FROM user_profiles LIMIT 1) THEN
    INSERT INTO user_profiles (id, username, full_name, specialty, years_experience, bio) VALUES
      (demo_user_1, 'sarah_icu_rn', 'Sarah Johnson', 'ICU', 8, 'Critical care nurse with expertise in cardiac emergencies and post-operative care.'),
      (demo_user_2, 'michael_er_nurse', 'Michael Chen', 'Emergency Room', 12, 'Emergency medicine nurse specializing in trauma care and crisis intervention.'),
      (demo_user_3, 'emily_peds_rn', 'Emily Rodriguez', 'Pediatrics', 6, 'Pediatric nurse focused on family-centered care and child development.'),
      (demo_user_4, 'david_medsurg', 'David Thompson', 'Medical-Surgical', 15, 'Experienced med-surg nurse with a passion for patient education and care coordination.'),
      (demo_user_5, 'lisa_mh_nurse', 'Lisa Park', 'Mental Health', 10, 'Psychiatric nurse specializing in crisis intervention and therapeutic communication.');
  END IF;

  -- Insert built-in prompts only if prompts table is empty
  IF NOT EXISTS (SELECT 1 FROM prompts LIMIT 1) THEN
    INSERT INTO prompts (title, prompt_text, category, specialty, tags, difficulty_level, votes, created_by, is_anonymous) VALUES
      (
        'Code Blue Debrief Assistant',
        'Act as my Code Blue debrief assistant. I''ve just participated in a code, and I need help grounding myself so I can focus and document what happened accurately. Start by walking me through a short mindfulness moment (no more than 30 seconds) to help me slow down and breathe.

Then, based on common post-code documentation standards, give me a general checklist of what I may need to include in my documentation. Please do not include or request any names, hospital names, facility identifiers, or personal health information.

Here''s what I need a reminder for:
• Date and exact time the code started and ended (24-hr format)
• Where the code occurred (unit, general location—not facility name)
• Whether it was witnessed or unwitnessed
• Initial rhythm identified (e.g., asystole, V-fib, PEA)
• Airway management: oxygen use, intubation, bagging, suctioning
• IV/IO access initiation (site, time, fluid/meds given)
• Medications administered (time, dose, route—no brand names)
• Defibrillation use: number of attempts, joules used
• Total CPR time and compressions
• Return of spontaneous circulation (ROSC? Y/N)
• Who was leading the code (role only—no names)
• Outcome: transfer, continued care, or time of death
• Any documentation forms that must be completed per policy

End with one final grounding reflection or affirmation to help me close this mentally before moving on.',
        'Code Blue Debrief',
        'icu',
        ARRAY['code-blue', 'documentation', 'mindfulness', 'professional-development'],
        'intermediate',
        24,
        NULL,
        false
      ),
      (
        'Post-Shift Reset Coach',
        'Act as my post-shift reset coach. Guide me through one slow 4-7-8 breath.

Then ask me:
• How tense is my body right now? (1–10)
• Which emotion is strongest?
• One good thing that happened today?

Suggest two quick, personalized resets based on what you know about me—examples: an upbeat song on the drive, a neck-stretch, hydrating, a one-line gratitude note, or texting a friend.

Close with a calming affirmation.',
        'Burnout Self-Check',
        'med-surg',
        ARRAY['self-care', 'mindfulness', 'stress-management', 'emotional-wellness'],
        'beginner',
        42,
        NULL,
        false
      ),
      (
        'Mental Report Prep Partner',
        'Act as my mental report prep partner. I''m about to give handoff, and I just want to make sure I''ve covered all the important pieces.

Use SBAR format to help me organize my thoughts—but keep it quick and casual. Prompt me to think through:
• What''s going on with the patient
• What''s already been done
• What I observed
• What needs to happen next

Also remind me to check for:
• Priority concerns or changes in status
• Any pending labs, meds, or follow-ups
• Discharges, consults, or new orders
• Safety, pain, or psychosocial updates

Don''t include names, room numbers, or identifying info—just help me feel calm and ready before I speak.',
        'Shift Report Prep',
        'er',
        ARRAY['sbar', 'handoff-communication', 'patient-safety', 'organization'],
        'intermediate',
        31,
        NULL,
        false
      ),
      (
        'Clinical Decision Partner',
        'Act as a calm, supportive clinical decision partner. I''m in the middle of a busy shift and trying to decide what to tackle next.

Based on common nursing priorities—like airway, safety, pain, time-sensitive meds, new orders, or patient changes—help me talk through what should come first.

Ask me focused questions like:
• Are any patients unstable or showing new symptoms?
• Is anything life-threatening or urgent?
• What''s time-sensitive? (meds, treatments, discharges)
• Who''s in pain or has unmet needs?
• What will have the biggest impact if I handle it now?

End with a recap of the top 1–2 priorities I should handle next and remind me to take a breath before I move. No PHI—just practical clarity when I need it most.',
        'Prioritization Support',
        'icu',
        ARRAY['prioritization', 'time-management', 'clinical-decisions', 'patient-safety'],
        'advanced',
        35,
        NULL,
        false
      ),
      (
        'Care Plan Selection Assistant',
        'I''m finishing my shift and want to make sure I''ve selected the most appropriate care plan for my patient.

Here''s what I know:
• Primary diagnosis: [ ]
• Key symptoms or focus areas: [ ]
• Relevant history or comorbidities: [ ]
• My top concerns or goals for this patient: [ ]

Based on this, help me:
• Identify 1–2 appropriate nursing diagnoses (aligned with standard NANDA terminology)
• Draft SMART goals tailored to the case
• Suggest evidence-based interventions that align with common inpatient documentation standards
• Remind me of anything I might forget when selecting or updating care plans—especially when I''m tired.',
        'Care Plan Helper',
        'pediatrics',
        ARRAY['care-planning', 'nursing-diagnoses', 'evidence-based-practice', 'documentation'],
        'intermediate',
        27,
        NULL,
        false
      ),
      (
        'Hydration & Bio-Break Check',
        'If you''ve been on shift for four hours with no active alarms or time-critical tasks, remind me to drink at least 8 oz of water and take a quick restroom break.',
        'Self-Care',
        'med-surg',
        ARRAY['hydration', 'self-care', 'wellness', 'break-reminders'],
        'beginner',
        15,
        NULL,
        false
      ),
      (
        'Rapid Response Team Debrief',
        'Act as my rapid response debrief facilitator. Walk me through analyzing a recent RRT call, focusing on early warning signs recognition, escalation timing, and intervention effectiveness. Help me identify system factors that contributed to the patient''s deterioration and develop strategies for earlier detection in future cases.

Guide me through:
• Recognition of deteriorating patient signs
• Communication with the medical team
• Intervention timing and effectiveness
• System factors that may have contributed
• Strategies for improvement

Keep the focus on learning and professional growth while maintaining patient confidentiality.',
        'Code Blue Debrief',
        'med-surg',
        ARRAY['rapid-response', 'early-warning-signs', 'escalation', 'patient-safety'],
        'advanced',
        18,
        demo_user_4,
        false
      ),
      (
        'Compassion Fatigue Check-In',
        'Act as my compassion fatigue counselor. Help me recognize early warning signs of emotional exhaustion and reduced empathy. Guide me through a self-assessment of my emotional reserves and provide evidence-based strategies for recovery.

Help me assess:
• My current emotional energy levels
• Signs of depersonalization or cynicism
• Changes in my empathy and caring
• Physical symptoms of stress
• Impact on my personal relationships

Provide practical strategies for rebuilding emotional resilience and maintaining therapeutic relationships with patients and families.',
        'Burnout Self-Check',
        'mental-health',
        ARRAY['compassion-fatigue', 'emotional-wellness', 'resilience', 'self-assessment'],
        'intermediate',
        29,
        demo_user_5,
        true
      ),
      (
        'ICU Handoff Excellence',
        'Act as my ICU report specialist. Help me prepare comprehensive yet efficient handoffs for critically ill patients. Guide me through organizing complex information including ventilator settings, drip calculations, neurological assessments, and family dynamics.

Help me organize:
• Current clinical status and trends
• Ventilator settings and respiratory status
• Vasoactive drips and hemodynamic status
• Neurological assessments and trends
• Family dynamics and communication needs
• Pending procedures or interventions
• Safety concerns and precautions

Ensure all critical safety information is communicated clearly while maintaining efficiency.',
        'Shift Report Prep',
        'icu',
        ARRAY['critical-care', 'handoff-communication', 'ventilator-management', 'complex-patients'],
        'advanced',
        22,
        demo_user_1,
        false
      );
  END IF;
END $$;