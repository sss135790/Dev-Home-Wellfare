export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface EmergencyContact {
  id: string;
  name: string;
  profession: string;
  phone: string;
  availability: string;
  description: string;
}

export const CONTACT_NUMBERS: EmergencyContact[] = [
  {
    id: "elec-1",
    name: "Vikram Rathore",
    profession: "Emergency Electrician",
    phone: "+91 98765 00101",
    availability: "24/7 Availability",
    description: "Handles short circuits, backup power generator faults, and common electrical meter board failures in the society premises."
  },
  {
    id: "plum-1",
    name: "Ramesh Kumar",
    profession: "Emergency Plumber",
    phone: "+91 98765 00102",
    availability: "24/7 Availability",
    description: "Handles common overhead tank leaks, primary water line pipe blockages, and resident washroom plumbing emergencies."
  },
  {
    id: "sec-1",
    name: "Main Security Gate",
    profession: "Society Guard Desk",
    phone: "+91 98765 00103",
    availability: "24/7 Availability",
    description: "Connect directly to the security gate guards for parking blockages, suspicious visitors, or gate pass verification queries."
  },
  {
    id: "off-1",
    name: "Welfare Society Office",
    profession: "General Manager",
    phone: "+91 98765 00104",
    availability: "9:00 AM - 6:00 PM",
    description: "Reach the manager for moving permissions, clubhouse bookings, billing queries, and general administrative requests."
  },
  {
    id: "lift-1",
    name: "Otis Lift Helpdesk",
    profession: "Lift Technician",
    phone: "+91 98765 00105",
    availability: "24/7 Availability",
    description: "Dedicated emergency support in case of elevator stops, power failure traps, or alarm failures in any block wing."
  }
];

interface RuleItem {
  id: string;
  title: string;
  category: string;
  short: string;
  details: string;
  fine?: string;
}

export const RULES_DATA: RuleItem[] = [
  {
    id: "gen-1",
    category: "General Conduct",
    title: "Quiet Hours Compliance",
    short: "No loud noises or renovations permitted between 10:00 PM and 7:00 AM.",
    details: "Noise levels must be kept to a minimum during the quiet hours. Major apartment renovations, high-volume music systems, and loud social gatherings are strictly prohibited to ensure residents' peaceful sleep. Emergency maintenance works are exempted.",
    fine: "₹500 for the first violation; ₹1,500 for subsequent offenses."
  },
  {
    id: "gen-2",
    category: "General Conduct",
    title: "Tenant Registration",
    short: "All tenants must register details with the society office before move-in.",
    details: "Prior to renting out any apartment unit, the flat owner must submit tenant details (including ID proof, police verification forms, and rental agreement) to the management office. Move-in operations are not allowed without police verification approval.",
    fine: "₹5,000 penalty for unregistered tenant move-ins."
  },
  {
    id: "park-1",
    category: "Parking Policies",
    title: "Sticker Identification",
    short: "All resident vehicles must display the society's official parking sticker.",
    details: "Vehicles parked in resident slots must have the official Dev_Homes sticker visible on the front windshield. Security personnel will report/clamp vehicles parked without valid stickers.",
    fine: "Vehicle clamping removal charges of ₹1,000."
  },
  {
    id: "park-2",
    category: "Parking Policies",
    title: "Speed Limit inside Premises",
    short: "Vehicle speeds must not exceed 10 km/h within the society campus.",
    details: "To ensure children's and elder pedestrians' safety, all motor vehicles must drive slowly inside campus roads. Reckless driving will lead to parking permit suspension.",
    fine: "₹1,000 fine and potential temporary entry ban."
  },
  {
    id: "club-1",
    category: "Clubhouse & Pool",
    title: "Booking & Access Hours",
    short: "Clubhouse slots must be booked 7 days in advance; Pool hours are 6 AM - 9 PM.",
    details: "The central party hall is available for booking via the society office. A cleaning fee and security deposit are required. Swimming pool usage requires appropriate swimming attire. Children below 12 must be supervised by an adult at all times.",
    fine: "Forfeiture of security deposit for cleaning failures."
  },
  {
    id: "pet-1",
    category: "Pet Regulations",
    title: "Leash & Cleanup Rules",
    short: "Pets must be leashed in common spaces. Owners must clean pet litter.",
    details: "All pet dogs/cats must be on a leash when walking in corridors, parks, or parking spaces. Owners are solely responsible for cleaning up any excreta. Pets are not allowed on children's play equipment.",
    fine: "₹500 fine per littering incident."
  },
  {
    id: "waste-1",
    category: "Waste Management",
    title: "Garbage Segregation",
    short: "Separate wet (biodegradable) and dry (recyclable) waste.",
    details: "Residents must segregate waste into wet waste (organic kitchen waste, green bins) and dry waste (plastic, paper, glass, blue bins). Hazardous waste (needles, chemicals) must be handed over separately to municipal collectors.",
    fine: "₹200 sorting penalty fee added to monthly maintenance bills."
  }
];

interface BlockData {
  id: string;
  name: string;
  image: string;
  floors: number;
  apartments: number;
  occupancy: string;
  supervisor: string;
  description: string;
  amenities: string[];
}

export const BLOCKS: BlockData[] = [
  {
    id: "A",
    name: "Block A (Skyview Heights)",
    image: "/assets/block_a.jpg",
    floors: 14,
    apartments: 56,
    occupancy: "92%",
    supervisor: "Mr. Ramesh Sharma",
    description: "Dev_Homes Block A offers panoramic views of the city skyline, featuring an advanced firefighting system, triple-height premium lobby, and dedicated visitor parking slots.",
    amenities: ["Rooftop Solar", "Double Elevators", "24/7 Security Patrol", "Indoor Games Room"]
  },
  {
    id: "B",
    name: "Block B (Meadow View)",
    image: "/assets/block_b.jpg",
    floors: 12,
    apartments: 48,
    occupancy: "85%",
    supervisor: "Mrs. Anita Desai",
    description: "Surrounded by manicured gardens, Block B is tailored for nature lovers. It houses the society's green-waste composting unit and has direct access to the children's park.",
    amenities: ["Rainwater Harvesting", "Children's Park Access", "Intercom Facility", "EV Charging Point"]
  },
  {
    id: "C",
    name: "Block C (Clubhouse Vista)",
    image: "/assets/block_c.jpg",
    floors: 15,
    apartments: 60,
    occupancy: "95%",
    supervisor: "Mr. Joseph D'Souza",
    description: "Block C is located adjacent to the central clubhouse. It provides immediate access to the swimming pool and community gym, making it a prime residential choice.",
    amenities: ["Swimming Pool Proximity", "Health Club Access", "Piped Gas System", "Power Backup"]
  },
  {
    id: "D",
    name: "Block D (Serene Court)",
    image: "/assets/block_d.jpg",
    floors: 10,
    apartments: 40,
    occupancy: "88%",
    supervisor: "Mrs. Priya Patel",
    description: "A quieter block situated on the eastern side of the society premises. It features premium 3 BHK apartments with extra spacious balconies and low noise levels.",
    amenities: ["Private Courtyard", "Yoga Deck Proximity", "CCTV Surveillance", "Dedicated Car Washing Bay"]
  }
];
