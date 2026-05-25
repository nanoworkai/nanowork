-- Spreadsheets feature migration
-- Enables financial modeling, planning, and business intelligence

-- ───────────────────────────────────────────────────────────────────────────
-- TABLES
-- ───────────────────────────────────────────────────────────────────────────

-- Workbooks (top-level spreadsheet documents)
CREATE TABLE IF NOT EXISTS workbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_id UUID REFERENCES builds(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Workbook',
  description TEXT,
  template_id TEXT, -- Reference to template if created from template
  sharing_settings JSONB DEFAULT '{"visibility": "private", "collaborators": []}'::JSONB,
  settings JSONB DEFAULT '{
    "autoSave": true,
    "autoSaveInterval": 30000,
    "showGridLines": true,
    "showFormulas": false,
    "theme": "dark"
  }'::JSONB,
  is_template BOOLEAN DEFAULT false,
  category TEXT, -- For templates: "financial", "budget", "planning", etc.
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sheets (individual tabs within a workbook)
CREATE TABLE IF NOT EXISTS sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Sheet1',
  position INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  protected BOOLEAN DEFAULT false,
  protection_password TEXT, -- Hashed password if protected
  row_count INTEGER DEFAULT 100,
  column_count INTEGER DEFAULT 26,
  frozen_rows INTEGER DEFAULT 0,
  frozen_columns INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{
    "defaultRowHeight": 24,
    "defaultColumnWidth": 100,
    "showGridLines": true
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(workbook_id, position)
);

-- Cell data (stores non-empty cells)
CREATE TABLE IF NOT EXISTS cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  column_index INTEGER NOT NULL,
  value TEXT, -- Raw value (string, number, or formula starting with =)
  computed_value TEXT, -- Calculated result for formulas
  data_type TEXT DEFAULT 'string', -- string, number, boolean, date, formula, error
  format JSONB DEFAULT '{
    "numberFormat": "general",
    "fontFamily": "SF Mono",
    "fontSize": 12,
    "fontWeight": "normal",
    "fontStyle": "normal",
    "textDecoration": "none",
    "textAlign": "left",
    "verticalAlign": "middle",
    "color": "#ffffff",
    "backgroundColor": "transparent",
    "borderTop": null,
    "borderRight": null,
    "borderBottom": null,
    "borderLeft": null
  }'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB, -- For comments, notes, validation rules
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sheet_id, row_index, column_index)
);

-- Named ranges (for easier formula references)
CREATE TABLE IF NOT EXISTS named_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,
  range_start_row INTEGER NOT NULL,
  range_start_column INTEGER NOT NULL,
  range_end_row INTEGER NOT NULL,
  range_end_column INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workbook_id, name)
);

-- AI insights and suggestions
CREATE TABLE IF NOT EXISTS spreadsheet_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- pattern, trend, anomaly, suggestion, formula_help
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence NUMERIC(3, 2) DEFAULT 0.8, -- 0.0 to 1.0
  metadata JSONB DEFAULT '{}'::JSONB,
  is_applied BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ
);

