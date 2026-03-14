const BASE_URL = 'http://localhost:5000/api';
let token = '';
let tenantId = '';
let venueId = '';
let roomId = '';
let bookingId = '';

const testAPI = async () => {
  try {
    console.log('--- Starting Comprehensive API Testing ---');

    const post = async (url, body, auth = false) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };
        if (auth) options.headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${BASE_URL}${url}`, options);
        const data = await res.json();
        if (!res.ok) throw { response: { status: res.status, data: data } };
        return data;
    };

    const get = async (url, auth = true) => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        if (auth) options.headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${BASE_URL}${url}`, options);
        const data = await res.json();
        if (!res.ok) throw { response: { status: res.status, data: data } };
        return data;
    };

    const put = async (url, body, auth = true) => {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };
        if (auth) options.headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${BASE_URL}${url}`, options);
        const data = await res.json();
        if (!res.ok) throw { response: { status: res.status, data: data } };
        return data;
    };

    // 1. Register a NEW tenant
    console.log('\n1. Testing Register...');
    const regEmail = `test_${Date.now()}@example.com`;
    const regRes = await post('/auth/register', {
      organizationName: 'Testing Org ' + Date.now(),
      adminName: 'Test Admin',
      email: regEmail,
      password: 'password123',
      plan: 'premium'
    });
    console.log('✅ Register Successful');
    token = regRes.token;

    // 2. Login (as the new user)
    console.log('\n2. Testing Login...');
    const loginRes = await post('/auth/login', {
      email: regEmail,
      password: 'password123'
    });
    token = loginRes.token;
    console.log('✅ Login Successful');

    // 3. Create Venue
    console.log('\n3. Testing Create Venue...');
    const newVenueRes = await post('/venues', {
      name: 'Test Venue',
      description: 'Test description',
      location: 'Test Location',
      address: 'Test Address'
    }, true);
    venueId = newVenueRes.data._id;
    console.log('✅ Create Venue Successful');

    // 4. Create Room
    console.log('\n4. Testing Create Room...');
    const newRoomRes = await post('/rooms', {
      venueId: venueId,
      name: 'Main Hall',
      capacity: 50,
      facilities: ['AC', 'WiFi'],
      floor: 'Ground'
    }, true);
    roomId = newRoomRes.data._id;
    console.log('✅ Create Room Successful');

    // 5. Create Booking
    console.log('\n5. Testing Create Booking (Self)...');
    const start = new Date();
    start.setHours(start.getHours() + 2);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const newBookingRes = await post('/bookings', {
      venueId,
      roomId,
      title: 'Workshop',
      start: start.toISOString(),
      end: end.toISOString(),
      attendees: 10
    }, true);
    bookingId = newBookingRes.data._id;
    console.log('✅ Create Booking Successful');

    // 6. Update Booking Status (as Admin)
    console.log('\n6. Testing Update Booking Status...');
    const updateRes = await put(`/bookings/${bookingId}/status`, {
      status: 'approved'
    });
    console.log(`✅ Update Status Successful: New status is ${updateRes.data.status}`);

    // 7. Create Resource
    console.log('\n7. Testing Create Resource...');
    const newResourceRes = await post('/resources', {
      roomId: roomId,
      name: 'Projector K-1',
      type: 'projector',
      status: 'available',
      quantity: 1
    }, true);
    console.log('✅ Create Resource Successful');

    // 8. Get Everything
    console.log('\n8. Final Verification...');
    const v = await get('/venues');
    const r = await get(`/rooms/${venueId}`);
    const b = await get('/bookings');
    const res = await get('/resources');
    const s = await get('/dashboard/stats');

    console.log(`Summary: ${v.count} venues, ${r.count} rooms, ${b.count} bookings, ${res.count} resources.`);
    console.log('Dashboard stats trend length:', s.data.monthlyTrend.length);

    console.log('\n--- Comprehensive API Testing Completed Successfully ---');
  } catch (error) {
    console.error('\n❌ Comprehensive API Testing Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
};

testAPI();
