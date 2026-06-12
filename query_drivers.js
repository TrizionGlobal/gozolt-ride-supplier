const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3000/v1/auth/supplier/login', {
      email: 'malta_premium@example.com',
      password: 'Password123!'
    });
    
    const token = loginRes.data.accessToken;
    
    const driversRes = await axios.get('http://localhost:3000/v1/suppliers/drivers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Backend response typeof data.data:", typeof driversRes.data.data);
    console.log("Backend response isArray:", Array.isArray(driversRes.data.data));
    console.log("Backend response keys:", Object.keys(driversRes.data));
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}
test();