-- Activity log for collaboration and audit
CREATE TABLE IF NOT EXISTS spreadsheet_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- edit, format, insert, delete, formula, import, export
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_workbooks_owner_id ON workbooks(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workbooks_build_id ON workbooks(build_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workbooks_template ON workbooks(is_template, category) WHERE is_template = true;
CREATE INDEX idx_workbooks_updated_at ON workbooks(updated_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX idx_sheets_workbook_id ON sheets(workbook_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sheets_position ON sheets(workbook_id, position) WHERE deleted_at IS NULL;

CREATE INDEX idx_cells_sheet_id ON cells(sheet_id);
CREATE INDEX idx_cells_coordinates ON cells(sheet_id, row_index, column_index);
CREATE INDEX idx_cells_updated_at ON cells(updated_at DESC);

CREATE INDEX idx_named_ranges_workbook_id ON named_ranges(workbook_id);
CREATE INDEX idx_named_ranges_name ON named_ranges(workbook_id, name);

CREATE INDEX idx_insights_workbook_id ON spreadsheet_insights(workbook_id);
CREATE INDEX idx_insights_not_dismissed ON spreadsheet_insights(workbook_id)
  WHERE is_dismissed = false;

CREATE INDEX idx_activity_workbook_id ON spreadsheet_activity(workbook_id);
CREATE INDEX idx_activity_user_id ON spreadsheet_activity(user_id);
CREATE INDEX idx_activity_created_at ON spreadsheet_activity(created_at DESC);

-- ───────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ───────────────────────────────────────────────────────────────────────────

-- Update timestamps
CREATE OR REPLACE FUNCTION update_workbook_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workbooks_updated_at
  BEFORE UPDATE ON workbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_workbook_timestamp();

CREATE TRIGGER sheets_updated_at
  BEFORE UPDATE ON sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_workbook_timestamp();

CREATE TRIGGER cells_updated_at
  BEFORE UPDATE ON cells
  FOR EACH ROW
  EXECUTE FUNCTION update_workbook_timestamp();

-- ───────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE named_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_activity ENABLE ROW LEVEL SECURITY;

-- Workbooks: Users can access their own workbooks
CREATE POLICY workbooks_select_policy ON workbooks
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY workbooks_insert_policy ON workbooks
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY workbooks_update_policy ON workbooks
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY workbooks_delete_policy ON workbooks
  FOR DELETE USING (auth.uid() = owner_id);

-- Sheets: Access based on workbook ownership
CREATE POLICY sheets_select_policy ON sheets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = sheets.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY sheets_insert_policy ON sheets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = sheets.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY sheets_update_policy ON sheets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = sheets.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY sheets_delete_policy ON sheets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = sheets.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

-- Cells: Access based on sheet ownership
CREATE POLICY cells_select_policy ON cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sheets
      JOIN workbooks ON workbooks.id = sheets.workbook_id
      WHERE sheets.id = cells.sheet_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY cells_insert_policy ON cells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sheets
      JOIN workbooks ON workbooks.id = sheets.workbook_id
      WHERE sheets.id = cells.sheet_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY cells_update_policy ON cells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sheets
      JOIN workbooks ON workbooks.id = sheets.workbook_id
      WHERE sheets.id = cells.sheet_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY cells_delete_policy ON cells
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sheets
      JOIN workbooks ON workbooks.id = sheets.workbook_id
      WHERE sheets.id = cells.sheet_id
      AND workbooks.owner_id = auth.uid()
    )
  );

-- Named ranges: Access based on workbook ownership
CREATE POLICY named_ranges_select_policy ON named_ranges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = named_ranges.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY named_ranges_insert_policy ON named_ranges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = named_ranges.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY named_ranges_update_policy ON named_ranges
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = named_ranges.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY named_ranges_delete_policy ON named_ranges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = named_ranges.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

-- Insights: Access based on workbook ownership
CREATE POLICY insights_select_policy ON spreadsheet_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = spreadsheet_insights.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY insights_insert_policy ON spreadsheet_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = spreadsheet_insights.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY insights_update_policy ON spreadsheet_insights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = spreadsheet_insights.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

-- Activity: Users can only read their own workbook activity
CREATE POLICY activity_select_policy ON spreadsheet_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workbooks
      WHERE workbooks.id = spreadsheet_activity.workbook_id
      AND workbooks.owner_id = auth.uid()
    )
  );

CREATE POLICY activity_insert_policy ON spreadsheet_activity
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ───────────────────────────────────────────────────────────────────────────

-- Function to duplicate a workbook (useful for templates)
CREATE OR REPLACE FUNCTION duplicate_workbook(
  source_workbook_id UUID,
  new_owner_id UUID,
  new_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_workbook_id UUID;
  source_sheet RECORD;
  new_sheet_id UUID;
BEGIN
  -- Create new workbook
  INSERT INTO workbooks (owner_id, name, description, template_id, settings, category, tags)
  SELECT new_owner_id, new_name, description, id, settings, category, tags
  FROM workbooks
  WHERE id = source_workbook_id
  RETURNING id INTO new_workbook_id;

  -- Copy sheets
  FOR source_sheet IN
    SELECT * FROM sheets WHERE workbook_id = source_workbook_id ORDER BY position
  LOOP
    INSERT INTO sheets (workbook_id, name, position, visible, row_count, column_count, frozen_rows, frozen_columns, settings)
    VALUES (new_workbook_id, source_sheet.name, source_sheet.position, source_sheet.visible,
            source_sheet.row_count, source_sheet.column_count, source_sheet.frozen_rows,
            source_sheet.frozen_columns, source_sheet.settings)
    RETURNING id INTO new_sheet_id;

    -- Copy cells
    INSERT INTO cells (sheet_id, row_index, column_index, value, computed_value, data_type, format, metadata)
    SELECT new_sheet_id, row_index, column_index, value, computed_value, data_type, format, metadata
    FROM cells
    WHERE sheet_id = source_sheet.id;
  END LOOP;

  -- Copy named ranges
  INSERT INTO named_ranges (workbook_id, name, sheet_id, range_start_row, range_start_column,
                           range_end_row, range_end_column, comment)
  SELECT new_workbook_id, name, sheet_id, range_start_row, range_start_column,
         range_end_row, range_end_column, comment
  FROM named_ranges
  WHERE workbook_id = source_workbook_id;

  RETURN new_workbook_id;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- SEED TEMPLATES
-- ───────────────────────────────────────────────────────────────────────────

-- Note: Templates will be seeded via separate seed script
-- with proper cell formulas and formatting
