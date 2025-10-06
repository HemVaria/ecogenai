-- Enhanced pickup_requests table
ALTER TABLE pickup_requests
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT, -- 'weekly', 'biweekly', 'monthly'
ADD COLUMN IF NOT EXISTS recurrence_day TEXT, -- day of week or date
ADD COLUMN IF NOT EXISTS next_occurrence DATE,
ADD COLUMN IF NOT EXISTS is_bulk BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_volume TEXT, -- 'small', 'medium', 'large', 'extra-large'
ADD COLUMN IF NOT EXISTS pricing_tier TEXT, -- 'standard', 'discounted', 'premium'
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_id UUID,
ADD COLUMN IF NOT EXISTS tracking_status TEXT, -- 'pending', 'assigned', 'en-route', 'arrived', 'completed'
ADD COLUMN IF NOT EXISTS estimated_arrival TIME,
ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for tracking
CREATE INDEX IF NOT EXISTS idx_pickup_tracking ON pickup_requests(tracking_status, pickup_date);
CREATE INDEX IF NOT EXISTS idx_pickup_recurring ON pickup_requests(is_recurring, next_occurrence);
