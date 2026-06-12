const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/proxy/suppliers/drivers', {
      headers: {
        'Cookie': 'gozolt-supplier-dev-authenticated=true'
      }
    });
    console.log("proxy res.data keys:", Object.keys(res.data));
  } catch (err) {
    console.log(err.message);
  }
}
test();
