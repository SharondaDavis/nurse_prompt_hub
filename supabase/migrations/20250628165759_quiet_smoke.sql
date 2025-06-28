-- Add tsvector column for full-text search
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'prompt_vector'
  ) THEN
    ALTER TABLE prompts ADD COLUMN prompt_vector tsvector;
  END IF;
END $$;

-- Create function to generate search vector from prompt content
-- Using only existing columns: title, prompt_text, content, category, specialty
CREATE OR REPLACE FUNCTION generate_prompt_search_vector(title_text TEXT, content_text TEXT, category_text TEXT, specialty_text TEXT)
RETURNS tsvector AS $$
BEGIN
  RETURN (
    setweight(to_tsvector('english', COALESCE(title_text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(specialty_text, '')), 'D')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill existing prompts with search vectors using existing columns only
UPDATE prompts 
SET prompt_vector = generate_prompt_search_vector(
  title, 
  COALESCE(content, prompt_text, ''), 
  COALESCE(category, ''),
  COALESCE(specialty, '')
)
WHERE prompt_vector IS NULL;

-- Create trigger function to automatically update search vector
-- Use existing columns only
CREATE OR REPLACE FUNCTION update_prompt_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prompt_vector = generate_prompt_search_vector(
    NEW.title, 
    COALESCE(NEW.content, NEW.prompt_text, ''), 
    COALESCE(NEW.category, ''),
    COALESCE(NEW.specialty, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS update_prompt_search_vector_trigger ON prompts;
CREATE TRIGGER update_prompt_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, prompt_text, content, category, specialty ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_prompts_search_vector ON prompts USING GIN(prompt_vector);

-- Create additional indexes for filtering and sorting combinations
CREATE INDEX IF NOT EXISTS idx_prompts_created_at_desc ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_category_created_at ON prompts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_specialty_created_at ON prompts(specialty, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_created_at ON prompts(created_by, created_at DESC);

-- Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_prompts_category_specialty_created_at ON prompts(category, specialty, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_category_created_at ON prompts(created_by, category, created_at DESC);

-- Update any remaining NULL search vectors
UPDATE prompts 
SET prompt_vector = generate_prompt_search_vector(
  title, 
  COALESCE(content, prompt_text, ''), 
  COALESCE(category, ''),
  COALESCE(specialty, '')
)
WHERE prompt_vector IS NULL;

-- Make prompt_vector NOT NULL after backfilling (only if all rows have been updated)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM prompts WHERE prompt_vector IS NULL) THEN
    ALTER TABLE prompts ALTER COLUMN prompt_vector SET NOT NULL;
  END IF;
END $$;