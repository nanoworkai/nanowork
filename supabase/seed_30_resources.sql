-- Clear existing seed data
DELETE FROM rent_items WHERE user_id IN (SELECT id FROM profiles LIMIT 1);

-- Insert all 30 resources
INSERT INTO rent_items (user_id, name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured, view_count)
SELECT
  (SELECT id FROM profiles LIMIT 1) as user_id,
  name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured, view_count
FROM (VALUES
  -- COMPUTE
  ('NVIDIA A100 GPU', 'nvidia-a100-gpu', 'High-performance ML training', 'On-demand access to NVIDIA A100 GPUs for deep learning training and large-scale inference. Pre-configured with CUDA, PyTorch, and TensorFlow.', 'compute', 'preview', '⚡', '$2.50/hour', 'Remote', true, true, 42),
  ('H100 GPU Cluster', 'h100-gpu-cluster', 'Next-gen AI training', '8x NVIDIA H100 GPUs in NVLink configuration. Perfect for training large language models and frontier AI research. 640GB total HBM3 memory.', 'compute', 'waitlist_only', '🚀', '$28/hour', 'Remote', true, true, 128),
  ('Raspberry Pi Cluster', 'raspberry-pi-cluster', 'Distributed edge computing', '32-node Raspberry Pi 5 cluster for edge AI, IoT testing, and distributed systems development. Kubernetes pre-installed.', 'compute', 'preview', '🍓', '$0.50/hour', 'Remote', true, false, 67),
  ('Quantum Computing Access', 'quantum-computing', 'IBM Quantum System', 'Time slots on IBM Quantum processors. 127-qubit system for quantum algorithm development and research. Includes Qiskit environment.', 'compute', 'coming_soon', '⚛️', '$150/hour', 'Remote', true, true, 203),
  ('ASIC Mining Rig', 'asic-mining-rig', 'Cryptocurrency mining hardware', 'SHA-256 ASIC miner for Bitcoin and compatible cryptocurrencies. 110 TH/s hashrate. Perfect for testing mining strategies.', 'compute', 'preview', '💎', '$5/hour', 'Remote', true, false, 45),

  -- LAB EQUIPMENT
  ('Benchtop PCR Machine', 'pcr-machine', 'Remote biotech lab access', 'Schedule time slots on a professional PCR thermal cycler. Upload protocols, receive results via API. For biotech research and synthetic biology projects.', 'lab_equipment', 'preview', '🔬', '$200/session', 'San Francisco, CA', true, true, 28),
  ('DNA Sequencer', 'dna-sequencer', 'Next-gen sequencing access', 'Illumina NovaSeq 6000 for whole genome sequencing. Submit samples via mail, receive FASTQ files via API. Perfect for genomics research.', 'lab_equipment', 'waitlist_only', '🧬', '$800/run', 'Boston, MA', true, true, 156),
  ('Electron Microscope', 'electron-microscope', 'Nanoscale imaging', 'Transmission Electron Microscope (TEM) with 0.2nm resolution. Remote operation for materials science, biology, and nanotechnology research.', 'lab_equipment', 'preview', '🔭', '$400/hour', 'Cambridge, MA', true, false, 89),
  ('3D Bioprinter', '3d-bioprinter', 'Tissue engineering platform', 'Print living cells into 3D structures. Upload STL files, specify cell types, receive printed constructs. For regenerative medicine research.', 'lab_equipment', 'coming_soon', '🧫', '$500/print', 'San Diego, CA', true, true, 234),
  ('Mass Spectrometer', 'mass-spectrometer', 'Chemical analysis', 'High-resolution mass spectrometer for proteomics, metabolomics, and small molecule analysis. Submit samples, receive data files via API.', 'lab_equipment', 'preview', '⚗️', '$300/sample', 'San Francisco, CA', true, false, 72),
  ('Flow Cytometer', 'flow-cytometer', 'Cell analysis and sorting', '5-laser flow cytometer for cell analysis and FACS sorting. Remote sample submission, receive sorted populations and data files.', 'lab_equipment', 'preview', '🦠', '$250/session', 'New York, NY', true, false, 61),
  ('Cleanroom Access', 'cleanroom-access', 'ISO Class 5 fabrication', 'Book time in ISO Class 5 cleanroom. Photolithography, plasma etching, and deposition equipment available. Perfect for chip fabrication and MEMS.', 'lab_equipment', 'waitlist_only', '🏭', '$200/hour', 'Palo Alto, CA', true, true, 145),

  -- STORES
  ('Hardware Store Access', 'hardware-store', 'Same-day tool pickup', 'Need a drill, saw, or specialty tool? Book same-day pickup from our hardware store. Perfect for one-off projects without buying equipment.', 'stores', 'preview', '🔨', '$25/day', 'Oakland, CA', true, false, 15),
  ('Makerspace Workshop', 'makerspace-workshop', 'Full fabrication facility', 'CNC mills, laser cutters, 3D printers, welding equipment, and electronics lab. Book by the hour or day. Training available.', 'stores', 'preview', '🛠️', '$40/hour', 'Brooklyn, NY', true, true, 198),
  ('Commercial Kitchen', 'commercial-kitchen', 'Licensed food production', 'FDA-approved commercial kitchen for food startups and R&D. Industrial ovens, mixers, packaging equipment. Health department certified.', 'stores', 'preview', '👨‍🍳', '$60/hour', 'Austin, TX', true, true, 142),
  ('Photography Studio', 'photography-studio', 'Professional photo/video', '2,000 sq ft studio with cyc wall, lighting equipment, and backdrop options. 4K cameras available. Perfect for product photography and content.', 'stores', 'preview', '📸', '$80/hour', 'Los Angeles, CA', true, false, 87),
  ('Electronics Lab', 'electronics-lab', 'Hardware prototyping', 'Oscilloscopes, logic analyzers, soldering stations, and PCB milling. Component library on-site. Perfect for hardware startups.', 'stores', 'preview', '🔌', '$35/hour', 'Seattle, WA', true, false, 93),
  ('Textile Studio', 'textile-studio', 'Fashion and fabric design', 'Industrial sewing machines, digital loom, fabric printer, and pattern-making tools. Sample library included.', 'stores', 'coming_soon', '🧵', '$45/hour', 'Portland, OR', true, false, 54),
  ('Greenhouse Space', 'greenhouse-space', 'Climate-controlled growing', 'Book greenhouse space for plant research and breeding. Automated climate control, grow lights, and irrigation. Perfect for AgTech R&D.', 'stores', 'preview', '🌱', '$100/month/sqft', 'Davis, CA', true, false, 76),

  -- HUMAN SERVICES
  ('Licensed Electrician', 'electrician-services', 'Certified electrical work', 'Book a licensed electrician for commercial or residential projects. Available for consultations, installations, and emergency repairs.', 'human_services', 'preview', '👷', '$85/hour', 'Bay Area, CA', true, false, 33),
  ('CAD Designer', 'cad-designer', 'Mechanical design services', 'Professional CAD designer for product design, prototyping, and manufacturing. Expert in SolidWorks, Fusion 360. DFM consulting included.', 'human_services', 'preview', '📐', '$75/hour', 'Remote', true, true, 167),
  ('Industrial Designer', 'industrial-designer', 'Product design expertise', 'Award-winning industrial designer for consumer products. From concept sketches to production-ready designs. Portfolio includes Fortune 500 clients.', 'human_services', 'waitlist_only', '🎨', '$150/hour', 'Remote', true, true, 245),
  ('Biotech Consultant', 'biotech-consultant', 'PhD-level consulting', 'PhD in molecular biology with 15 years biotech experience. Protocol design, experiment planning, and data analysis. FDA regulatory expertise.', 'human_services', 'preview', '👩‍🔬', '$200/hour', 'Remote', true, false, 112),
  ('Embedded Systems Engineer', 'embedded-engineer', 'Firmware and hardware', 'Senior embedded engineer specializing in IoT devices and edge computing. C/C++, RTOS, ARM Cortex. Hardware bring-up to production.', 'human_services', 'preview', '💻', '$120/hour', 'Remote', true, false, 98),
  ('Patent Attorney', 'patent-attorney', 'IP protection', 'Registered patent attorney with technical background in computer science and biotech. Prior art searches, patent drafting, and prosecution.', 'human_services', 'preview', '⚖️', '$350/hour', 'Remote', true, true, 189),
  ('CNC Machinist', 'cnc-machinist', 'Precision manufacturing', 'Master machinist with 20 years experience. 5-axis CNC milling, turning, and Swiss machining. Aerospace and medical device quality.', 'human_services', 'preview', '⚙️', '$65/hour', 'Denver, CO', true, false, 71),
  ('Lab Technician', 'lab-technician', 'Hands-on lab work', 'Experienced lab tech available for sample prep, assay running, and routine lab operations. Molecular biology and chemistry background.', 'human_services', 'preview', '🧪', '$45/hour', 'San Francisco, CA', true, false, 58),
  ('Data Analyst', 'data-analyst', 'Statistical analysis', 'MS in Statistics with expertise in experimental design and data analysis. R, Python, and specialized tools for scientific computing.', 'human_services', 'preview', '📊', '$90/hour', 'Remote', true, false, 134),
  ('Technical Writer', 'technical-writer', 'Documentation expert', 'Create clear technical documentation, user manuals, and API docs. Background in engineering. Portfolio includes major open-source projects.', 'human_services', 'preview', '📝', '$80/hour', 'Remote', true, false, 92),
  ('Robotics Engineer', 'robotics-engineer', 'Autonomous systems', 'Robotics engineer specializing in perception, motion planning, and control. ROS2, computer vision, and simulation. Hands-on prototyping.', 'human_services', 'waitlist_only', '🤖', '$140/hour', 'Remote', true, true, 276)
) AS data(name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured, view_count);
