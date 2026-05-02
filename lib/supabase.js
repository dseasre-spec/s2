import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://jlbzunggttlgwqmlzibr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYnp1bmdndHRsZ3dxbWx6aWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzE1NzEsImV4cCI6MjA5MzMwNzU3MX0.VJdfnbQ6jfAF8geDWXcpE8JenkbwxOaEDIjUv6VB0uc'
);
