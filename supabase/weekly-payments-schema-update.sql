-- Update the process_weekly_payment function to ensure payments stay "lunas"
CREATE OR REPLACE FUNCTION process_weekly_payment(student_id_param UUID, amount_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  payment_record RECORD;
  weeks_to_pay INTEGER;
  weeks_paid INTEGER := 0;
BEGIN
  -- Calculate how many weeks can be paid
  weeks_to_pay := amount_param / 5000;
  
  -- Update payment status for the oldest unpaid weeks only
  -- This ensures that weeks that are already paid (lunas) remain paid
  FOR payment_record IN 
    SELECT id 
    FROM weekly_payments 
    WHERE student_id = student_id_param 
    AND payment_status = 'belum dibayar' -- Only select unpaid weeks
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

-- Update the calculate_unpaid_amount function to only count unpaid weeks
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
