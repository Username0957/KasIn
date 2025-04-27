-- Create weekly_payments table
CREATE TABLE IF NOT EXISTS weekly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  student_id UUID NOT NULL REFERENCES users(id),
  payment_status TEXT NOT NULL DEFAULT 'belum dibayar' CHECK (payment_status IN ('belum dibayar', 'lunas')),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_payments_student_id ON weekly_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_payments_status ON weekly_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_weekly_payments_month_year ON weekly_payments(month, year);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_payments_unique ON weekly_payments(month, year, week_number, student_id);

-- Create function to get weeks in a month
CREATE OR REPLACE FUNCTION get_weeks_in_month(year_param INTEGER, month_param INTEGER)
RETURNS TABLE (
  week_number INTEGER,
  week_start_date DATE,
  week_end_date DATE
) AS $$
DECLARE
  first_day DATE;
  last_day DATE;
  curr_date DATE; -- Changed from current_date to curr_date
  week_start DATE;
  week_end DATE;
  week_count INTEGER := 1;
BEGIN
  -- Get first and last day of the month
  first_day := make_date(year_param, month_param, 1);
  last_day := (first_day + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Start from the first day of the month
  curr_date := first_day; -- Changed from current_date to curr_date
  week_start := curr_date; -- Changed from current_date to curr_date
  
  -- Loop through the month
  WHILE curr_date <= last_day LOOP -- Changed from current_date to curr_date
    -- If it's Sunday or the last day of the month, end the week
    IF EXTRACT(DOW FROM curr_date) = 6 OR curr_date = last_day THEN -- Changed from current_date to curr_date
      week_end := curr_date; -- Changed from current_date to curr_date
      
      -- Return the week
      week_number := week_count;
      week_start_date := week_start;
      week_end_date := week_end;
      RETURN NEXT;
      
      -- Start a new week
      week_start := curr_date + INTERVAL '1 day'; -- Changed from current_date to curr_date
      week_count := week_count + 1;
    END IF;
    
    -- Move to the next day
    curr_date := curr_date + INTERVAL '1 day'; -- Changed from current_date to curr_date
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate weekly payment entries for a month
CREATE OR REPLACE FUNCTION generate_weekly_payments(year_param INTEGER, month_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  student RECORD;
  week RECORD;
  inserted_count INTEGER := 0;
BEGIN
  -- Loop through all students (non-admin users)
  FOR student IN SELECT id FROM users WHERE role = 'user' LOOP
    -- Loop through all weeks in the month
    FOR week IN SELECT * FROM get_weeks_in_month(year_param, month_param) LOOP
      -- Check if entry already exists
      IF NOT EXISTS (
        SELECT 1 FROM weekly_payments 
        WHERE student_id = student.id 
        AND month = month_param 
        AND year = year_param 
        AND week_number = week.week_number
      ) THEN
        -- Insert new entry
        INSERT INTO weekly_payments (
          month, 
          year, 
          week_number, 
          student_id, 
          payment_status, 
          week_start_date, 
          week_end_date
        ) VALUES (
          month_param, 
          year_param, 
          week.week_number, 
          student.id, 
          'belum dibayar', 
          week.week_start_date, 
          week.week_end_date
        );
        
        inserted_count := inserted_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate total unpaid weeks for a student
CREATE OR REPLACE FUNCTION calculate_unpaid_amount(student_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  unpaid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unpaid_count
  FROM weekly_payments
  WHERE student_id = student_id_param
  AND payment_status = 'belum dibayar';
  
  RETURN unpaid_count * 5000; -- Rp5000 per week
END;
$$ LANGUAGE plpgsql;

-- Create function to process payment for a student
CREATE OR REPLACE FUNCTION process_weekly_payment(student_id_param UUID, amount_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  payment_record RECORD;
  weeks_to_pay INTEGER;
  weeks_paid INTEGER := 0;
BEGIN
  -- Calculate how many weeks can be paid
  weeks_to_pay := amount_param / 5000;
  
  -- Update payment status for the oldest unpaid weeks
  FOR payment_record IN 
    SELECT id 
    FROM weekly_payments 
    WHERE student_id = student_id_param 
    AND payment_status = 'belum dibayar' 
    ORDER BY year, month, week_number 
    LIMIT weeks_to_pay
  LOOP
    UPDATE weekly_payments 
    SET payment_status = 'lunas', 
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = payment_record.id;
    
    weeks_paid := weeks_paid + 1;
  END LOOP;
  
  RETURN weeks_paid;
END;
$$ LANGUAGE plpgsql;
