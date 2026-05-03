-- Field Service App - Demo Data
-- Run this AFTER schema.sql

-- Insert demo users (passwords will be set via Supabase Auth UI)
-- Note: You'll need to create these users in Supabase Auth first, then update the UUIDs here

-- Demo Work Orders
INSERT INTO public.work_orders (id, title, description, status, priority, equipment_id, location, scheduled_date) VALUES
('WO-001', 'HVAC System Maintenance', 'Annual maintenance check for rooftop HVAC unit. Inspect filters, check refrigerant levels, test thermostat calibration.', 'OPEN', 'MEDIUM', 'HVAC-2024-A1', 'Building A - Rooftop', NOW() + INTERVAL '2 days'),
('WO-002', 'Elevator Emergency Repair', 'Elevator stuck on 3rd floor. Passengers safely evacuated. Requires immediate inspection and repair.', 'IN_PROGRESS', 'URGENT', 'ELEV-B-01', 'Building B - 3rd Floor', NOW()),
('WO-003', 'Plumbing Leak Investigation', 'Water leak reported in basement storage area. Identify source and repair. Check for water damage.', 'OPEN', 'HIGH', 'PLUMB-C-12', 'Building C - Basement', NOW() + INTERVAL '1 day'),
('WO-004', 'Fire Alarm System Test', 'Quarterly fire alarm system test and inspection. Test all zones, verify panel functionality, check battery backup.', 'COMPLETED', 'MEDIUM', 'FIRE-SYS-01', 'All Buildings', NOW() - INTERVAL '2 days'),
('WO-005', 'Generator Preventive Maintenance', 'Monthly generator inspection. Check oil levels, test automatic transfer switch, run load test.', 'COMPLETED', 'MEDIUM', 'GEN-2023-M1', 'Building A - Mechanical Room', NOW() - INTERVAL '5 days'),
('WO-006', 'Lighting Replacement - Parking Lot', 'Replace 8 burned out LED fixtures in north parking lot. Improve visibility for security.', 'OPEN', 'LOW', 'LIGHT-PL-N', 'North Parking Lot', NOW() + INTERVAL '3 days'),
('WO-007', 'Boiler System Inspection', 'Pre-winter boiler inspection. Check pressure, test safety valves, inspect heat exchangers.', 'IN_PROGRESS', 'HIGH', 'BOIL-A-01', 'Building A - Boiler Room', NOW()),
('WO-008', 'Access Control System Upgrade', 'Install new card readers at main entrance. Configure access permissions, test integration with security system.', 'OPEN', 'MEDIUM', 'ACCESS-MAIN', 'Main Entrance', NOW() + INTERVAL '4 days'),
('WO-009', 'Roof Leak Repair', 'Water intrusion during heavy rain. Inspect roof membrane, identify leak source, apply patch or replacement.', 'IN_PROGRESS', 'URGENT', 'ROOF-D-SEC2', 'Building D - Section 2', NOW()),
('WO-010', 'Chiller Maintenance', 'Summer preparation - chiller system maintenance. Clean condenser coils, check refrigerant, test controls.', 'COMPLETED', 'MEDIUM', 'CHILL-A-01', 'Building A - Mechanical', NOW() - INTERVAL '7 days'),
('WO-011', 'Emergency Exit Light Inspection', 'Monthly inspection of all emergency exit lights and signs. Replace batteries as needed.', 'OPEN', 'LOW', 'EMERG-ALL', 'All Buildings', NOW() + INTERVAL '5 days'),
('WO-012', 'Water Heater Replacement', 'Hot water heater showing signs of failure. Age: 12 years. Replace with new energy-efficient unit.', 'OPEN', 'HIGH', 'WH-B-02', 'Building B - Utility Room', NOW() + INTERVAL '1 day'),
('WO-013', 'Security Camera Maintenance', 'Clean camera lenses, check recording system, verify motion detection zones, test night vision.', 'COMPLETED', 'LOW', 'CAM-SYS-01', 'All Locations', NOW() - INTERVAL '3 days'),
('WO-014', 'Compressed Air System Leak', 'Pressure drop detected in compressed air system. Locate and repair leaks, check compressor operation.', 'IN_PROGRESS', 'MEDIUM', 'AIR-COMP-01', 'Building C - Shop Area', NOW()),
('WO-015', 'Landscaping Equipment Repair', 'Riding mower engine failure. Diagnose issue, order parts, complete repair before next scheduled mowing.', 'OPEN', 'LOW', 'MOWER-2022-01', 'Maintenance Yard', NOW() + INTERVAL '6 days');

