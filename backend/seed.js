const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ownermanual',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop tables if exist
    await client.query(`
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS specs CASCADE;
      DROP TABLE IF EXISTS warranty CASCADE;
      DROP TABLE IF EXISTS tutorials CASCADE;
      DROP TABLE IF EXISTS service_centers CASCADE;
      DROP TABLE IF EXISTS parts CASCADE;
      DROP TABLE IF EXISTS recalls CASCADE;
      DROP TABLE IF EXISTS faq CASCADE;
      DROP TABLE IF EXISTS warnings CASCADE;
      DROP TABLE IF EXISTS safety_features CASCADE;
      DROP TABLE IF EXISTS maintenance CASCADE;
      DROP TABLE IF EXISTS troubleshooting CASCADE;
      DROP TABLE IF EXISTS manuals CASCADE;
      DROP TABLE IF EXISTS vehicles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS ai_conversations CASCADE;
    `);

    // Users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicles table
    await client.query(`
      CREATE TABLE vehicles (
        id SERIAL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        trim_level VARCHAR(100),
        engine_type VARCHAR(100),
        image_url VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Manuals table
    await client.query(`
      CREATE TABLE manuals (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        page_number INTEGER,
        chapter VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Troubleshooting table
    await client.query(`
      CREATE TABLE troubleshooting (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        symptom TEXT NOT NULL,
        cause TEXT NOT NULL,
        solution TEXT NOT NULL,
        difficulty VARCHAR(50),
        category VARCHAR(100),
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Maintenance table
    await client.query(`
      CREATE TABLE maintenance (
        id SERIAL PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        interval_miles INTEGER,
        interval_months INTEGER,
        estimated_cost VARCHAR(100),
        difficulty VARCHAR(50),
        category VARCHAR(100),
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safety Features table
    await client.query(`
      CREATE TABLE safety_features (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        how_it_works TEXT,
        activation_conditions TEXT,
        category VARCHAR(100),
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Warning Lights table
    await client.query(`
      CREATE TABLE warnings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        color VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL,
        action_required TEXT NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // FAQ table
    await client.query(`
      CREATE TABLE faq (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100),
        helpful_count INTEGER DEFAULT 0,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Recalls table
    await client.query(`
      CREATE TABLE recalls (
        id SERIAL PRIMARY KEY,
        recall_number VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        affected_vehicles TEXT,
        severity VARCHAR(50),
        status VARCHAR(50),
        remedy TEXT,
        date_issued DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Parts Catalog table
    await client.query(`
      CREATE TABLE parts (
        id SERIAL PRIMARY KEY,
        part_number VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2),
        compatibility TEXT,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Service Centers table
    await client.query(`
      CREATE TABLE service_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(255),
        rating DECIMAL(2,1),
        services_offered TEXT,
        hours TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tutorials table
    await client.query(`
      CREATE TABLE tutorials (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        difficulty VARCHAR(50),
        duration VARCHAR(50),
        steps TEXT,
        tools_needed TEXT,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Warranty table
    await client.query(`
      CREATE TABLE warranty (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        coverage_type VARCHAR(100) NOT NULL,
        duration_years INTEGER,
        duration_miles INTEGER,
        description TEXT NOT NULL,
        exclusions TEXT,
        deductible DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Technical Specs table
    await client.query(`
      CREATE TABLE specs (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        spec_name VARCHAR(255) NOT NULL,
        spec_value VARCHAR(255) NOT NULL,
        unit VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedback table
    await client.query(`
      CREATE TABLE feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI Conversations table
    await client.query(`
      CREATE TABLE ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ============ SEED DATA ============

    // Users (password is "password123" hashed with bcrypt)
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password, full_name, role) VALUES
      ('admin@automanual.com', '${hashedPassword}', 'Admin User', 'admin'),
      ('demo@automanual.com', '${hashedPassword}', 'Demo User', 'user'),
      ('john@example.com', '${hashedPassword}', 'John Smith', 'user')
    `);

    // Vehicles (15+ items)
    await client.query(`
      INSERT INTO vehicles (make, model, year, trim_level, engine_type, description) VALUES
      ('Tesla', 'Model S', 2024, 'Plaid', 'Electric Dual Motor', 'Luxury electric sedan with cutting-edge technology and unmatched performance.'),
      ('BMW', 'X5', 2024, 'xDrive40i', '3.0L Turbo I6', 'Premium midsize SUV combining luxury comfort with sporty driving dynamics.'),
      ('Toyota', 'Camry', 2024, 'XSE', '2.5L Hybrid', 'Americas best-selling sedan with exceptional reliability and fuel efficiency.'),
      ('Ford', 'F-150', 2024, 'Lariat', '3.5L EcoBoost V6', 'Americas best-selling truck with capability, technology, and comfort.'),
      ('Mercedes-Benz', 'E-Class', 2024, 'E450', '3.0L Turbo I6', 'The quintessential executive sedan with advanced driver assistance.'),
      ('Honda', 'CR-V', 2024, 'Touring', '1.5L Turbo', 'Versatile compact SUV with spacious interior and advanced safety.'),
      ('Audi', 'A4', 2024, 'Premium Plus', '2.0L TFSI', 'Refined luxury sedan with quattro AWD and virtual cockpit.'),
      ('Chevrolet', 'Silverado', 2024, 'High Country', '6.2L V8', 'Full-size pickup with best-in-class towing and premium features.'),
      ('Porsche', 'Cayenne', 2024, 'GTS', '4.0L Twin-Turbo V8', 'Sports car performance in an SUV package with luxury appointments.'),
      ('Hyundai', 'Tucson', 2024, 'Limited', '1.6L Turbo Hybrid', 'Stylish compact SUV with cutting-edge design and hybrid efficiency.'),
      ('Volkswagen', 'ID.4', 2024, 'Pro S Plus', 'Electric RWD', 'All-electric compact SUV with spacious interior and long range.'),
      ('Lexus', 'RX', 2024, 'RX 500h', '2.4L Turbo Hybrid', 'Luxury crossover with bold design and hybrid performance.'),
      ('Subaru', 'Outback', 2024, 'Touring XT', '2.4L Turbo', 'Adventure-ready wagon with standard AWD and rugged capability.'),
      ('Mazda', 'CX-5', 2024, 'Turbo Signature', '2.5L Turbo', 'Premium compact SUV with engaging driving dynamics.'),
      ('Rivian', 'R1T', 2024, 'Adventure', 'Quad Motor Electric', 'Electric adventure truck with off-road capability and premium tech.'),
      ('Volvo', 'XC90', 2024, 'Ultimate', 'B6 Mild Hybrid', 'Scandinavian luxury SUV with world-class safety and elegant design.')
    `);

    // Manuals (15+ items)
    await client.query(`
      INSERT INTO manuals (vehicle_id, title, category, content, page_number, chapter) VALUES
      (1, 'Getting Started with Your Vehicle', 'Quick Start', 'Welcome to your new vehicle. This guide covers the essential first steps including key fob setup, seat adjustment, mirror positioning, and initial drive settings. Start by pressing the brake pedal and pressing the Start button.', 1, 'Chapter 1'),
      (1, 'Infotainment System Overview', 'Technology', 'Your vehicle features a state-of-the-art touchscreen infotainment system. Swipe left or right to access different menus. Use pinch-to-zoom on the navigation map. Connect your phone via Bluetooth or USB for Apple CarPlay and Android Auto.', 15, 'Chapter 2'),
      (2, 'All-Wheel Drive System', 'Drivetrain', 'The intelligent AWD system continuously monitors road conditions and distributes power between front and rear axles. In normal driving, power is sent primarily to the rear wheels for efficiency. When slip is detected, torque shifts forward in milliseconds.', 45, 'Chapter 3'),
      (2, 'Climate Control Guide', 'Comfort', 'Your vehicle features a four-zone automatic climate control system. Each passenger can set their preferred temperature. The system includes an air quality sensor that automatically activates recirculation when pollution is detected.', 62, 'Chapter 4'),
      (3, 'Hybrid System Operation', 'Powertrain', 'The hybrid system seamlessly switches between electric motor, gasoline engine, and combined power modes. The EV indicator shows when running on electric power alone. Regenerative braking captures energy during deceleration.', 30, 'Chapter 3'),
      (3, 'Safety Sense Features', 'Safety', 'Your vehicle includes a comprehensive suite of active safety features including Pre-Collision System, Lane Departure Alert, Dynamic Radar Cruise Control, and Automatic High Beams. These systems work together to help prevent accidents.', 78, 'Chapter 5'),
      (4, 'Towing Guide', 'Capability', 'Before towing, verify your vehicles towing capacity for your specific configuration. Connect trailer wiring to the 7-pin connector. Enable Trailer Sway Control in the settings menu. Use the Pro Trailer Backup Assist for easy maneuvering.', 95, 'Chapter 6'),
      (4, 'Payload and Cargo', 'Capability', 'Check the certification label on the drivers door jamb for maximum payload. Distribute cargo evenly in the bed. Use the built-in cargo management system with adjustable tie-downs. The tailgate supports up to 400 lbs when open flat.', 102, 'Chapter 6'),
      (5, 'MBUX System Guide', 'Technology', 'The MBUX (Mercedes-Benz User Experience) system responds to "Hey Mercedes" voice commands. Ask it to adjust climate, navigate to destinations, or make phone calls. The system learns your preferences over time for a personalized experience.', 40, 'Chapter 3'),
      (6, 'Honda Sensing Suite', 'Safety', 'Honda Sensing is a comprehensive suite of safety and driver-assistive technologies. It includes Collision Mitigation Braking, Road Departure Mitigation, Adaptive Cruise Control with Low-Speed Follow, and Lane Keeping Assist.', 55, 'Chapter 4'),
      (7, 'Virtual Cockpit Display', 'Technology', 'The 12.3-inch Audi virtual cockpit replaces traditional gauges with a fully digital display. Toggle between Classic and Infotainment views using the View button on the steering wheel. Navigation maps can be displayed full-width.', 25, 'Chapter 2'),
      (8, 'Super Cruise Operation', 'Technology', 'Super Cruise is a hands-free driving assistance system for compatible highways. Activate it by pressing the Super Cruise button when on a mapped highway. The light bar on the steering wheel indicates system status: green for engaged, blue for Lane Change on Demand.', 88, 'Chapter 7'),
      (9, 'Sport Chrono Package', 'Performance', 'The Sport Chrono Package includes a dashboard-mounted stopwatch, dynamic engine mounts, and the Sport Response button. Press Sport Response for maximum performance for 20 seconds. Use the mode switch to select Normal, Sport, Sport Plus, or Individual.', 70, 'Chapter 5'),
      (10, 'BlueLink Connected Services', 'Technology', 'Hyundai BlueLink provides remote access to your vehicle via smartphone app. Features include remote start, door lock/unlock, vehicle status check, and destination send-to-car. Set up your account at owners.hyundai.com.', 35, 'Chapter 3'),
      (11, 'Charging Your EV', 'Electric', 'Your vehicle supports Level 1 (120V), Level 2 (240V), and DC Fast Charging. A full charge on Level 2 takes approximately 7.5 hours. DC Fast Charging can reach 80% in about 36 minutes. Use the ID. Charger app to find nearby charging stations.', 10, 'Chapter 1'),
      (12, 'Lexus Safety System+', 'Safety', 'Lexus Safety System+ 3.0 includes Pre-Collision System with Pedestrian Detection, All-Speed Dynamic Radar Cruise Control, Lane Tracing Assist, and Automatic High Beams with Adaptive High-beam System.', 60, 'Chapter 4')
    `);

    // Troubleshooting (15+ items)
    await client.query(`
      INSERT INTO troubleshooting (title, symptom, cause, solution, difficulty, category) VALUES
      ('Engine Won''t Start', 'Turning the key produces no sound or a clicking noise', 'Dead or weak battery, corroded terminals, or faulty starter motor', 'Check battery connections for corrosion. Try jump-starting. If the battery is more than 3 years old, consider replacement. If clicking persists, the starter motor may need service.', 'Easy', 'Engine'),
      ('Check Engine Light On', 'Dashboard check engine light illuminates and stays on', 'Various causes including loose gas cap, oxygen sensor, catalytic converter, or mass airflow sensor issues', 'First, check if the gas cap is tight. If light persists, use an OBD-II scanner to read the error code. Common codes: P0420 (catalytic converter), P0171 (fuel system lean), P0300 (random misfire).', 'Medium', 'Engine'),
      ('AC Not Cooling', 'Air conditioning blows warm air instead of cold', 'Low refrigerant, compressor failure, clogged condenser, or blend door actuator malfunction', 'Check if the AC compressor clutch engages when AC is turned on. If not, refrigerant may be low. Have the system pressure-tested by a professional. Do not attempt to add refrigerant without proper equipment.', 'Hard', 'Climate'),
      ('Brake Squealing', 'High-pitched squealing noise when applying brakes', 'Worn brake pads, glazed rotors, dust accumulation, or moisture on brake components', 'Minor squealing in the morning or after rain is normal. Persistent squealing indicates worn pads. Check pad thickness - replace if less than 3mm. Have rotors inspected for scoring or warping.', 'Medium', 'Brakes'),
      ('Battery Draining Overnight', 'Battery is dead after sitting overnight or for a few days', 'Parasitic drain from aftermarket accessories, failing alternator, old battery, or interior lights left on', 'Check for any lights left on. Test battery voltage - should be 12.6V when fully charged. Perform a parasitic draw test. Common culprits: aftermarket stereo, dash cam, or failing door switch.', 'Medium', 'Electrical'),
      ('Transmission Slipping', 'Engine revs increase but vehicle doesn''t accelerate proportionally', 'Low transmission fluid, worn clutch packs, faulty solenoids, or software needs update', 'Check transmission fluid level and condition. Fluid should be red/pink and not smell burnt. Dark or burnt-smelling fluid indicates internal wear. Check for software updates from the dealer.', 'Hard', 'Transmission'),
      ('Steering Wheel Vibration', 'Steering wheel shakes at highway speeds (55-70 mph)', 'Unbalanced tires, bent wheel, worn tie rod ends, or warped brake rotors', 'Start with tire balance - this resolves 70% of vibration issues. Inspect tires for flat spots or uneven wear. If vibration occurs only during braking, rotors likely need resurfacing or replacement.', 'Easy', 'Steering'),
      ('Key Fob Not Working', 'Vehicle doesn''t respond to key fob buttons', 'Dead key fob battery, signal interference, or key fob needs reprogramming', 'Replace the key fob battery (usually CR2032). If the issue persists, hold the fob against the start button to start the vehicle. Re-pair the fob by following the procedure in your owners manual.', 'Easy', 'Electrical'),
      ('Excessive Oil Consumption', 'Oil level drops significantly between oil changes', 'Worn piston rings, valve seal leaks, PCV valve malfunction, or using incorrect oil viscosity', 'Monitor oil consumption by checking the level weekly. Normal consumption is up to 1 quart per 1,000 miles for some engines. Use the manufacturer-recommended oil viscosity. Have a leak-down test performed.', 'Hard', 'Engine'),
      ('Infotainment Frozen', 'Touchscreen is unresponsive or display is frozen', 'Software glitch, memory overflow, or corrupted system cache', 'Perform a soft reset by holding the power button for 10 seconds. If unresolved, try a hard reset by disconnecting the battery for 5 minutes. Check for available software updates from the manufacturer.', 'Easy', 'Technology'),
      ('Rough Idle', 'Engine shakes or vibrates when idling at a stop', 'Dirty throttle body, vacuum leak, worn spark plugs, or dirty fuel injectors', 'Start with spark plug inspection - replace if worn or fouled. Clean the throttle body with appropriate cleaner. Listen for hissing sounds indicating vacuum leaks. Consider a fuel system cleaning service.', 'Medium', 'Engine'),
      ('Door Lock Malfunction', 'One or more door locks won''t lock or unlock electrically', 'Failed door lock actuator, wiring issue, or body control module fault', 'Test all doors individually with the fob and interior switches. If only one door is affected, the actuator likely needs replacement. Check the fuse box for the door lock fuse. Manual lock should still work.', 'Medium', 'Electrical'),
      ('Headlight Condensation', 'Moisture or fogging visible inside headlight housing', 'Cracked housing seal, blocked vent, or temperature differential causing condensation', 'Light condensation that clears after driving is normal. Persistent heavy condensation indicates a seal failure. Check the housing vent tubes for blockage. Seal any visible cracks with headlight sealant.', 'Easy', 'Exterior'),
      ('Suspension Clunking', 'Clunking or knocking noise when driving over bumps', 'Worn sway bar links, strut mounts, ball joints, or control arm bushings', 'Inspect sway bar end links first - they are the most common cause and least expensive to replace. Check strut mounts by pressing down on each corner and listening. Have ball joints checked for play.', 'Medium', 'Suspension'),
      ('Fuel Efficiency Drop', 'Noticeably lower miles per gallon than usual', 'Underinflated tires, dirty air filter, oxygen sensor fault, or driving habit changes', 'Check tire pressure against the door jamb specification. Replace the engine air filter if dirty. Avoid aggressive acceleration and excessive idling. A dragging brake caliper can also reduce efficiency.', 'Easy', 'Fuel System'),
      ('Windshield Wiper Streaking', 'Wipers leave streaks or don''t clear water properly', 'Worn wiper blades, dirty windshield, or contaminated rubber', 'Clean the windshield thoroughly with glass cleaner. Wipe the blade edge with rubbing alcohol. If streaking persists, replace the wiper blades. Consider applying a hydrophobic glass treatment.', 'Easy', 'Exterior')
    `);

    // Maintenance (15+ items)
    await client.query(`
      INSERT INTO maintenance (task_name, description, interval_miles, interval_months, estimated_cost, difficulty, category) VALUES
      ('Oil Change', 'Replace engine oil and oil filter. Use manufacturer-recommended oil weight and quality. Check for leaks after service. Reset the oil life monitor.', 7500, 6, '$50-$120', 'Easy', 'Engine'),
      ('Tire Rotation', 'Rotate tires in the recommended pattern to ensure even wear. Check tire pressure and adjust to specifications. Inspect tread depth and condition.', 7500, 6, '$30-$60', 'Easy', 'Tires'),
      ('Brake Inspection', 'Inspect brake pads, rotors, calipers, and brake lines. Measure pad thickness and rotor condition. Check brake fluid level and condition.', 15000, 12, '$50-$100', 'Medium', 'Brakes'),
      ('Air Filter Replacement', 'Replace the engine air filter to maintain optimal airflow and fuel efficiency. Inspect the air intake duct for debris or damage.', 30000, 24, '$20-$50', 'Easy', 'Engine'),
      ('Cabin Air Filter', 'Replace the cabin air filter to maintain clean air circulation inside the vehicle. Located behind the glove box in most vehicles.', 15000, 12, '$15-$40', 'Easy', 'Climate'),
      ('Transmission Fluid', 'Replace transmission fluid and filter (if applicable). Use manufacturer-specified fluid type. Check for leaks at pan gasket and cooler lines.', 60000, 48, '$150-$300', 'Hard', 'Transmission'),
      ('Coolant Flush', 'Drain and replace engine coolant. Inspect hoses, clamps, water pump, and thermostat. Use the correct coolant type and mixture ratio for your vehicle.', 30000, 24, '$100-$200', 'Medium', 'Engine'),
      ('Spark Plug Replacement', 'Replace spark plugs with manufacturer-specified type. Inspect ignition coils and wires. Check gap specifications and torque to proper specification.', 60000, 48, '$100-$300', 'Medium', 'Engine'),
      ('Battery Test & Service', 'Test battery voltage and cold cranking amps. Clean terminals and apply anti-corrosion treatment. Check charging system output.', 15000, 12, '$0-$30', 'Easy', 'Electrical'),
      ('Wheel Alignment', 'Check and adjust camber, caster, and toe angles to manufacturer specifications. Inspect suspension components for wear. Essential after hitting potholes.', 15000, 12, '$80-$150', 'Medium', 'Steering'),
      ('Brake Fluid Flush', 'Replace brake fluid with fresh DOT-specified fluid. Brake fluid absorbs moisture over time, reducing braking performance. Bleed all four corners.', 30000, 24, '$100-$150', 'Medium', 'Brakes'),
      ('Power Steering Fluid', 'Check and replace power steering fluid if contaminated. Inspect pump, hoses, and rack for leaks. Flush system if fluid is dark or burnt-smelling.', 50000, 36, '$80-$150', 'Medium', 'Steering'),
      ('Serpentine Belt', 'Inspect and replace the serpentine belt. Check belt tensioner for proper operation. Look for cracking, fraying, or glazing on belt surface.', 60000, 48, '$100-$200', 'Medium', 'Engine'),
      ('Wiper Blade Replacement', 'Replace front and rear wiper blades. Test washer fluid spray pattern and nozzle aim. Refill washer fluid reservoir.', 15000, 12, '$20-$50', 'Easy', 'Exterior'),
      ('Multi-Point Inspection', 'Comprehensive vehicle inspection including all fluids, belts, hoses, lights, tires, brakes, suspension, and exhaust system. Identify potential issues early.', 15000, 12, '$50-$100', 'Easy', 'General'),
      ('Differential Service', 'Replace differential fluid in front and/or rear differentials. Inspect for leaks and unusual wear patterns. Use manufacturer-specified gear oil.', 60000, 48, '$100-$200', 'Hard', 'Drivetrain')
    `);

    // Safety Features (15+ items)
    await client.query(`
      INSERT INTO safety_features (name, description, how_it_works, activation_conditions, category) VALUES
      ('Forward Collision Warning', 'Alerts the driver of an impending collision with a vehicle or obstacle ahead.', 'Uses radar and camera sensors to continuously monitor the distance and closing speed to objects ahead. When a potential collision is detected, visual and audible warnings alert the driver.', 'Active above 10 mph. Detects vehicles, pedestrians, and large objects. May not detect motorcycles or small debris.', 'Active Safety'),
      ('Automatic Emergency Braking', 'Automatically applies the brakes if a collision is imminent and the driver has not responded.', 'When Forward Collision Warning determines a crash is unavoidable and the driver hasnt braked, the system applies maximum braking force. Can reduce impact speed by up to 50 mph.', 'Activates after Forward Collision Warning. Works at speeds between 5-90 mph. Cannot fully prevent all collisions.', 'Active Safety'),
      ('Lane Departure Warning', 'Warns when the vehicle begins to drift out of its lane without a turn signal activated.', 'A camera monitors lane markings on the road. When the vehicle approaches or crosses a lane marking without an active turn signal, the system provides a visual alert and steering wheel vibration.', 'Active above 40 mph. Requires visible lane markings. Deactivates when turn signal is used.', 'Active Safety'),
      ('Lane Keep Assist', 'Provides gentle steering input to keep the vehicle centered in its lane.', 'Continuously monitors lane position using a forward-facing camera. When drift is detected, applies subtle steering torque to guide the vehicle back toward the lane center.', 'Active above 40 mph. Requires clear lane markings. Driver must maintain hands on wheel.', 'Active Safety'),
      ('Blind Spot Monitoring', 'Detects vehicles in the drivers blind spots and provides visual warnings.', 'Radar sensors mounted in the rear bumper monitor areas alongside and behind the vehicle. When a vehicle enters the blind spot zone, an indicator illuminates in the corresponding side mirror.', 'Active above 20 mph. Covers the area from the side mirror blind spot to approximately 16 feet behind the vehicle.', 'Active Safety'),
      ('Rear Cross-Traffic Alert', 'Warns of approaching vehicles when reversing out of a parking space.', 'Uses the same radar sensors as Blind Spot Monitoring to detect vehicles approaching from either side while in reverse. Provides audible and visual alerts.', 'Active only when in reverse gear. Detects vehicles up to 65 feet away approaching from the sides.', 'Active Safety'),
      ('Adaptive Cruise Control', 'Maintains set speed while automatically adjusting to maintain safe following distance.', 'Radar sensors measure the distance to the vehicle ahead and automatically adjust speed to maintain the driver-set following distance. Can bring the vehicle to a complete stop in traffic.', 'Can be activated above 25 mph. Driver sets desired speed and following distance. Hands must remain on wheel.', 'Driver Assistance'),
      ('360-Degree Camera System', 'Provides a birds-eye view of the area surrounding the vehicle for parking and maneuvering.', 'Four wide-angle cameras (front, rear, left, right) capture real-time video and are stitched together by software to create a composite overhead view displayed on the infotainment screen.', 'Automatically activates when in reverse. Can be manually activated at low speeds using the camera button.', 'Parking Assist'),
      ('Tire Pressure Monitoring', 'Continuously monitors tire pressure and alerts when pressure falls below safe levels.', 'Sensors in each wheel measure tire pressure in real-time. When pressure drops 25% below the recommended level, a warning light illuminates and specific tire pressures are displayed.', 'Always active. Updates every few seconds while driving. Must be recalibrated after tire rotation or replacement.', 'Passive Safety'),
      ('Electronic Stability Control', 'Helps maintain vehicle control during emergency maneuvers or slippery conditions.', 'Sensors monitor steering input, vehicle speed, and yaw rate. When a loss of traction is detected, the system selectively applies brakes to individual wheels and may reduce engine power.', 'Always active. Cannot be fully disabled. Intervention occurs automatically when slip is detected.', 'Active Safety'),
      ('Anti-Lock Braking System', 'Prevents wheel lockup during hard braking, maintaining steering control.', 'Wheel speed sensors detect when a wheel is about to lock up. The system rapidly pulses brake pressure to that wheel, preventing lockup while maintaining maximum braking force.', 'Activates automatically during hard braking. A pulsating brake pedal is normal during ABS operation.', 'Active Safety'),
      ('Airbag System', 'Multiple airbags deploy in a collision to protect occupants from impact forces.', 'Impact sensors detect collision severity and direction. The airbag control unit determines which airbags to deploy and at what force. Deployment occurs in approximately 30 milliseconds.', 'Deploys based on collision severity and direction. Front airbags deploy in moderate-to-severe frontal impacts. Side and curtain airbags deploy in side impacts.', 'Passive Safety'),
      ('Automatic High Beams', 'Automatically switches between high and low beams based on oncoming traffic.', 'A camera detects headlights of oncoming vehicles and taillights of vehicles ahead. Automatically switches from high beams to low beams to avoid blinding other drivers.', 'Active when headlights are in Auto mode and driving above 25 mph. Manual override always available.', 'Driver Assistance'),
      ('Driver Attention Monitor', 'Monitors driver attentiveness and provides alerts when drowsiness is detected.', 'Analyzes steering patterns, lane position, and driving time to assess driver alertness. Some systems use infrared cameras to monitor eye movement and head position.', 'Begins monitoring after the vehicle has been driven for a set period. Provides escalating warnings from visual to audible.', 'Driver Assistance'),
      ('Hill Start Assist', 'Prevents the vehicle from rolling backward when starting on an incline.', 'Maintains brake pressure for approximately 2 seconds after the driver releases the brake pedal on an incline, providing time to move the foot to the accelerator.', 'Activates automatically when stopped on an incline greater than approximately 5%. Works in both forward and reverse.', 'Driver Assistance'),
      ('Pedestrian Detection', 'Detects pedestrians near or in the vehicles path and can automatically brake.', 'Combines camera and radar data to identify pedestrian shapes and movement patterns. Alerts the driver and can automatically apply emergency braking if a collision with a pedestrian is imminent.', 'Active at speeds between 5-50 mph. Works in daylight and nighttime with headlights on.', 'Active Safety')
    `);

    // Warning Lights (15+ items)
    await client.query(`
      INSERT INTO warnings (name, icon, color, description, severity, action_required, category) VALUES
      ('Check Engine', 'engine', 'amber', 'Indicates a problem with the engine or emissions system. Could range from a loose gas cap to a serious engine malfunction.', 'Medium', 'Check gas cap first. If light persists, schedule service soon. If flashing, reduce speed and seek immediate service.', 'Engine'),
      ('Oil Pressure', 'oil-can', 'red', 'Oil pressure has dropped below safe operating levels. Continued driving may cause severe engine damage.', 'Critical', 'STOP driving immediately. Check oil level. Do not restart engine until oil level is verified. Tow to service if needed.', 'Engine'),
      ('Battery/Charging', 'battery', 'red', 'The charging system is not maintaining proper battery voltage. The battery is being drained.', 'High', 'Reduce electrical load (AC, radio, etc). Drive to nearest service location. Vehicle may stall without warning.', 'Electrical'),
      ('Temperature Warning', 'thermometer', 'red', 'Engine coolant temperature has exceeded safe operating range. Engine is overheating.', 'Critical', 'STOP driving immediately. Turn off AC and turn on heater to help dissipate heat. Do not open radiator cap when hot. Allow engine to cool.', 'Engine'),
      ('Brake System', 'brake', 'red', 'Indicates a problem with the braking system. May indicate low brake fluid, worn pads, or ABS malfunction.', 'Critical', 'Check if parking brake is released. If light stays on, check brake fluid level. Have brakes inspected immediately. Drive cautiously.', 'Brakes'),
      ('ABS Warning', 'abs', 'amber', 'Anti-lock braking system has a fault. Normal braking still functions but ABS may not activate.', 'Medium', 'Normal braking is still available. ABS may not function in emergency stops. Schedule service at earliest convenience.', 'Brakes'),
      ('Tire Pressure', 'tire', 'amber', 'One or more tires has pressure significantly below the recommended level.', 'Medium', 'Check all tire pressures including spare. Inflate to specification on door jamb sticker. If a tire is flat, use spare or roadside assistance.', 'Tires'),
      ('Airbag Warning', 'airbag', 'red', 'A fault has been detected in the airbag system. Airbags may not deploy in a crash.', 'High', 'Have the airbag system diagnosed immediately. Do not ignore this warning. Airbags may not protect you in an accident.', 'Safety'),
      ('Traction Control', 'traction', 'amber', 'Traction control system is actively intervening or has been disabled.', 'Low', 'If flashing, the system is actively working - drive carefully. If solid, the system may be turned off or have a fault.', 'Drivetrain'),
      ('Transmission Temperature', 'transmission', 'red', 'Transmission fluid temperature is too high. May cause transmission damage.', 'High', 'Stop towing immediately if applicable. Pull over and let transmission cool. Check fluid level when cool. Avoid heavy loads.', 'Transmission'),
      ('Power Steering', 'steering', 'amber', 'Electric or hydraulic power steering assist has been reduced or lost.', 'Medium', 'Steering will be harder to turn but still functional. Drive at low speeds to nearest service. Check power steering fluid if hydraulic.', 'Steering'),
      ('Door Ajar', 'door', 'red', 'One or more doors, trunk, or hood is not fully closed.', 'Low', 'Stop safely and check all doors, trunk, and hood. Ensure they are fully latched. Clean door latches if they stick.', 'Body'),
      ('Fuel Level Low', 'fuel', 'amber', 'Fuel level is low. Approximately 30-50 miles of range remaining depending on driving conditions.', 'Low', 'Refuel at the nearest gas station. Avoid running completely empty as this can damage the fuel pump.', 'Fuel System'),
      ('Seat Belt Reminder', 'seatbelt', 'red', 'Driver or front passenger seat belt is not fastened.', 'Medium', 'Fasten all seat belts before driving. This warning will chime for the first few minutes of driving.', 'Safety'),
      ('ESC Off', 'esc', 'amber', 'Electronic Stability Control has been manually turned off or has a system fault.', 'Medium', 'If intentionally turned off, remember to re-enable for normal driving. If warning appeared on its own, have system diagnosed.', 'Drivetrain'),
      ('DEF Level Low', 'def', 'amber', 'Diesel Exhaust Fluid level is low. Vehicle speed may be limited if not refilled.', 'Medium', 'Refill DEF tank at next fuel stop. Vehicle may limit speed to 5 mph if DEF runs out completely. Use only API-certified DEF.', 'Emissions')
    `);

    // FAQ (15+ items)
    await client.query(`
      INSERT INTO faq (question, answer, category, helpful_count) VALUES
      ('How often should I change my oil?', 'Most modern vehicles require an oil change every 7,500 to 10,000 miles with synthetic oil, or every 5,000 miles with conventional oil. Always refer to your specific vehicles maintenance schedule in the owners manual. The oil life monitor on your dashboard provides personalized recommendations based on your driving conditions.', 'Maintenance', 245),
      ('What does the check engine light mean?', 'The check engine light can indicate anything from a loose gas cap to a serious engine problem. First, check if your gas cap is tight. If the light is steady, schedule service soon. If the light is flashing, this indicates a severe misfire - reduce speed and seek immediate service to prevent catalytic converter damage.', 'Diagnostics', 312),
      ('How do I connect my phone via Bluetooth?', 'Go to Settings > Bluetooth on your vehicles infotainment screen. Enable Bluetooth on your phone. Select "Add New Device" on the vehicle screen. Choose your vehicle name from your phones Bluetooth list. Confirm the pairing code matches on both devices. Your phone will now automatically connect when in range.', 'Technology', 189),
      ('What tire pressure should I use?', 'Use the tire pressure specified on the sticker inside the drivers door jamb, NOT the pressure listed on the tire sidewall. The door jamb specification is optimized for your vehicle. Check pressure when tires are cold (not driven for 3+ hours). Recommended pressures are typically between 32-36 PSI.', 'Tires', 278),
      ('How do I use adaptive cruise control?', 'Press the cruise control button on the steering wheel to enable the system. Accelerate to your desired speed and press SET. Use the following distance button to adjust the gap between you and the vehicle ahead (usually 3-4 settings). Press CANCEL or tap the brake to disengage. Resume with the RES button.', 'Technology', 156),
      ('When should I replace my brakes?', 'Brake pads typically last 30,000 to 70,000 miles depending on driving habits and conditions. Warning signs include squealing noise, grinding sound, vibration when braking, or increased stopping distance. Many vehicles have an electronic brake pad wear indicator that will alert you on the dashboard.', 'Maintenance', 198),
      ('How do I reset the maintenance reminder?', 'The procedure varies by vehicle. Generally: 1) Turn ignition to ON without starting engine, 2) Navigate to the maintenance section on the instrument cluster using steering wheel buttons, 3) Select the maintenance item to reset, 4) Press and hold the reset button until the indicator resets. Consult your manual for exact steps.', 'Maintenance', 167),
      ('What fuel type should I use?', 'Use the fuel grade specified on the fuel door or in your owners manual. Regular (87 octane) is sufficient for most vehicles. Premium (91-93 octane) is required for high-performance and turbocharged engines. Using lower octane than required can cause engine knock and reduce performance.', 'Fuel', 234),
      ('How does lane keep assist work?', 'Lane Keep Assist uses a camera to detect lane markings. When the system detects the vehicle drifting toward a lane boundary without a turn signal activated, it provides gentle steering correction to keep you centered. The system requires clear lane markings and works best above 40 mph. Keep your hands on the wheel at all times.', 'Safety', 143),
      ('How do I update my vehicles software?', 'Many modern vehicles support over-the-air (OTA) updates. Check Settings > Software Update on your infotainment screen. Connect to Wi-Fi for faster downloads. Some updates require the vehicle to be parked with adequate battery charge. For vehicles without OTA, visit your dealer for software updates.', 'Technology', 121),
      ('What is regenerative braking?', 'Regenerative braking captures energy during deceleration and converts it to electricity to charge the battery. In hybrid and electric vehicles, lifting off the accelerator activates regenerative braking, slowing the vehicle while recovering energy. The intensity can usually be adjusted in the vehicle settings.', 'Electric', 98),
      ('How do I jump-start my vehicle?', 'Connect the red (+) cable to the dead batterys positive terminal, then to the good batterys positive terminal. Connect the black (-) cable to the good batterys negative terminal, then to an unpainted metal surface on the dead vehicles engine block. Start the good vehicle, wait 2-3 minutes, then start the dead vehicle.', 'Emergency', 267),
      ('What is the break-in period for a new car?', 'Most manufacturers recommend a break-in period for the first 500-1,000 miles. During this time: avoid hard acceleration, dont exceed 3,500 RPM, vary your driving speed, avoid towing, and dont use cruise control for extended periods. This helps engine components seat properly.', 'General', 87),
      ('How do I use the parking sensors?', 'Parking sensors activate automatically when you shift into reverse (rear sensors) or at low speeds (front sensors on some models). Beeping becomes more rapid as you get closer to an object. A solid tone means you are extremely close. Some systems display a visual graphic on the infotainment screen.', 'Parking', 176),
      ('Can I flat-tow my vehicle?', 'Flat-towing capability varies by vehicle and drivetrain. Most RWD and AWD vehicles cannot be flat-towed without disconnecting the driveshaft. Many FWD vehicles can be flat-towed. Electric vehicles generally cannot be flat-towed as it can damage the electric motor. Always consult your owners manual.', 'Towing', 65),
      ('How do I program my garage door opener?', 'Press and hold the two outer HomeLink buttons until the LED flashes rapidly. Hold your garage remote 1-3 inches from the HomeLink buttons and press both your remote button and the desired HomeLink button simultaneously. The LED will flash slowly then rapidly when programmed. You may need to complete rolling code programming at the garage motor unit.', 'Features', 134)
    `);

    // Recalls (15+ items)
    await client.query(`
      INSERT INTO recalls (recall_number, title, description, affected_vehicles, severity, status, remedy, date_issued) VALUES
      ('RC-2024-001', 'Brake Caliper Bolt Torque', 'Front brake caliper mounting bolts may not have been tightened to specification during assembly, potentially leading to caliper detachment.', '2024 Model S, Model X built Jan-Mar 2024', 'Critical', 'Active', 'Dealers will inspect and re-torque brake caliper bolts at no cost to the owner. Service takes approximately 30 minutes.', '2024-04-15'),
      ('RC-2024-002', 'Rearview Camera Delay', 'Rearview camera image may experience a delay of up to 3 seconds when shifting into reverse, reducing visibility.', '2024 X5, X3 built Feb-May 2024', 'Medium', 'Active', 'Software update will be applied to the camera control module. Can be performed via OTA update or at dealership.', '2024-05-20'),
      ('RC-2024-003', 'Fuel Pump Failure', 'Fuel pump impeller may deform during use, causing the engine to stall or not start.', '2023-2024 Camry, RAV4 with 2.5L engine', 'High', 'Active', 'Dealers will replace the fuel pump assembly at no cost. Parts availability expected by end of month.', '2024-03-10'),
      ('RC-2024-004', 'Airbag Sensor Malfunction', 'Front passenger occupant detection sensor may incorrectly classify the seat as empty, preventing airbag deployment.', '2024 F-150, Expedition built Jan-Apr 2024', 'Critical', 'Remedy Available', 'Dealers will replace the occupant detection sensor and recalibrate the system. Service takes approximately 1 hour.', '2024-06-01'),
      ('RC-2024-005', 'Steering Column Lock', 'Electric steering column lock may fail to release, preventing the vehicle from being driven.', '2024 E-Class, C-Class built Dec 2023-Feb 2024', 'Medium', 'Remedy Available', 'Software update to the steering column lock module. Available via OTA or dealer visit.', '2024-04-22'),
      ('RC-2024-006', 'Battery Management Software', 'Battery management software may not properly detect thermal events, potentially causing reduced battery performance.', '2023-2024 ID.4 with 82kWh battery', 'High', 'Active', 'Dealers will update the battery management software. OTA update available for vehicles with software version 3.1+.', '2024-07-08'),
      ('RC-2024-007', 'Child Seat Anchor', 'Lower child seat anchors may not meet strength requirements under certain load conditions.', '2024 CR-V, HR-V built Jan-Mar 2024', 'High', 'Remedy Available', 'Dealers will reinforce the lower anchor mounting points at no cost. Service takes approximately 2 hours.', '2024-05-15'),
      ('RC-2024-008', 'Headlight Alignment', 'LED headlight modules may be misaligned from factory, reducing visibility and potentially blinding oncoming drivers.', '2024 A4, A6 built Feb-Apr 2024', 'Medium', 'Active', 'Dealers will inspect and realign headlight modules using updated calibration procedure.', '2024-06-12'),
      ('RC-2024-009', 'Transmission Shift Logic', 'Transmission may unexpectedly downshift during highway driving, causing sudden deceleration.', '2024 Silverado, Sierra with 10-speed automatic', 'High', 'Remedy Available', 'Dealers will reflash the transmission control module with updated shift logic software.', '2024-03-28'),
      ('RC-2024-010', 'Sunroof Drain Blockage', 'Sunroof drainage tubes may become blocked, causing water intrusion into the cabin and potential electrical issues.', '2024 Cayenne, Macan with panoramic sunroof', 'Medium', 'Active', 'Dealers will inspect and clear drainage tubes, and install updated drain covers to prevent future blockage.', '2024-07-15'),
      ('RC-2024-011', 'Hood Latch Release', 'Secondary hood latch may not fully engage, potentially allowing the hood to open while driving.', '2024 Tucson, Santa Fe built Jan-Feb 2024', 'Critical', 'Remedy Available', 'Dealers will replace the hood latch assembly with an updated design at no cost.', '2024-04-05'),
      ('RC-2024-012', 'EV Charging Port', 'Charging port door actuator may fail, preventing access to the charging port.', '2024 R1T, R1S built Oct 2023-Jan 2024', 'Low', 'Active', 'Dealers will replace the charging port door actuator and update control software.', '2024-05-30'),
      ('RC-2024-013', 'Seatbelt Pretensioner', 'Front seatbelt pretensioners may not activate properly in certain frontal collision scenarios.', '2024 RX, NX built Jan-Mar 2024', 'Critical', 'Remedy Available', 'Dealers will replace both front seatbelt pretensioner assemblies at no cost.', '2024-06-18'),
      ('RC-2024-014', 'Rear Suspension Mount', 'Rear suspension upper mount may crack under heavy load conditions, affecting vehicle handling.', '2024 Outback, Legacy with heavy-duty suspension', 'High', 'Active', 'Dealers will inspect and replace rear suspension upper mounts with reinforced components.', '2024-07-01'),
      ('RC-2024-015', 'Infotainment Reboot', 'Infotainment system may randomly reboot while driving, temporarily disabling backup camera and climate controls.', '2024 CX-5, CX-50 with 10.25-inch display', 'Medium', 'Remedy Available', 'Software update available via OTA or dealer. Resolves memory leak causing system instability.', '2024-05-08'),
      ('RC-2024-016', 'Brake Booster Vacuum', 'Electric brake booster may lose vacuum assist under certain conditions, increasing pedal effort.', '2024 XC90, XC60 built Nov 2023-Mar 2024', 'High', 'Active', 'Dealers will replace the electric brake booster unit with an updated version.', '2024-06-25')
    `);

    // Parts Catalog (15+ items)
    await client.query(`
      INSERT INTO parts (part_number, name, description, category, price, compatibility, in_stock) VALUES
      ('BRK-FP-2024', 'Premium Ceramic Brake Pads (Front)', 'High-performance ceramic front brake pads with noise-dampening shim. Low dust formula for clean wheels.', 'Brakes', 89.99, 'Universal fit for most sedans and SUVs 2020-2024', true),
      ('BRK-RP-2024', 'Premium Ceramic Brake Pads (Rear)', 'Ceramic rear brake pads with chamfered edges for quiet operation. OEM equivalent performance.', 'Brakes', 74.99, 'Universal fit for most sedans and SUVs 2020-2024', true),
      ('FLT-OIL-SYN', 'Synthetic Oil Filter', 'High-capacity synthetic media oil filter. 99% filtration efficiency. Anti-drain back valve included.', 'Filters', 12.99, 'Fits most domestic and Asian vehicles', true),
      ('FLT-AIR-ENG', 'Engine Air Filter', 'High-flow engine air filter with dual-layer filtration media. Improves airflow while trapping fine particles.', 'Filters', 24.99, 'Vehicle-specific. Verify application before purchase.', true),
      ('FLT-AIR-CAB', 'Cabin Air Filter with Activated Carbon', 'Premium cabin air filter with activated carbon layer for odor elimination. Captures 95% of particles down to 2.5 microns.', 'Filters', 19.99, 'Most vehicles 2018-2024. Check application guide.', true),
      ('WPR-BLD-24', 'All-Season Wiper Blade 24 inch', 'Beam-style wiper blade with integrated spoiler. Adapts to windshield curvature. Resists ice and snow buildup.', 'Wipers', 29.99, 'Universal fit with included adapters', true),
      ('SPK-PLG-IR', 'Iridium Spark Plug', 'Long-life iridium-tipped spark plug. Pre-gapped for easy installation. 100,000-mile service life.', 'Ignition', 8.99, 'Application-specific. Sold individually.', true),
      ('BAT-AGM-48', 'AGM Battery Group 48', 'Absorbed Glass Mat battery with 760 CCA. Maintenance-free with 3-year warranty. Optimized for start-stop systems.', 'Electrical', 199.99, 'Group 48 - European vehicles 2015-2024', true),
      ('CLN-ENG-FL', 'Full Synthetic Motor Oil 5W-30 (5 Qt)', 'Premium full synthetic motor oil meeting latest API SP/ILSAC GF-6A specifications. Advanced additive package for extended protection.', 'Fluids', 34.99, 'All vehicles requiring 5W-30 synthetic', true),
      ('CLN-TRN-FL', 'Automatic Transmission Fluid (1 Qt)', 'Multi-vehicle automatic transmission fluid compatible with most domestic and Asian automatic transmissions.', 'Fluids', 14.99, 'Check vehicle requirements for compatibility', true),
      ('CLN-BRK-FL', 'DOT 4 Brake Fluid (32 oz)', 'High-performance DOT 4 brake fluid with high dry and wet boiling points. Suitable for ABS-equipped vehicles.', 'Fluids', 11.99, 'All vehicles requiring DOT 3 or DOT 4', true),
      ('SUS-STR-FR', 'Front Strut Assembly', 'Complete front strut assembly with spring and mount. Ready to install - no spring compression needed.', 'Suspension', 149.99, 'Vehicle-specific. Available for most popular models.', false),
      ('LED-HLD-H11', 'LED Headlight Bulb H11', 'High-output LED headlight bulb with 300% brighter output. Plug-and-play installation. Built-in cooling fan.', 'Lighting', 49.99, 'H11/H9/H8 socket compatible', true),
      ('TIR-SNS-UNI', 'TPMS Sensor Universal', 'Programmable tire pressure monitoring sensor. Compatible with most vehicle TPMS systems. 433MHz frequency.', 'Tires', 39.99, 'Programmable for most 2008-2024 vehicles', true),
      ('ACC-MAT-ALL', 'All-Weather Floor Mat Set', 'Custom-fit all-weather floor mats with deep channels for water and debris. Non-slip backing. Set of 4.', 'Accessories', 89.99, 'Vehicle-specific fit. Select your model.', true),
      ('EXT-MRR-HTD', 'Heated Mirror Glass (Driver Side)', 'Replacement heated mirror glass with built-in defrost element. Easy snap-fit installation.', 'Exterior', 34.99, 'Vehicle-specific. Available for popular models.', true)
    `);

    // Service Centers (15+ items)
    await client.query(`
      INSERT INTO service_centers (name, address, city, state, zip, phone, email, rating, services_offered, hours) VALUES
      ('AutoCare Premier Service', '1250 Main Street', 'San Francisco', 'CA', '94102', '(415) 555-0101', 'sf@autocarepremier.com', 4.8, 'Full Service, Oil Change, Brakes, Tires, Engine Diagnostics, Transmission, AC Service, Electrical', 'Mon-Fri: 7AM-7PM, Sat: 8AM-5PM, Sun: Closed'),
      ('Downtown Auto Experts', '456 Market Avenue', 'New York', 'NY', '10001', '(212) 555-0202', 'nyc@downtownauto.com', 4.6, 'Oil Change, Brakes, Suspension, Alignment, Diagnostics, State Inspection, Tire Service', 'Mon-Fri: 7:30AM-6PM, Sat: 8AM-4PM, Sun: Closed'),
      ('Pacific Motors Service Center', '789 Ocean Boulevard', 'Los Angeles', 'CA', '90012', '(213) 555-0303', 'la@pacificmotors.com', 4.9, 'Full Service, Performance Upgrades, EV Service, Hybrid Repair, Custom Exhaust, Detailing', 'Mon-Sat: 8AM-6PM, Sun: 10AM-4PM'),
      ('Midwest Auto Care', '321 Prairie Road', 'Chicago', 'IL', '60601', '(312) 555-0404', 'chi@midwestautocare.com', 4.5, 'Oil Change, Brakes, Tires, Battery, Cooling System, Steering, Exhaust, Welding', 'Mon-Fri: 7AM-6PM, Sat: 8AM-3PM, Sun: Closed'),
      ('Lone Star Automotive', '567 Texas Avenue', 'Houston', 'TX', '77001', '(713) 555-0505', 'hou@lonestarauto.com', 4.7, 'Full Service, Diesel Repair, Truck Service, Lift Kits, AC Service, Fleet Maintenance', 'Mon-Fri: 6:30AM-7PM, Sat: 7AM-5PM, Sun: Closed'),
      ('Northeast Service Center', '890 Harbor Drive', 'Boston', 'MA', '02101', '(617) 555-0606', 'bos@northeastservice.com', 4.4, 'European Specialists, Oil Change, Brakes, Diagnostics, Electrical, Pre-Purchase Inspection', 'Mon-Fri: 8AM-5:30PM, Sat: 8AM-2PM, Sun: Closed'),
      ('Valley Auto Repair', '234 Desert Road', 'Phoenix', 'AZ', '85001', '(602) 555-0707', 'phx@valleyautorepair.com', 4.6, 'AC Specialist, Cooling System, Oil Change, Brakes, Transmission, Electrical Diagnostics', 'Mon-Fri: 7AM-6PM, Sat: 7AM-4PM, Sun: Closed'),
      ('Emerald City Motors', '678 Pine Street', 'Seattle', 'WA', '98101', '(206) 555-0808', 'sea@emeraldcitymotors.com', 4.8, 'Hybrid & EV Specialist, Full Service, Brakes, Suspension, Software Updates, Charging Install', 'Mon-Fri: 7:30AM-6PM, Sat: 9AM-4PM, Sun: Closed'),
      ('Sunshine Auto Works', '912 Beach Boulevard', 'Miami', 'FL', '33101', '(305) 555-0909', 'mia@sunshineautoworks.com', 4.3, 'Full Service, Paint Protection, Rust Prevention, AC Service, Detailing, Window Tinting', 'Mon-Sat: 8AM-6PM, Sun: 10AM-3PM'),
      ('Rocky Mountain Service', '345 Mountain Pass', 'Denver', 'CO', '80201', '(303) 555-1010', 'den@rockymtnservice.com', 4.7, 'AWD/4WD Specialist, Tire Chains, Lift Kits, Brakes, Oil Change, Pre-Trip Inspection', 'Mon-Fri: 7AM-6PM, Sat: 8AM-4PM, Sun: Closed'),
      ('Liberty Auto Center', '567 Freedom Way', 'Philadelphia', 'PA', '19101', '(215) 555-1111', 'phl@libertyautocenter.com', 4.5, 'Full Service, State Inspection, Emissions, Brakes, Tires, Engine Repair, Transmission', 'Mon-Fri: 7:30AM-5:30PM, Sat: 8AM-3PM, Sun: Closed'),
      ('Motor City Garage', '789 Assembly Line Rd', 'Detroit', 'MI', '48201', '(313) 555-1212', 'det@motorcitygarage.com', 4.8, 'Domestic Specialist, Performance, Engine Rebuild, Transmission, Diagnostics, Custom Work', 'Mon-Fri: 7AM-6PM, Sat: 8AM-4PM, Sun: Closed'),
      ('Peachtree Auto Service', '456 Peachtree Street', 'Atlanta', 'GA', '30301', '(404) 555-1313', 'atl@peachtreeauto.com', 4.6, 'Full Service, Oil Change, Brakes, AC, Diagnostics, Tire Service, Fleet Maintenance', 'Mon-Fri: 7:30AM-6PM, Sat: 8AM-4PM, Sun: Closed'),
      ('Capital Auto Repair', '123 Government Blvd', 'Washington', 'DC', '20001', '(202) 555-1414', 'dc@capitalautorepair.com', 4.4, 'Full Service, European & Asian Import, Diagnostics, Brakes, Electrical, Hybrid Service', 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM, Sun: Closed'),
      ('Golden Gate Auto', '901 Bay Bridge Way', 'Oakland', 'CA', '94601', '(510) 555-1515', 'oak@goldengateauto.com', 4.7, 'Japanese Import Specialist, Full Service, Timing Belt, Head Gasket, Performance, Smog Check', 'Mon-Fri: 8AM-5:30PM, Sat: 8AM-3PM, Sun: Closed'),
      ('Magnolia Motors', '234 Garden District', 'New Orleans', 'LA', '70112', '(504) 555-1616', 'nola@magnoliamotors.com', 4.5, 'Full Service, Flood Damage Repair, Rust Treatment, AC, Electrical, Pre-Purchase Inspection', 'Mon-Fri: 7:30AM-5:30PM, Sat: 8AM-2PM, Sun: Closed')
    `);

    // Tutorials (15+ items)
    await client.query(`
      INSERT INTO tutorials (title, description, category, difficulty, duration, steps, tools_needed) VALUES
      ('How to Check Your Oil Level', 'Learn the proper technique for checking your engines oil level using the dipstick or electronic oil level monitor.', 'Maintenance', 'Beginner', '5 minutes', '1. Park on level ground and turn off engine\n2. Wait 5 minutes for oil to settle\n3. Pull out the dipstick and wipe clean\n4. Reinsert fully and pull out again\n5. Check oil level between MIN and MAX marks\n6. Add oil if below MIN mark\n7. Check oil color - should be amber, not black', 'Paper towel, Correct oil weight if adding'),
      ('Changing a Flat Tire', 'Step-by-step guide to safely changing a flat tire on the roadside using your vehicles spare tire kit.', 'Emergency', 'Beginner', '20 minutes', '1. Pull over to a safe, flat location\n2. Turn on hazard lights\n3. Apply parking brake\n4. Place wheel wedges behind opposite tires\n5. Remove hubcap and loosen lug nuts 1/2 turn\n6. Position jack under vehicle frame\n7. Raise vehicle until flat tire is 6 inches off ground\n8. Remove lug nuts and flat tire\n9. Mount spare tire and hand-tighten lug nuts\n10. Lower vehicle and tighten lug nuts in star pattern', 'Spare tire, Jack, Lug wrench, Wheel wedges'),
      ('Jump Starting a Battery', 'Complete guide to safely jump-starting your vehicle using jumper cables and a donor vehicle.', 'Emergency', 'Beginner', '10 minutes', '1. Position donor vehicle near dead battery vehicle\n2. Turn off both vehicles\n3. Connect red cable to dead battery positive (+)\n4. Connect other red cable to donor battery positive (+)\n5. Connect black cable to donor battery negative (-)\n6. Connect other black cable to unpainted engine metal on dead vehicle\n7. Start donor vehicle, wait 2-3 minutes\n8. Start dead vehicle\n9. Remove cables in reverse order\n10. Drive for 20+ minutes to recharge', 'Jumper cables, Donor vehicle'),
      ('Replacing Wiper Blades', 'How to remove old wiper blades and install new ones for clear visibility in rain and snow.', 'Maintenance', 'Beginner', '10 minutes', '1. Lift wiper arm away from windshield\n2. Press the release tab on the wiper blade\n3. Slide the old blade off the arm hook\n4. Align new blade with the arm hook\n5. Push new blade onto hook until it clicks\n6. Gently lower wiper arm back to windshield\n7. Repeat for other wiper(s)\n8. Test wipers with washer fluid', 'New wiper blades (correct size)'),
      ('Checking Tire Pressure', 'Learn how to properly check and adjust tire pressure for safety and fuel efficiency.', 'Maintenance', 'Beginner', '10 minutes', '1. Find recommended pressure on door jamb sticker\n2. Check tires when cold (not driven 3+ hours)\n3. Remove valve cap from tire\n4. Press gauge firmly onto valve stem\n5. Read the pressure measurement\n6. Compare to recommended specification\n7. Add air if low, release if over-inflated\n8. Replace valve cap\n9. Repeat for all tires including spare', 'Tire pressure gauge, Air compressor or gas station air'),
      ('Replacing Engine Air Filter', 'Quick guide to replacing your engine air filter for better performance and fuel economy.', 'Maintenance', 'Beginner', '10 minutes', '1. Open the hood and locate the air filter box\n2. Unclip or unscrew the air filter box cover\n3. Remove the old air filter\n4. Inspect the housing for debris and clean\n5. Insert new filter with correct orientation\n6. Replace cover and secure all clips/screws\n7. Ensure the box is properly sealed', 'New engine air filter, Screwdriver (if needed)'),
      ('Pairing Your Phone via Bluetooth', 'Connect your smartphone to the vehicles infotainment system for hands-free calling and audio streaming.', 'Technology', 'Beginner', '5 minutes', '1. Turn on vehicle and infotainment system\n2. Go to Settings > Bluetooth on vehicle screen\n3. Enable Bluetooth on your phone\n4. Select Add New Device on vehicle\n5. Find vehicle name in phone Bluetooth list\n6. Confirm matching pairing code\n7. Allow contacts and message access when prompted\n8. Test with a phone call or music', 'Smartphone with Bluetooth'),
      ('Setting Up Apple CarPlay', 'Connect your iPhone to use Apple CarPlay for navigation, music, messaging, and more.', 'Technology', 'Beginner', '5 minutes', '1. Connect iPhone to vehicle USB port with Lightning/USB-C cable\n2. If prompted, allow CarPlay on your phone\n3. CarPlay will appear on infotainment screen\n4. Use touch screen or Siri for control\n5. Set up wireless CarPlay (if supported) in Settings\n6. Configure which apps appear on CarPlay screen', 'iPhone, USB cable (Lightning or USB-C)'),
      ('Checking and Topping Coolant', 'How to safely check coolant level and add coolant when needed to prevent overheating.', 'Maintenance', 'Intermediate', '10 minutes', '1. NEVER open coolant cap when engine is hot\n2. Wait for engine to cool completely\n3. Locate the coolant reservoir (translucent tank)\n4. Check fluid level against MIN/MAX marks\n5. If low, remove reservoir cap slowly\n6. Add correct coolant type (check manual)\n7. Fill to MAX line\n8. Replace cap and check for leaks', 'Correct coolant type, Funnel, Gloves'),
      ('Replacing Cabin Air Filter', 'Replace your cabin air filter for cleaner air inside your vehicle and better HVAC performance.', 'Maintenance', 'Beginner', '15 minutes', '1. Open glove box\n2. Press sides of glove box to release stops\n3. Lower glove box past its normal range\n4. Locate the cabin filter cover behind glove box\n5. Press tabs and remove the cover\n6. Slide out old filter (note airflow direction arrow)\n7. Insert new filter with arrow pointing down/toward rear\n8. Replace cover and glove box', 'New cabin air filter'),
      ('Using Paddle Shifters', 'Master the art of manual gear selection using your vehicles paddle shifters for a sportier drive.', 'Driving', 'Intermediate', '15 minutes', '1. Switch to Sport mode (if available)\n2. Right paddle (+) shifts up, left paddle (-) shifts down\n3. Downshift before entering corners for engine braking\n4. Upshift near redline for maximum acceleration\n5. System will auto-upshift to prevent over-revving\n6. System will auto-downshift when stopping\n7. Return to Drive mode to exit manual control', 'Vehicle with paddle shifters'),
      ('Programming Garage Door Opener', 'Set up your vehicles built-in HomeLink system to open your garage door.', 'Features', 'Intermediate', '10 minutes', '1. Clear existing HomeLink programming (hold outer buttons 20 sec)\n2. Hold garage remote 1-3 inches from HomeLink buttons\n3. Press garage remote and desired HomeLink button simultaneously\n4. Release when HomeLink LED changes from slow to rapid flash\n5. At garage motor, press Learn/Program button\n6. Within 30 seconds, press programmed HomeLink button twice\n7. Test operation from vehicle', 'Garage door remote, Access to garage motor unit'),
      ('Adjusting Side Mirror Positions', 'Set your side mirrors for optimal visibility and minimal blind spots using the BGE method.', 'Safety', 'Beginner', '5 minutes', '1. Sit in normal driving position\n2. For left mirror: lean head against window, adjust mirror to barely show car side\n3. Return to normal position - mirror now shows blind spot area\n4. For right mirror: lean to center console, adjust mirror to barely show car side\n5. Return to normal - significantly reduced blind spots\n6. Fine-tune while driving on multi-lane road', 'None'),
      ('Calibrating TPMS After Tire Rotation', 'Reset the Tire Pressure Monitoring System after a tire rotation or tire replacement.', 'Maintenance', 'Intermediate', '5 minutes', '1. Ensure all tires are inflated to correct pressure\n2. Turn ignition to ON (dont start engine)\n3. Navigate to Vehicle Settings on infotainment\n4. Select Tire Pressure or TPMS section\n5. Choose Calibrate or Reset option\n6. Confirm the reset\n7. Drive for 20-30 minutes at 30+ mph\n8. System will recalibrate automatically', 'Tire pressure gauge'),
      ('Using Trailer Backup Assist', 'Learn to use your trucks trailer backup assist system for easy trailer maneuvering.', 'Towing', 'Advanced', '20 minutes', '1. Attach trailer and configure system with trailer info\n2. Place target sticker on trailer\n3. Shift to reverse\n4. Press Trailer Assist button\n5. Use the knob to set desired trailer direction\n6. Vehicle controls steering automatically\n7. Control speed with brake pedal only\n8. Monitor cameras for obstacles\n9. Practice in open area first', 'Compatible trailer, Target sticker (included with vehicle)'),
      ('Setting Up Driver Profile', 'Create and customize your driver profile to save seat, mirror, and infotainment preferences.', 'Features', 'Beginner', '10 minutes', '1. Go to Settings > Driver Profile on infotainment\n2. Select Create New Profile\n3. Enter your name\n4. Adjust seat to your preferred position\n5. Set mirrors to your preference\n6. Configure steering wheel position\n7. Set climate preferences\n8. Save profile\n9. Link to your key fob for automatic loading', 'None')
    `);

    // Warranty (15+ items)
    await client.query(`
      INSERT INTO warranty (name, coverage_type, duration_years, duration_miles, description, exclusions, deductible) VALUES
      ('Basic Vehicle Warranty', 'Bumper-to-Bumper', 3, 36000, 'Covers virtually every component of your new vehicle from defects in materials and workmanship. Includes all mechanical and electrical components, body hardware, and audio/entertainment systems.', 'Wear items (brake pads, wiper blades, tires), damage from accidents or misuse, aftermarket modifications, cosmetic damage', 0.00),
      ('Powertrain Warranty', 'Powertrain', 5, 60000, 'Covers the engine, transmission, transfer case, and drive axles against defects. Includes all internal engine components, turbochargers, superchargers, and transmission/transaxle assemblies.', 'Damage from overheating, lack of maintenance, use of incorrect fluids, racing or competition use', 0.00),
      ('Corrosion Warranty', 'Corrosion Perforation', 5, 100000, 'Covers body sheet metal panels against rust-through (perforation) corrosion from the inside out. Includes repair or replacement of affected panels and repainting.', 'Surface rust, cosmetic rust, damage from road debris, aftermarket body modifications, vehicles operated in industrial environments', 0.00),
      ('Battery Warranty (EV)', 'EV Battery', 8, 100000, 'Covers the high-voltage battery pack against defects and capacity degradation below 70% of original capacity. Includes battery management system and related cooling components.', 'Capacity loss from extreme temperatures, damage from unauthorized charging equipment, battery damage from accidents', 0.00),
      ('Emissions Warranty', 'Federal Emissions', 2, 24000, 'Covers emissions-related components as required by federal law. Includes catalytic converter, ECU, and onboard diagnostics for the extended period of 8 years/80,000 miles.', 'Damage from use of leaded fuel, tampering with emissions equipment, aftermarket exhaust modifications', 0.00),
      ('Extended Powertrain', 'Extended Warranty', 7, 100000, 'Extended coverage for powertrain components beyond the basic warranty period. Transferable to subsequent owners. Includes rental car reimbursement during covered repairs.', 'Pre-existing conditions, commercial use vehicles, vehicles with salvage titles', 100.00),
      ('Premium Care Plan', 'Comprehensive Extended', 6, 75000, 'Nearly bumper-to-bumper coverage with over 1,000 components covered. Includes electrical, AC, steering, suspension, brakes, and technology components.', 'Maintenance items, cosmetic damage, pre-existing conditions, vehicles over 80,000 miles at enrollment', 50.00),
      ('Roadside Assistance', 'Roadside', 3, 36000, 'Provides 24/7 emergency roadside assistance including towing, flat tire change, jump start, lockout service, and fuel delivery.', 'Vehicles stuck in off-road conditions, damage during towing of other vehicles, repeated services for same issue', 0.00),
      ('Paint Protection', 'Exterior', 3, 36000, 'Covers defects in exterior paint including peeling, fading, chalking, and loss of gloss due to manufacturing defects in paint or application.', 'Environmental damage (acid rain, bird droppings, tree sap), scratches, chips from road debris, improper washing techniques', 0.00),
      ('Hybrid Component Warranty', 'Hybrid System', 8, 100000, 'Covers hybrid-specific components including hybrid battery pack, power inverter, electric motor/generator, and hybrid control module.', 'Damage from unauthorized modifications, use of non-approved replacement parts, normal battery capacity degradation within limits', 0.00),
      ('Tire Warranty', 'Tires', 3, 50000, 'Covers original equipment tires against defects in materials and workmanship. Pro-rated replacement based on remaining tread life. Includes road hazard protection.', 'Damage from improper inflation, misalignment, overloading, racing, off-road use beyond vehicle capability', 0.00),
      ('Certified Pre-Owned Warranty', 'CPO Extended', 1, 12000, 'Additional warranty coverage for Certified Pre-Owned vehicles. Begins at expiration of original powertrain warranty. Covers 500+ components.', 'Vehicles not meeting CPO inspection criteria, aftermarket modifications, commercial use', 50.00),
      ('Audio/Technology Warranty', 'Technology', 3, 36000, 'Covers the infotainment system, navigation unit, premium audio components, heads-up display, and connected services hardware.', 'Software issues addressable by updates, antenna damage, damage from aftermarket installations, screen burn-in from static images', 0.00),
      ('Safety Restraint Warranty', 'Safety Systems', 5, 60000, 'Covers all safety restraint system components including seatbelts, pretensioners, airbag modules, sensors, and the airbag control unit.', 'Deployment from accident (covered by collision insurance), damage from unauthorized modifications, cosmetic damage to covers', 0.00),
      ('Accessories Warranty', 'Dealer Accessories', 3, 36000, 'Covers dealer-installed accessories including roof racks, running boards, bed liners, tonneau covers, and trailer hitches against defects.', 'Damage from improper use, overloading beyond rated capacity, accessories not installed by authorized dealer, cosmetic wear', 0.00),
      ('Commercial Vehicle Warranty', 'Commercial', 5, 100000, 'Enhanced warranty for commercially registered vehicles. Covers powertrain, chassis, and body components. Includes priority service scheduling.', 'Taxi/rideshare use unless specifically enrolled, racing, off-road commercial use, vehicles exceeding GVWR', 75.00)
    `);

    // Technical Specs (15+ items)
    await client.query(`
      INSERT INTO specs (vehicle_id, category, spec_name, spec_value, unit, notes) VALUES
      (1, 'Performance', 'Horsepower', '1,020', 'hp', 'Plaid tri-motor configuration'),
      (1, 'Performance', '0-60 mph', '1.99', 'seconds', 'With rollout subtracted'),
      (1, 'Performance', 'Top Speed', '200', 'mph', 'With track mode enabled'),
      (1, 'Battery', 'Range', '396', 'miles', 'EPA estimated range'),
      (1, 'Battery', 'Battery Capacity', '100', 'kWh', 'Usable capacity'),
      (2, 'Performance', 'Horsepower', '375', 'hp', 'B58 turbocharged inline-6'),
      (2, 'Performance', '0-60 mph', '4.4', 'seconds', 'xDrive all-wheel drive'),
      (2, 'Dimensions', 'Cargo Volume', '72.3', 'cu ft', 'Rear seats folded'),
      (2, 'Fuel Economy', 'Combined MPG', '26', 'mpg', 'EPA combined estimate'),
      (3, 'Performance', 'Horsepower', '225', 'hp', 'Combined hybrid system output'),
      (3, 'Fuel Economy', 'Combined MPG', '52', 'mpg', 'EPA combined estimate for hybrid'),
      (3, 'Dimensions', 'Trunk Volume', '15.1', 'cu ft', 'Sedan configuration'),
      (4, 'Performance', 'Horsepower', '400', 'hp', '3.5L EcoBoost V6'),
      (4, 'Performance', 'Torque', '500', 'lb-ft', 'Maximum towing torque'),
      (4, 'Capability', 'Max Towing', '13,000', 'lbs', 'Properly equipped'),
      (4, 'Capability', 'Payload', '2,238', 'lbs', 'Maximum payload capacity'),
      (5, 'Performance', 'Horsepower', '375', 'hp', '3.0L turbo inline-6 with mild hybrid'),
      (5, 'Dimensions', 'Wheelbase', '116.2', 'inches', 'Standard wheelbase model'),
      (9, 'Performance', 'Horsepower', '453', 'hp', '4.0L twin-turbo V8'),
      (9, 'Performance', '0-60 mph', '4.2', 'seconds', 'With Sport Chrono Package'),
      (11, 'Battery', 'Range', '275', 'miles', 'EPA estimated range Pro S Plus'),
      (11, 'Battery', 'Charging Speed', '170', 'kW', 'DC fast charging maximum'),
      (15, 'Performance', 'Horsepower', '835', 'hp', 'Quad motor configuration'),
      (15, 'Battery', 'Range', '328', 'miles', 'EPA estimated large battery pack'),
      (15, 'Capability', 'Max Towing', '11,000', 'lbs', 'With Max Tow package')
    `);

    // Feedback (15+ items)
    await client.query(`
      INSERT INTO feedback (user_id, subject, message, category, status, priority, response) VALUES
      (2, 'Bluetooth Connectivity Issues', 'My phone keeps disconnecting from Bluetooth every few minutes while driving. I have a Samsung Galaxy S24 running Android 14.', 'Technology', 'in_progress', 'medium', 'We are aware of this issue with certain Android 14 devices. A software update is being prepared. In the meantime, try deleting the pairing and reconnecting.'),
      (2, 'Oil Change Interval Confusion', 'The dashboard says oil life is at 30% but its only been 3,000 miles since last change. Is this normal?', 'Maintenance', 'resolved', 'low', 'Yes, this is normal. The oil life monitor considers driving conditions, not just mileage. Frequent short trips, extreme temperatures, and towing reduce oil life faster. Trust the monitor.'),
      (3, 'Unusual Brake Noise', 'Hearing a grinding noise from the front brakes, especially in the morning. Vehicle has 28,000 miles.', 'Brakes', 'open', 'high', NULL),
      (2, 'CarPlay Not Working After Update', 'After the latest infotainment update, Apple CarPlay no longer connects wirelessly. Wired connection works fine.', 'Technology', 'in_progress', 'medium', 'We have identified a bug in the latest update affecting wireless CarPlay. A hotfix will be released within 2 weeks.'),
      (3, 'Request for Towing Guide', 'I just purchased a travel trailer and need detailed information about towing setup and weight distribution.', 'Documentation', 'resolved', 'low', 'Please refer to Chapter 6 of your owners manual for comprehensive towing guidelines. We have also published an updated towing guide on our website.'),
      (2, 'AC Making Clicking Sound', 'The air conditioning system makes a clicking noise when first turned on and occasionally during operation.', 'Climate', 'open', 'medium', NULL),
      (3, 'Key Fob Battery Life', 'Had to replace key fob battery twice in 6 months. Is this normal? Using CR2032 batteries.', 'Electrical', 'resolved', 'low', 'Typical key fob battery life is 1-2 years. Frequent replacement may indicate: proximity to electronic devices during storage, extreme temperatures, or a faulty fob. We recommend visiting a dealer for fob diagnostic.'),
      (2, 'Adaptive Cruise Not Engaging', 'Adaptive cruise control shows an error message and wont engage when I try to set it on the highway.', 'Safety Systems', 'in_progress', 'high', 'This may be caused by a dirty radar sensor or camera. Clean the front radar sensor (located in the grille) and the windshield camera area. If the issue persists, the sensors may need recalibration.'),
      (3, 'Feature Request: Remote Start Duration', 'Can the remote start time be extended beyond 10 minutes? In cold weather, 10 minutes is not enough to warm the cabin.', 'Feature Request', 'open', 'low', NULL),
      (2, 'Lane Departure Too Sensitive', 'Lane departure warning activates too frequently on narrow roads. Can the sensitivity be adjusted?', 'Safety Systems', 'resolved', 'low', 'Yes, you can adjust the sensitivity in Settings > Driver Assistance > Lane Departure Warning. Choose between High, Medium, and Low sensitivity, or disable it temporarily.'),
      (3, 'Dashboard Rattle at Highway Speed', 'Developing a rattle from the dashboard area that appears above 60 mph. No visible loose components.', 'Interior', 'open', 'medium', NULL),
      (2, 'EV Charging Station Finder Outdated', 'Several charging stations shown in the navigation system are no longer operational. Data seems outdated.', 'Technology', 'in_progress', 'medium', 'We are updating our charging station database. The next OTA map update will include the latest PlugShare data with real-time availability.'),
      (3, 'Windshield Washer Weak Spray', 'Washer fluid spray is very weak and barely reaches the center of the windshield. Reservoir is full.', 'Exterior', 'open', 'low', NULL),
      (2, 'Seat Memory Not Saving', 'Driver seat memory position 1 keeps reverting to a different position after the vehicle is turned off.', 'Interior', 'in_progress', 'medium', 'This may be caused by a seat position sensor issue. We recommend visiting the dealer for a diagnostic. In the meantime, try reprogramming: adjust seat, hold Memory + 1 for 5 seconds.'),
      (3, 'Tire Wear Concern', 'Front tires showing significantly more wear on the inside edge at only 15,000 miles. Alignment was done at 5,000 miles.', 'Tires', 'open', 'high', NULL),
      (2, 'Compliment - Great AI Assistant', 'Just wanted to say the AI assistant in the owners manual app has been incredibly helpful. Saved me a trip to the dealer!', 'General', 'resolved', 'low', 'Thank you for the kind feedback! We are constantly improving our AI assistant to provide even better support.')
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully with all 15 features!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
if (process.env.ALLOW_DEMO_SEED !== 'true') { console.error('Demo seed refused; set ALLOW_DEMO_SEED=true explicitly.'); process.exit(64); }
