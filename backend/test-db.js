const { Client } = require('pg');
const connectionString = 'postgresql://postgres:NPgWYsFMbqHTeTdikHNNeqRiuCHqkTBQ@interchange.proxy.rlwy.net:16769/railway';

async function testConnection() {
    const client = new Client({ connectionString });
    try {
        console.log('Attempting to connect to database...');
        await client.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error details:', err.message);
        console.error('\nPossible causes:');
        console.error('1. Railway project is inactive or "Project Paused".');
        console.error('2. Railway database is still spinning up.');
        console.error('3. Local network restrictions (firewall/VPN).');
        console.error('4. Database credentials have changed.');
    } finally {
        await client.end();
    }
}

testConnection();