-- Demo Checklists
INSERT INTO public.checklists (id, work_order_id, title, items) VALUES
('CL-001', 'WO-001', 'HVAC Maintenance Checklist', '[
  {"id": "1", "text": "Inspect and replace air filters", "completed": false},
  {"id": "2", "text": "Check refrigerant levels", "completed": false},
  {"id": "3", "text": "Test thermostat calibration", "completed": false},
  {"id": "4", "text": "Inspect electrical connections", "completed": false},
  {"id": "5", "text": "Clean condenser coils", "completed": false},
  {"id": "6", "text": "Check belt tension and condition", "completed": false},
  {"id": "7", "text": "Test safety controls", "completed": false}
]'::jsonb),

('CL-002', 'WO-002', 'Elevator Emergency Repair', '[
  {"id": "1", "text": "Assess safety of passengers", "completed": true},
  {"id": "2", "text": "Inspect door mechanisms", "completed": true},
  {"id": "3", "text": "Check motor and drive system", "completed": true},
  {"id": "4", "text": "Test safety brakes", "completed": false},
  {"id": "5", "text": "Verify floor alignment", "completed": false},
  {"id": "6", "text": "Run full operational test", "completed": false}
]'::jsonb),

('CL-003', 'WO-003', 'Plumbing Leak Investigation', '[
  {"id": "1", "text": "Locate source of leak", "completed": false},
  {"id": "2", "text": "Shut off water supply if needed", "completed": false},
  {"id": "3", "text": "Assess water damage", "completed": false},
  {"id": "4", "text": "Repair or replace damaged pipe", "completed": false},
  {"id": "5", "text": "Test for additional leaks", "completed": false},
  {"id": "6", "text": "Document damage for insurance", "completed": false}
]'::jsonb),

('CL-004', 'WO-004', 'Fire Alarm System Test', '[
  {"id": "1", "text": "Notify building occupants", "completed": true},
  {"id": "2", "text": "Test all alarm zones", "completed": true},
  {"id": "3", "text": "Verify panel functionality", "completed": true},
  {"id": "4", "text": "Check battery backup", "completed": true},
  {"id": "5", "text": "Test smoke detectors", "completed": true},
  {"id": "6", "text": "Document test results", "completed": true},
  {"id": "7", "text": "Reset system", "completed": true}
]'::jsonb),

('CL-005', 'WO-007', 'Boiler System Inspection', '[
  {"id": "1", "text": "Check water pressure", "completed": true},
  {"id": "2", "text": "Test pressure relief valve", "completed": true},
  {"id": "3", "text": "Inspect heat exchangers", "completed": false},
  {"id": "4", "text": "Check for leaks", "completed": false},
  {"id": "5", "text": "Test ignition system", "completed": false},
  {"id": "6", "text": "Verify thermostat operation", "completed": false}
]'::jsonb),

('CL-006', 'WO-009', 'Roof Leak Repair', '[
  {"id": "1", "text": "Locate leak entry point", "completed": true},
  {"id": "2", "text": "Inspect roof membrane", "completed": true},
  {"id": "3", "text": "Check flashing and seals", "completed": false},
  {"id": "4", "text": "Apply temporary patch", "completed": false},
  {"id": "5", "text": "Schedule permanent repair", "completed": false}
]'::jsonb),

('CL-007', 'WO-014', 'Compressed Air System', '[
  {"id": "1", "text": "Check system pressure", "completed": true},
  {"id": "2", "text": "Listen for air leaks", "completed": true},
  {"id": "3", "text": "Inspect all connections", "completed": false},
  {"id": "4", "text": "Repair identified leaks", "completed": false},
  {"id": "5", "text": "Test compressor operation", "completed": false},
  {"id": "6", "text": "Verify pressure recovery", "completed": false}
]'::jsonb);

-- Note: After running this, you'll need to:
-- 1. Create users in Supabase Auth (admin@saazvat.com, tech@saazvat.com)
-- 2. Get their UUIDs from auth.users table
-- 3. Insert corresponding profiles
-- 4. Update work_orders.assigned_to with actual UUIDs
