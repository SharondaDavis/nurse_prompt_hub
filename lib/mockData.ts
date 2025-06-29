import { Database } from '@/types/database';

type Prompt = Database['public']['Tables']['prompts']['Row'];

export const mockPrompts: Prompt[] = [
  // Built-in prompts (created_by: null, provided by NurseBloc)
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Code Blue Debrief Assistant',
    content: 'Act as my Code Blue debrief assistant. I\'ve just participated in a code, and I need help grounding myself so I can focus and document what happened accurately. Start by walking me through a short mindfulness moment (no more than 30 seconds) to help me slow down and breathe.\n\nThen, based on common post-code documentation standards, give me a general checklist of what I may need to include in my documentation. Please do not include or request any names, hospital names, facility identifiers, or personal health information.\n\nHere\'s what I need a reminder for:\n• Date and exact time the code started and ended (24-hr format)\n• Where the code occurred (unit, general location—not facility name)\n• Whether it was witnessed or unwitnessed\n• Initial rhythm identified (e.g., asystole, V-fib, PEA)\n• Airway management: oxygen use, intubation, bagging, suctioning\n• IV/IO access initiation (site, time, fluid/meds given)\n• Medications administered (time, dose, route—no brand names)\n• Defibrillation use: number of attempts, joules used\n• Total CPR time and compressions\n• Return of spontaneous circulation (ROSC? Y/N)\n• Who was leading the code (role only—no names)\n• Outcome: transfer, continued care, or time of death\n• Any documentation forms that must be completed per policy\n\nEnd with one final grounding reflection or affirmation to help me close this mentally before moving on.',
    category: 'Code Blue Debrief',
    specialty: 'icu',
    tags: ['code-blue', 'documentation', 'mindfulness', 'professional-development'],
    difficulty_level: 'intermediate',
    votes: 24,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Post-Shift Reset Coach',
    content: 'Act as my post-shift reset coach. Guide me through one slow 4-7-8 breath.\n\nThen ask me:\n• How tense is my body right now? (1–10)\n• Which emotion is strongest?\n• One good thing that happened today?\n\nSuggest two quick, personalized resets based on what you know about me—examples: an upbeat song on the drive, a neck-stretch, hydrating, a one-line gratitude note, or texting a friend.\n\nClose with a calming affirmation.',
    category: 'Burnout Self-Check',
    specialty: 'med-surg',
    tags: ['self-care', 'mindfulness', 'stress-management', 'emotional-wellness'],
    difficulty_level: 'beginner',
    votes: 42,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T14:20:00Z',
  },
  
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Mental Report Prep Partner',
    content: 'Act as my mental report prep partner. I\'m about to give handoff, and I just want to make sure I\'ve covered all the important pieces.\n\nUse SBAR format to help me organize my thoughts—but keep it quick and casual. Prompt me to think through:\n• What\'s going on with the patient\n• What\'s already been done\n• What I observed\n• What needs to happen next\n\nAlso remind me to check for:\n• Priority concerns or changes in status\n• Any pending labs, meds, or follow-ups\n• Discharges, consults, or new orders\n• Safety, pain, or psychosocial updates\n\nDon\'t include names, room numbers, or identifying info—just help me feel calm and ready before I speak.',
    category: 'Shift Report Prep',
    specialty: 'er',
    tags: ['sbar', 'handoff-communication', 'patient-safety', 'organization'],
    difficulty_level: 'intermediate',
    votes: 31,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
  },
  
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Clinical Decision Partner',
    content: 'Act as a calm, supportive clinical decision partner. I\'m in the middle of a busy shift and trying to decide what to tackle next.\n\nBased on common nursing priorities—like airway, safety, pain, time-sensitive meds, new orders, or patient changes—help me talk through what should come first.\n\nAsk me focused questions like:\n• Are any patients unstable or showing new symptoms?\n• Is anything life-threatening or urgent?\n• What\'s time-sensitive? (meds, treatments, discharges)\n• Who\'s in pain or has unmet needs?\n• What will have the biggest impact if I handle it now?\n\nEnd with a recap of the top 1–2 priorities I should handle next and remind me to take a breath before I move. No PHI—just practical clarity when I need it most.',
    category: 'Prioritization Support',
    specialty: 'icu',
    tags: ['prioritization', 'time-management', 'clinical-decisions', 'patient-safety'],
    difficulty_level: 'advanced',
    votes: 35,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z',
  },
  
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Care Plan Selection Assistant',
    content: 'I\'m finishing my shift and want to make sure I\'ve selected the most appropriate care plan for my patient.\n\nHere\'s what I know:\n• Primary diagnosis: [ ]\n• Key symptoms or focus areas: [ ]\n• Relevant history or comorbidities: [ ]\n• My top concerns or goals for this patient: [ ]\n\nBased on this, help me:\n• Identify 1–2 appropriate nursing diagnoses (aligned with standard NANDA terminology)\n• Draft SMART goals tailored to the case\n• Suggest evidence-based interventions that align with common inpatient documentation standards\n• Remind me of anything I might forget when selecting or updating care plans—especially when I\'m tired.',
    category: 'Care Plan Helper',
    specialty: 'pediatrics',
    tags: ['care-planning', 'nursing-diagnoses', 'evidence-based-practice', 'documentation'],
    difficulty_level: 'intermediate',
    votes: 27,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-11T11:30:00Z',
    updated_at: '2024-01-11T11:30:00Z',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Hydration & Bio-Break Check',
    content: 'If you\'ve been on shift for four hours with no active alarms or time-critical tasks, remind me to drink at least 8 oz of water and take a quick restroom break.',
    category: 'Self-Care',
    specialty: 'med-surg',
    tags: ['hydration', 'self-care', 'wellness', 'break-reminders'],
    difficulty_level: 'beginner',
    votes: 15,
    created_by: null, // Built-in prompt
    is_anonymous: false,
    created_at: '2024-01-16T08:00:00Z',
    updated_at: '2024-01-16T08:00:00Z',
  },

  // User-contributed prompts (some anonymous, some with attribution)
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Rapid Response Team Debrief',
    content: 'Act as my rapid response debrief facilitator. Walk me through analyzing a recent RRT call, focusing on early warning signs recognition, escalation timing, and intervention effectiveness. Help me identify system factors that contributed to the patient\'s deterioration and develop strategies for earlier detection in future cases.\n\nGuide me through:\n• Recognition of deteriorating patient signs\n• Communication with the medical team\n• Intervention timing and effectiveness\n• System factors that may have contributed\n• Strategies for improvement\n\nKeep the focus on learning and professional growth while maintaining patient confidentiality.',
    category: 'Code Blue Debrief',
    specialty: 'med-surg',
    tags: ['rapid-response', 'early-warning-signs', 'escalation', 'patient-safety'],
    difficulty_level: 'advanced',
    votes: 18,
    created_by: '550e8400-e29b-41d4-a716-446655440106',
    is_anonymous: false, // User chose to be credited
    created_at: '2024-01-10T13:20:00Z',
    updated_at: '2024-01-10T13:20:00Z',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Compassion Fatigue Check-In',
    content: 'Act as my compassion fatigue counselor. Help me recognize early warning signs of emotional exhaustion and reduced empathy. Guide me through a self-assessment of my emotional reserves and provide evidence-based strategies for recovery.\n\nHelp me assess:\n• My current emotional energy levels\n• Signs of depersonalization or cynicism\n• Changes in my empathy and caring\n• Physical symptoms of stress\n• Impact on my personal relationships\n\nProvide practical strategies for rebuilding emotional resilience and maintaining therapeutic relationships with patients and families.',
    category: 'Burnout Self-Check',
    specialty: 'mental-health',
    tags: ['compassion-fatigue', 'emotional-wellness', 'resilience', 'self-assessment'],
    difficulty_level: 'intermediate',
    votes: 29,
    created_by: '550e8400-e29b-41d4-a716-446655440107',
    is_anonymous: true, // User chose to post anonymously
    created_at: '2024-01-09T08:45:00Z',
    updated_at: '2024-01-09T08:45:00Z',
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    title: 'ICU Handoff Excellence',
    content: 'Act as my ICU report specialist. Help me prepare comprehensive yet efficient handoffs for critically ill patients. Guide me through organizing complex information including ventilator settings, drip calculations, neurological assessments, and family dynamics.\n\nHelp me organize:\n• Current clinical status and trends\n• Ventilator settings and respiratory status\n• Vasoactive drips and hemodynamic status\n• Neurological assessments and trends\n• Family dynamics and communication needs\n• Pending procedures or interventions\n• Safety concerns and precautions\n\nEnsure all critical safety information is communicated clearly while maintaining efficiency.',
    category: 'Shift Report Prep',
    specialty: 'icu',
    tags: ['critical-care', 'handoff-communication', 'ventilator-management', 'complex-patients'],
    difficulty_level: 'advanced',
    votes: 22,
    created_by: '550e8400-e29b-41d4-a716-446655440108',
    is_anonymous: false, // User chose to be credited
    created_at: '2024-01-08T15:10:00Z',
    updated_at: '2024-01-08T15:10:00Z',
  },
];

