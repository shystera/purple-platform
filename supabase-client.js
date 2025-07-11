import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.3/+esm';

// ✅ Replace with your actual Supabase project URL and anon key:
const supabaseUrl = 'https://zqjiamqtmtwrrkdgpfih.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxamlhbXF0bXR3cnJrZGdwZmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjcwMDQsImV4cCI6MjA2NzcwMzAwNH0.id5oTZhlVxoiwSCt80YhHvndn6Q0Pmy8Wn9_f8lHo_U';  // Don't use service_role on frontend

const supabase = createClient(supabaseUrl, supabaseKey);

// Make Supabase available globally
window.supabase = supabase;