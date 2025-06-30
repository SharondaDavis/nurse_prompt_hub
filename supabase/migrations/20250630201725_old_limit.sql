-- First, add the tags column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE prompts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Insert new nursing prompts
INSERT INTO prompts (id, title, prompt_text, content, category, tags, votes, is_anonymous, created_at, updated_at)
VALUES
  ('8acfb841-6a27-41ef-87b9-4105c5dc1f88', 'Walk me through the safe and effective use of ____', 'Walk me through the safe and effective use of ____. What steps should I not forget?', 'Walk me through the safe and effective use of ____. What steps should I not forget?', 'skills', ARRAY['safety', 'case-management', 'interview'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('a24b0881-6e9d-4775-b884-6c2f5f477a25', 'Cultural considerations in patient care', 'When caring for a patient from a ____ background, what cultural considerations should I keep in mind while respecting privacy laws?', 'When caring for a patient from a ____ background, what cultural considerations should I keep in mind while respecting privacy laws?', 'communication', ARRAY['discharge', 'mental-health', 'travel-nursing'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('c55ef9f8-acbc-425d-8b94-edac6e8f1ce9', 'Home healthcare admission considerations', 'What are the top nursing considerations when admitting a patient with complex needs into home healthcare?', 'What are the top nursing considerations when admitting a patient with complex needs into home healthcare?', 'assessment', ARRAY['case-management', 'safety', 'critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('5953ea52-1f43-4012-80c0-86d3f5a33942', 'Discharge planning to reduce readmission', 'I''m preparing a discharge plan. What should I make sure is included to reduce readmission risk?', 'I''m preparing a discharge plan. What should I make sure is included to reduce readmission risk?', 'handoff', ARRAY['wound-care'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('49c8ecbd-fc20-47e5-8a00-962f84bfef8a', 'Prioritizing care while protecting PHI', 'How do I prioritize care for multiple patients with diverse clinical needs without violating PHI?', 'How do I prioritize care for multiple patients with diverse clinical needs without violating PHI?', 'prioritization', ARRAY['icu', 'interview', 'discharge'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('b31b4dbd-9eb3-45ed-b617-e5d89dfd940e', 'Infusion pump setup and troubleshooting', 'What are the steps to set up and troubleshoot a ____ infusion pump safely in the home setting?', 'What are the steps to set up and troubleshoot a ____ infusion pump safely in the home setting?', 'skills', ARRAY['pediatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('14b5b1fc-82ed-47d0-b020-ee99e7fab2b1', 'Pediatric antibiotic safety checks', 'I''m taking over care for a pediatric patient on antibiotics. What safety checks and parent instructions are crucial?', 'I''m taking over care for a pediatric patient on antibiotics. What safety checks and parent instructions are crucial?', 'medication', ARRAY['med-surg', 'travel-nursing'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('e4039428-015f-4320-9678-9fe27ba99c9e', 'CMS-compliant wound assessment', 'What should I review before documenting a wound assessment to make sure it meets CMS standards?', 'What should I review before documenting a wound assessment to make sure it meets CMS standards?', 'charting', ARRAY['discharge', 'equipment', 'critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('1de98b0f-5fdb-4a30-9265-4b645e1a9092', 'Culturally competent medication reconciliation', 'Give me guidance on how to conduct a culturally competent medication reconciliation with a patient whose primary language is not English.', 'Give me guidance on how to conduct a culturally competent medication reconciliation with a patient whose primary language is not English.', 'medication', ARRAY['interview', 'travel-nursing', 'time-management'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('1bef8019-b539-4778-be0a-e59d0d84286a', 'Nurse educator interview preparation', 'What interview question should I prepare for when applying to a nurse educator role?', 'What interview question should I prepare for when applying to a nurse educator role?', 'communication', ARRAY['leadership', 'admission'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('d481af3c-4b28-422c-8db7-be5e977a3d87', 'Travel nurse resume preparation', 'I need to prepare my resume for a travel nurse contract. What key metrics and experiences should I highlight?', 'I need to prepare my resume for a travel nurse contract. What key metrics and experiences should I highlight?', 'communication', ARRAY['cultural-sensitivity', 'interview', 'safety'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('64cea93d-7a6a-4a21-a206-c3bdea39ab28', 'Mental health assessment tools', 'I''m assessing a patient for mental health concerns. What validated tools or screenings should I use?', 'I''m assessing a patient for mental health concerns. What validated tools or screenings should I use?', 'assessment', ARRAY['wound-care', 'critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('dcd7c5b0-bb9d-4924-8374-d705d0463d59', 'Case management transportation resources', 'When coordinating case management services, what community resources should I explore for a patient lacking transportation?', 'When coordinating case management services, what community resources should I explore for a patient lacking transportation?', 'patient', ARRAY['discharge', 'geriatrics', 'mental-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('70b2df1b-f2c6-4059-a985-f9d43086e3bf', 'Home health reassessment red flags', 'What are the red flags to look for during a home health reassessment visit?', 'What are the red flags to look for during a home health reassessment visit?', 'assessment', ARRAY['infusion'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('962a4c7b-ebff-4cf9-b155-75a593366019', 'ICU floating priorities', 'I''m floating to the ICU today. What are the top three priorities I should clarify before starting my shift?', 'I''m floating to the ICU today. What are the top three priorities I should clarify before starting my shift?', 'prioritization', ARRAY['med-surg', 'critical-thinking', 'mental-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('3d7f28e1-aa16-41a4-bf26-d968269e28a7', 'High-acuity documentation best practices', 'What are best practices for entering documentation after a high-acuity situation to ensure clarity and compliance?', 'What are best practices for entering documentation after a high-acuity situation to ensure clarity and compliance?', 'charting', ARRAY['case-management', 'med-surg'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('50b973ff-1d6f-40b8-ae42-96ec0a5702e9', 'Case management elevator pitch', 'Help me build a 60-second elevator pitch for a virtual interview for a case management position.', 'Help me build a 60-second elevator pitch for a virtual interview for a case management position.', 'communication', ARRAY['geriatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('13818696-8ab7-4754-b0e5-5a6f2cff0fc7', 'Warfarin patient education', 'I just got a new patient on warfarin. What patient education points should I make sure to cover?', 'I just got a new patient on warfarin. What patient education points should I make sure to cover?', 'patient', ARRAY['resume', 'equipment', 'case-management'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('184855f4-7405-4f53-aafd-81ebdcfe8eb1', 'Caregiver fatigue assessment', 'What are the key signs of caregiver fatigue I should assess when providing home-based care for a chronically ill patient?', 'What are the key signs of caregiver fatigue I should assess when providing home-based care for a chronically ill patient?', 'assessment', ARRAY['critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('08ad962b-e0de-4efc-9680-746883ad4a0e', 'Documentation compliance pitfalls', 'I''m orienting a new nurse on documentation. What pitfalls should I warn them about to avoid compliance issues?', 'I''m orienting a new nurse on documentation. What pitfalls should I warn them about to avoid compliance issues?', 'charting', ARRAY['med-surg', 'resume', 'wound-care'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('754188b2-683a-4d2a-ad13-d73fa746f9d6', 'SBAR for patient condition changes', 'What are the key components of SBAR when I need to escalate an unexpected change in a patient''s condition?', 'What are the key components of SBAR when I need to escalate an unexpected change in a patient''s condition?', 'handoff', ARRAY['med-surg'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('bcadc070-c492-43d8-93a2-a3484fcab09c', 'Travel nurse contract checklist', 'Create a checklist I can use before signing off on a travel nurse contract offer.', 'Create a checklist I can use before signing off on a travel nurse contract offer.', 'communication', ARRAY['interview', 'infusion', 'equipment'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('64d5f6b2-44a9-48ec-b1fc-ebbe45218a05', 'Trach suctioning procedure review', 'Give me a mini in-service to remind me of correct trach suctioning procedure.', 'Give me a mini in-service to remind me of correct trach suctioning procedure.', 'skills', ARRAY['geriatrics', 'case-management', 'mental-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('25b144e1-e935-47af-ad54-7ca9e7465869', 'Long-term care med pass efficiency', 'How can I improve efficiency when organizing morning med passes across 5 patients in long-term care?', 'How can I improve efficiency when organizing morning med passes across 5 patients in long-term care?', 'medication', ARRAY['time-management'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('19bd21c4-d2f5-4912-b099-3b55a8c60782', 'Abnormal lab result protocol', 'I just received lab results that are out of range. What steps should I take before contacting the provider?', 'I just received lab results that are out of range. What steps should I take before contacting the provider?', 'assessment', ARRAY['discharge'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('90740787-0026-4cb4-8c07-1e88c2475a6b', 'Post-op wound care teaching', 'What points should I include when teaching wound care for a post-op patient going home with a caregiver?', 'What points should I include when teaching wound care for a post-op patient going home with a caregiver?', 'patient', ARRAY['med-surg', 'infusion', 'interview'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('06b123ec-4401-439d-9abb-d31d26258c7e', 'Travel assignment fit assessment', 'What should I ask the recruiter to make sure this travel assignment will be a good fit for me?', 'What should I ask the recruiter to make sure this travel assignment will be a good fit for me?', 'communication', ARRAY['equipment', 'pediatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('1a98b6aa-0978-4e7e-a860-1f68043d3672', 'JCAHO bedside handoff requirements', 'What does JCAHO look for during bedside handoff reports? How can I meet those expectations?', 'What does JCAHO look for during bedside handoff reports? How can I meet those expectations?', 'handoff', ARRAY['safety', 'wound-care'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('6df59872-0cdb-4cac-9c54-64954a7fedca', 'Infusion center leadership resume', 'How can I tailor my resume to show readiness for leadership roles in outpatient infusion centers?', 'How can I tailor my resume to show readiness for leadership roles in outpatient infusion centers?', 'communication', ARRAY['safety'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('d674d6a8-9440-40a2-b531-faead986b624', 'Documentation evaluation prompt', 'Give me a prompt I can use with an LLM to evaluate if this documentation reflects appropriate nursing judgment.', 'Give me a prompt I can use with an LLM to evaluate if this documentation reflects appropriate nursing judgment.', 'charting', ARRAY['discharge', 'home-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('964afe2f-6b59-4f40-b77d-ebfb5e4cf9dd', 'Unsafe staffing communication', 'Help me write a professional yet firm message to clarify unsafe staffing ratios.', 'Help me write a professional yet firm message to clarify unsafe staffing ratios.', 'communication', ARRAY['icu'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('92041fdd-aed4-47be-9894-567786b97f48', 'Acute to subacute transfer checklist', 'What checklist should I follow when transferring a patient from acute care to subacute rehab?', 'What checklist should I follow when transferring a patient from acute care to subacute rehab?', 'handoff', ARRAY['med-surg', 'admission'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('937199bb-3fb5-4225-87cc-ef245ade45ec', 'Adult vs. pediatric NG tube care', 'What are the differences in approach between managing adult and pediatric NG tube care?', 'What are the differences in approach between managing adult and pediatric NG tube care?', 'skills', ARRAY['critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('2cbdd791-5d15-48b4-8e49-61306e045491', 'Clinical prioritization decision support', 'I need a clinical decision partner. I have 3 patients due for insulin, one complaining of chest pain, and one post-op. Who do I see first?', 'I need a clinical decision partner. I have 3 patients due for insulin, one complaining of chest pain, and one post-op. Who do I see first?', 'prioritization', ARRAY['case-management', 'wound-care'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('7d12662d-c957-4064-a417-dde897756acc', 'Performance review crisis communication', 'Help me draft a reflective statement for a performance review that highlights growth in crisis communication.', 'Help me draft a reflective statement for a performance review that highlights growth in crisis communication.', 'communication', ARRAY['mental-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('827811af-eedb-4b5c-bcd2-51359b7587da', 'Treatment refusal documentation', 'What documentation steps should I follow when patient refuses treatment but is alert and oriented?', 'What documentation steps should I follow when patient refuses treatment but is alert and oriented?', 'charting', ARRAY['mental-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('4e477fa5-1186-4347-a7a4-76f54fb1c556', 'Nurse-led innovation project pitch', 'I want to advocate for a nurse-led innovation project. What should my 3-minute pitch include?', 'I want to advocate for a nurse-led innovation project. What should my 3-minute pitch include?', 'communication', ARRAY['critical-thinking'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('b94a763d-cb93-45f0-af03-ded4ec5f4353', 'Team huddle leadership guide', 'Help me lead a 10-minute team huddle that covers safety, workflow, and wellness.', 'Help me lead a 10-minute team huddle that covers safety, workflow, and wellness.', 'communication', ARRAY['discharge'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('948d3e0b-e13b-4ce6-afa9-9d42b4348930', 'Home sharps disposal education', 'What''s a simple way to teach families how to properly dispose of home-care sharps?', 'What''s a simple way to teach families how to properly dispose of home-care sharps?', 'patient', ARRAY['leadership', 'travel-nursing', 'geriatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('1cf7a808-3255-48db-bf6c-bb307c9c58db', 'Sepsis marker education outline', 'Give me an outline for teaching a new grad nurse how to identify and escalate changes in sepsis markers.', 'Give me an outline for teaching a new grad nurse how to identify and escalate changes in sepsis markers.', 'assessment', ARRAY['equipment'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('0bedb3c0-42f7-4a94-9ef1-f435214045a1', 'Home care blood transfusion safety', 'What are safety steps I must verify before initiating a blood transfusion in home care?', 'What are safety steps I must verify before initiating a blood transfusion in home care?', 'skills', ARRAY['travel-nursing', 'med-surg', 'home-health'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('d82c0538-90a5-4884-8564-2c0879237956', 'Night shift travel contract questions', 'What key questions should I ask a facility before accepting a night shift travel contract?', 'What key questions should I ask a facility before accepting a night shift travel contract?', 'communication', ARRAY['travel-nursing', 'critical-thinking', 'safety'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('5c2f1c08-4473-4ddd-a5db-daab18f09463', 'Mental health emergency medication documentation', 'What documentation is needed after administering emergency PRN medication during a mental health crisis?', 'What documentation is needed after administering emergency PRN medication during a mental health crisis?', 'charting', ARRAY['home-health', 'travel-nursing'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('881304b6-ee7e-4dcb-8679-5369bd9ed755', 'ICU shift handoff tasks', 'What tasks must I complete before handing off care at shift change in the ICU?', 'What tasks must I complete before handing off care at shift change in the ICU?', 'handoff', ARRAY['cultural-sensitivity', 'leadership'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('e37dfa8e-7419-44f5-8ccb-33cdc4eaf5a1', 'DON interview preparation', 'I''m preparing for a DON interview. What operational and compliance metrics should I be ready to speak to?', 'I''m preparing for a DON interview. What operational and compliance metrics should I be ready to speak to?', 'communication', ARRAY['safety', 'mental-health', 'infusion'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('a46c62a7-2dcc-4c1f-a80a-9cf6e08f3493', 'LLM prompt for CNA skin breakdown education', 'How can I prompt an LLM to help me teach a CNA to identify early signs of skin breakdown?', 'How can I prompt an LLM to help me teach a CNA to identify early signs of skin breakdown?', 'patient', ARRAY['home-health', 'pediatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('b8ffb489-dadd-44ed-ba24-3713558a5455', 'Multidisciplinary case conference preparation', 'I''m prepping for a multidisciplinary case conference. How do I succinctly present nursing observations and concerns?', 'I''m prepping for a multidisciplinary case conference. How do I succinctly present nursing observations and concerns?', 'communication', ARRAY['cultural-sensitivity'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('c989a40f-cc80-4989-bd22-a70e7cf66913', 'Home-based surgery infection control', 'What infection control considerations should I highlight in a pre-op call for a home-based surgery patient?', 'What infection control considerations should I highlight in a pre-op call for a home-based surgery patient?', 'patient', ARRAY['mental-health', 'interview', 'leadership'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('031d4c89-575f-4943-987a-ad023d493e21', 'Kangaroo enteral feeding setup', 'Provide a step-by-step review of starting a Kangaroo enteral feeding system safely at home.', 'Provide a step-by-step review of starting a Kangaroo enteral feeding system safely at home.', 'skills', ARRAY['equipment', 'interview', 'time-management'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('d0dad822-20dc-4584-a511-fc82dd790365', 'EHR med pass documentation cheat sheet', 'How can I create a cheat sheet for documenting med passes in both Epic and Cerner?', 'How can I create a cheat sheet for documenting med passes in both Epic and Cerner?', 'charting', ARRAY['admission', 'safety', 'leadership'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('642ba126-fc06-4d0f-b15d-d405075774a4', 'Home health time-saving hacks', 'Give me 3 time-saving hacks for managing caseloads across multiple zip codes in home health.', 'Give me 3 time-saving hacks for managing caseloads across multiple zip codes in home health.', 'prioritization', ARRAY['travel-nursing', 'safety'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14'),
  
  ('642ba126-fc06-4d0f-b15d-d405075774a5', 'Code Blue self-debrief', 'How do I debrief myself after a Code Blue when no one else is available to process the event with me?', 'How do I debrief myself after a Code Blue when no one else is available to process the event with me?', 'selfcare', ARRAY['resume', 'geriatrics'], 0, TRUE, '2025-06-30 20:03:14', '2025-06-30 20:03:14');

-- Update the prompt_vector for all new prompts
UPDATE prompts 
SET prompt_vector = generate_prompt_search_vector(
  title, 
  COALESCE(content, prompt_text, ''), 
  COALESCE(category, ''),
  COALESCE(specialty, '')
)
WHERE prompt_vector IS NULL;

-- Map category values to match our standardized categories
UPDATE prompts
SET category = CASE
  WHEN category = 'skills' THEN 'Skills & Procedures'
  WHEN category = 'communication' THEN 'Communication'
  WHEN category = 'assessment' THEN 'Assessment'
  WHEN category = 'handoff' THEN 'Handoff/Report'
  WHEN category = 'prioritization' THEN 'Prioritization & Delegation'
  WHEN category = 'medication' THEN 'Medication Safety'
  WHEN category = 'charting' THEN 'Charting & Documentation'
  WHEN category = 'patient' THEN 'Patient Education'
  WHEN category = 'selfcare' THEN 'Self-Care & Burnout'
  WHEN category = 'emergency' THEN 'Emergency/Code Situations'
  ELSE category
END
WHERE id IN (
  '8acfb841-6a27-41ef-87b9-4105c5dc1f88',
  'a24b0881-6e9d-4775-b884-6c2f5f477a25',
  'c55ef9f8-acbc-425d-8b94-edac6e8f1ce9',
  '5953ea52-1f43-4012-80c0-86d3f5a33942',
  '49c8ecbd-fc20-47e5-8a00-962f84bfef8a',
  'b31b4dbd-9eb3-45ed-b617-e5d89dfd940e',
  '14b5b1fc-82ed-47d0-b020-ee99e7fab2b1',
  'e4039428-015f-4320-9678-9fe27ba99c9e',
  '1de98b0f-5fdb-4a30-9265-4b645e1a9092',
  '1bef8019-b539-4778-be0a-e59d0d84286a',
  'd481af3c-4b28-422c-8db7-be5e977a3d87',
  '64cea93d-7a6a-4a21-a206-c3bdea39ab28',
  'dcd7c5b0-bb9d-4924-8374-d705d0463d59',
  '70b2df1b-f2c6-4059-a985-f9d43086e3bf',
  '962a4c7b-ebff-4cf9-b155-75a593366019',
  '3d7f28e1-aa16-41a4-bf26-d968269e28a7',
  '50b973ff-1d6f-40b8-ae42-96ec0a5702e9',
  '13818696-8ab7-4754-b0e5-5a6f2cff0fc7',
  '184855f4-7405-4f53-aafd-81ebdcfe8eb1',
  '08ad962b-e0de-4efc-9680-746883ad4a0e',
  '754188b2-683a-4d2a-ad13-d73fa746f9d6',
  'bcadc070-c492-43d8-93a2-a3484fcab09c',
  '64d5f6b2-44a9-48ec-b1fc-ebbe45218a05',
  '25b144e1-e935-47af-ad54-7ca9e7465869',
  '19bd21c4-d2f5-4912-b099-3b55a8c60782',
  '90740787-0026-4cb4-8c07-1e88c2475a6b',
  '06b123ec-4401-439d-9abb-d31d26258c7e',
  '1a98b6aa-0978-4e7e-a860-1f68043d3672',
  '6df59872-0cdb-4cac-9c54-64954a7fedca',
  'd674d6a8-9440-40a2-b531-faead986b624',
  '964afe2f-6b59-4f40-b77d-ebfb5e4cf9dd',
  '92041fdd-aed4-47be-9894-567786b97f48',
  '937199bb-3fb5-4225-87cc-ef245ade45ec',
  '2cbdd791-5d15-48b4-8e49-61306e045491',
  '7d12662d-c957-4064-a417-dde897756acc',
  '827811af-eedb-4b5c-bcd2-51359b7587da',
  '4e477fa5-1186-4347-a7a4-76f54fb1c556',
  'b94a763d-cb93-45f0-af03-ded4ec5f4353',
  '948d3e0b-e13b-4ce6-afa9-9d42b4348930',
  '1cf7a808-3255-48db-bf6c-bb307c9c58db',
  '0bedb3c0-42f7-4a94-9ef1-f435214045a1',
  'd82c0538-90a5-4884-8564-2c0879237956',
  '5c2f1c08-4473-4ddd-a5db-daab18f09463',
  '881304b6-ee7e-4dcb-8679-5369bd9ed755',
  'e37dfa8e-7419-44f5-8ccb-33cdc4eaf5a1',
  'a46c62a7-2dcc-4c1f-a80a-9cf6e08f3493',
  'b8ffb489-dadd-44ed-ba24-3713558a5455',
  'c989a40f-cc80-4989-bd22-a70e7cf66913',
  '031d4c89-575f-4943-987a-ad023d493e21',
  'd0dad822-20dc-4584-a511-fc82dd790365',
  '642ba126-fc06-4d0f-b15d-d405075774a4',
  '642ba126-fc06-4d0f-b15d-d405075774a5'
);

-- Update the prompt_vector again after category standardization
UPDATE prompts 
SET prompt_vector = generate_prompt_search_vector(
  title, 
  COALESCE(content, prompt_text, ''), 
  COALESCE(category, ''),
  COALESCE(specialty, '')
)
WHERE id IN (
  '8acfb841-6a27-41ef-87b9-4105c5dc1f88',
  'a24b0881-6e9d-4775-b884-6c2f5f477a25',
  'c55ef9f8-acbc-425d-8b94-edac6e8f1ce9',
  '5953ea52-1f43-4012-80c0-86d3f5a33942',
  '49c8ecbd-fc20-47e5-8a00-962f84bfef8a',
  'b31b4dbd-9eb3-45ed-b617-e5d89dfd940e',
  '14b5b1fc-82ed-47d0-b020-ee99e7fab2b1',
  'e4039428-015f-4320-9678-9fe27ba99c9e',
  '1de98b0f-5fdb-4a30-9265-4b645e1a9092',
  '1bef8019-b539-4778-be0a-e59d0d84286a',
  'd481af3c-4b28-422c-8db7-be5e977a3d87',
  '64cea93d-7a6a-4a21-a206-c3bdea39ab28',
  'dcd7c5b0-bb9d-4924-8374-d705d0463d59',
  '70b2df1b-f2c6-4059-a985-f9d43086e3bf',
  '962a4c7b-ebff-4cf9-b155-75a593366019',
  '3d7f28e1-aa16-41a4-bf26-d968269e28a7',
  '50b973ff-1d6f-40b8-ae42-96ec0a5702e9',
  '13818696-8ab7-4754-b0e5-5a6f2cff0fc7',
  '184855f4-7405-4f53-aafd-81ebdcfe8eb1',
  '08ad962b-e0de-4efc-9680-746883ad4a0e',
  '754188b2-683a-4d2a-ad13-d73fa746f9d6',
  'bcadc070-c492-43d8-93a2-a3484fcab09c',
  '64d5f6b2-44a9-48ec-b1fc-ebbe45218a05',
  '25b144e1-e935-47af-ad54-7ca9e7465869',
  '19bd21c4-d2f5-4912-b099-3b55a8c60782',
  '90740787-0026-4cb4-8c07-1e88c2475a6b',
  '06b123ec-4401-439d-9abb-d31d26258c7e',
  '1a98b6aa-0978-4e7e-a860-1f68043d3672',
  '6df59872-0cdb-4cac-9c54-64954a7fedca',
  'd674d6a8-9440-40a2-b531-faead986b624',
  '964afe2f-6b59-4f40-b77d-ebfb5e4cf9dd',
  '92041fdd-aed4-47be-9894-567786b97f48',
  '937199bb-3fb5-4225-87cc-ef245ade45ec',
  '2cbdd791-5d15-48b4-8e49-61306e045491',
  '7d12662d-c957-4064-a417-dde897756acc',
  '827811af-eedb-4b5c-bcd2-51359b7587da',
  '4e477fa5-1186-4347-a7a4-76f54fb1c556',
  'b94a763d-cb93-45f0-af03-ded4ec5f4353',
  '948d3e0b-e13b-4ce6-afa9-9d42b4348930',
  '1cf7a808-3255-48db-bf6c-bb307c9c58db',
  '0bedb3c0-42f7-4a94-9ef1-f435214045a1',
  'd82c0538-90a5-4884-8564-2c0879237956',
  '5c2f1c08-4473-4ddd-a5db-daab18f09463',
  '881304b6-ee7e-4dcb-8679-5369bd9ed755',
  'e37dfa8e-7419-44f5-8ccb-33cdc4eaf5a1',
  'a46c62a7-2dcc-4c1f-a80a-9cf6e08f3493',
  'b8ffb489-dadd-44ed-ba24-3713558a5455',
  'c989a40f-cc80-4989-bd22-a70e7cf66913',
  '031d4c89-575f-4943-987a-ad023d493e21',
  'd0dad822-20dc-4584-a511-fc82dd790365',
  '642ba126-fc06-4d0f-b15d-d405075774a4',
  '642ba126-fc06-4d0f-b15d-d405075774a5'
);