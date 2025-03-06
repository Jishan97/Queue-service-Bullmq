const axios = require('axios');

async function simulateUsers() {
    const promises = [];
    for (let i = 0; i < 100; i++) {
        promises.push(axios.get('http://localhost:4000/queue'));
    }
    try {
        await Promise.all(promises);
        console.log('Simulated 500 concurrent requests to /queue.');
    } catch (error) {
        console.error('Error during simulation:', error);
    }
}

simulateUsers();
