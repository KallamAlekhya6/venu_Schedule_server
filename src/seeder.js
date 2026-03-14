import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Tenant from './models/Tenant.js';
import Venue from './models/Venue.js';
import Room from './models/Room.js';
import Resource from './models/Resource.js';
import Booking from './models/Booking.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venu_premium');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Tenant.deleteMany();
    await Venue.deleteMany();
    await Room.deleteMany();
    await Resource.deleteMany();
    await Booking.deleteMany();

    console.log('Data cleared...');

    // Create Super Admin
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@venuescheduler.com',
      password: 'admin123',
      role: 'super_admin'
    });

    // Create Tenant Admin
    const admin = await User.create({
      name: 'John Smith',
      email: 'admin@techcorp.com',
      password: 'admin123',
      role: 'tenant_admin'
    });

    // Create Tenant
    const tenant = await Tenant.create({
      name: 'TechCorp Solutions',
      plan: 'premium',
      adminId: admin._id,
      settings: { maxVenues: 10, maxRooms: 50, maxResources: 200, allowRecurring: true, customBranding: true }
    });

    // Link admin to tenant
    admin.tenantId = tenant._id;
    await admin.save();

    // Create Staff
    await User.create({
      name: 'Mike Wilson',
      email: 'staff@techcorp.com',
      password: 'staff123',
      role: 'staff',
      tenantId: tenant._id
    });

    // Create Venues
    const venue1 = await Venue.create({
      tenantId: tenant._id,
      name: 'TechCorp HQ',
      description: 'Main headquarters building',
      location: 'Downtown Tech District',
      address: '12 Innovation Street'
    });

    // Create Rooms
    const room1 = await Room.create({
      tenantId: tenant._id,
      venueId: venue1._id,
      name: 'Conference Room A',
      capacity: 20,
      facilities: ['Projector', 'Whiteboard', 'Video Conferencing'],
      floor: '3rd Floor'
    });

    const room2 = await Room.create({
      tenantId: tenant._id,
      venueId: venue1._id,
      name: 'Board Room',
      capacity: 12,
      facilities: ['Large Screen TV', 'Premium Audio'],
      floor: '5th Floor'
    });

    // Create Resources
    await Resource.create({
      tenantId: tenant._id,
      roomId: room1._id,
      name: 'Epson Projector Pro',
      type: 'projector',
      status: 'available'
    });

    // Create some bookings
    const now = new Date();
    await Booking.create({
      tenantId: tenant._id,
      venueId: venue1._id,
      roomId: room1._id,
      userId: admin._id,
      title: 'Global Sync',
      start: new Date(now.setHours(10, 0, 0, 0)),
      end: new Date(now.setHours(11, 30, 0, 0)),
      status: 'approved'
    });

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
