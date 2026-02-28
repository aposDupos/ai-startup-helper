ALTER TABLE public.conversations DROP CONSTRAINT conversations_context_type_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_context_type_check CHECK (context_type = ANY (ARRAY['idea_search'::text, 'validation'::text, 'bmc'::text, 'mvp'::text, 'pitch'::text, 'general'::text, 'idea_evaluation'::text, 'project_assessment'::text]));