export const mockUserProfiles = [
  { id: '550e8400-e29b-41d4-a716-446655440101', username: 'sarah_icu_rn', full_name: 'Sarah Johnson', specialty: 'ICU' },
  { id: '550e8400-e29b-41d4-a716-446655440102', username: 'mike_medsurg', full_name: 'Michael Chen', specialty: 'Medical-Surgical' },
  { id: '550e8400-e29b-41d4-a716-446655440103', username: 'emily_er_nurse', full_name: 'Emily Rodriguez', specialty: 'Emergency Room' },
  { id: '550e8400-e29b-41d4-a716-446655440104', username: 'david_charge', full_name: 'David Thompson', specialty: 'ICU' },
  { id: '550e8400-e29b-41d4-a716-446655440105', username: 'lisa_peds_rn', full_name: 'Lisa Park', specialty: 'Pediatrics' },
  { id: '550e8400-e29b-41d4-a716-446655440106', username: 'james_rapid', full_name: 'James Wilson', specialty: 'Medical-Surgical' },
  { id: '550e8400-e29b-41d4-a716-446655440107', username: 'amanda_mh', full_name: 'Amanda Davis', specialty: 'Mental Health' },
  { id: '550e8400-e29b-41d4-a716-446655440108', username: 'rob_critical', full_name: 'Robert Martinez', specialty: 'ICU' },
];