const https = require('https');

async function testRPC() {
  console.log("🔍 Testing Coston2 RPC connectivity...");
  
  const data = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getCode",
    params: ["0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D", "latest"],
    id: 1
  });

  const options = {
    hostname: 'coston2-api.flare.network',
    port: 443,
    path: '/ext/C/rpc',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.result && result.result !== '0x') {
            console.log("✅ Contract found at address");
            console.log("Contract code length:", result.result.length);
          } else {
            console.log("❌ Contract not found at address");
          }
          resolve(result);
        } catch (error) {
          console.error("❌ Error parsing response:", error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error("❌ Error making request:", error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testRPC()
  .then(() => {
    console.log("\n🎉 RPC connectivity test completed!");
  })
  .catch((error) => {
    console.error("❌ Test failed:", error.message);
  });
