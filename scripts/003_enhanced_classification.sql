-- Enhanced waste_classifications table with new AI features
ALTER TABLE waste_classifications
ADD COLUMN IF NOT EXISTS items_detected INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS context_tips TEXT[],
ADD COLUMN IF NOT EXISTS multi_item_results JSONB;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_waste_classifications_user_created 
ON waste_classifications(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN waste_classifications.items_detected IS 'Number of waste items detected in the image';
COMMENT ON COLUMN waste_classifications.explanation IS 'Detailed AI explanation of classification reasoning';
COMMENT ON COLUMN waste_classifications.ocr_text IS 'Text extracted from product labels via OCR';
COMMENT ON COLUMN waste_classifications.context_tips IS 'Context-aware disposal tips based on location and regulations';
COMMENT ON COLUMN waste_classifications.multi_item_results IS 'JSON array of individual item classifications when multiple items detected';
