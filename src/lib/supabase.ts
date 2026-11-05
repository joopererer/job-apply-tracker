import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ApplicationRecord {
  id: string;
  applied_at: string;
  status: string;
  notes: string | null;
  platform: string;
  external_job_id: string | null;
  clean_url: string;
  company_raw: string;
  company_norm: string;
  title_raw: string;
  title_norm: string;
  contract_type: string;
  location: string | null;
  salary_range: string | null;
  language: string;
  jd_content: string;
  hr_contact: string | null;
  updated_at?: string;
}

export interface DuplicateCheckResult {
  level: 'L1' | 'L2' | 'L3';
  reason: string;
  similarity?: number;
  matchedApplication: ApplicationRecord;
}

