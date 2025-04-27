-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL, -- Added full_name field
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  kelas TEXT,
  nis TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create view for transactions with user names
CREATE OR REPLACE VIEW transactions_with_user_names AS
SELECT 
  t.*,
  u.username AS user_name,
  u.full_name AS user_full_name
FROM 
  transactions t
JOIN 
  users u ON t.user_id = u.id;

-- Create view for pending transactions with user names
CREATE OR REPLACE VIEW pending_transactions_with_user_names AS
SELECT 
  t.*,
  u.username AS user_name,
  u.full_name AS user_full_name
FROM 
  transactions t
JOIN 
  users u ON t.user_id = u.id
WHERE 
  t.status = 'pending';

-- Create function to get total balance
CREATE OR REPLACE FUNCTION get_total_balance()
RETURNS DECIMAL AS $$
DECLARE
  total_income DECIMAL;
  total_expense DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM transactions
  WHERE type = 'income' AND status = 'approved';

  SELECT COALESCE(SUM(amount), 0) INTO total_expense
  FROM transactions
  WHERE type = 'expense' AND status = 'approved';

  RETURN total_income - total_expense;
END;
$$ LANGUAGE plpgsql;

-- Create function to get monthly income
CREATE OR REPLACE FUNCTION get_monthly_income()
RETURNS DECIMAL AS $$
DECLARE
  monthly_income DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO monthly_income
  FROM transactions
  WHERE 
    type = 'income' 
    AND status = 'approved'
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN monthly_income;
END;
$$ LANGUAGE plpgsql;

-- Create function to get monthly expense
CREATE OR REPLACE FUNCTION get_monthly_expense()
RETURNS DECIMAL AS $$
DECLARE
  monthly_expense DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO monthly_expense
  FROM transactions
  WHERE 
    type = 'expense' 
    AND status = 'approved'
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN monthly_expense;
END;
$$ LANGUAGE plpgsql;

-- Create function to get total income
CREATE OR REPLACE FUNCTION get_total_income()
RETURNS DECIMAL AS $$
DECLARE
  total_income DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM transactions
  WHERE type = 'income' AND status = 'approved';

  RETURN total_income;
END;
$$ LANGUAGE plpgsql;

-- Create function to get total expense
CREATE OR REPLACE FUNCTION get_total_expense()
RETURNS DECIMAL AS $$
DECLARE
  total_expense DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_expense
  FROM transactions
  WHERE type = 'expense' AND status = 'approved';

  RETURN total_expense;
END;
$$ LANGUAGE plpgsql;

-- Create function to get monthly statistics
CREATE OR REPLACE FUNCTION get_monthly_statistics()
RETURNS TABLE (
  month TEXT,
  income DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(date_trunc('month', created_at), 'Month') AS month,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income
  FROM 
    transactions
  WHERE 
    status = 'approved'
    AND created_at >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY 
    date_trunc('month', created_at)
  ORDER BY 
    date_trunc('month', created_at) DESC
  LIMIT 12;
END;
$$ LANGUAGE plpgsql;

-- Create function to delete old transactions
CREATE OR REPLACE FUNCTION delete_old_transactions()
RETURNS void AS $$
BEGIN
  DELETE FROM transactions
  WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_nis ON users(nis);
