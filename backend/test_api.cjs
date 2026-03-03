async function runTests() {
    const API_URL = 'http://localhost:8000/api';

    async function login(email, password) {
        // dynamic import of node-fetch or native fetch should work in node 18+ natively
        // since node complains about require('node-fetch'), we'll just use the global fetch which is available in Node 18+
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const responseData = await res.json();
        return responseData.data.token;
    }

    try {
        console.log('Testing Ops Login...');
        const opsToken = await login('ops@shipnovo.com', 'password');
        console.log('Ops Token:', !!opsToken);

        console.log('Testing Customer Login...');
        const customerToken = await login('customer@example.com', 'password');
        console.log('Customer Token:', !!customerToken);

        console.log('Testing Ops GET /shipments...');
        const opsShipRes = await fetch(`${API_URL}/shipments`, {
            headers: { 'Authorization': `Bearer ${opsToken}`, 'Accept': 'application/json' }
        });
        const opsShipments = await opsShipRes.json();
        console.log('Ops could fetch shipments:', opsShipRes.ok, 'Count:', opsShipments.data?.data?.length);

        const firstShipmentId = opsShipments.data?.data?.[0]?.id;

        if (firstShipmentId) {
            console.log('Testing Customer PATCH /shipments/' + firstShipmentId + ' (should fail with 403)...');
            const custPatchRes = await fetch(`${API_URL}/shipments/${firstShipmentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${customerToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'transit' })
            });
            console.log('Customer PATCH status:', custPatchRes.status, custPatchRes.status === 403 ? '(Correct - Forbidden)' : '(Incorrect)');

            console.log('Testing Ops PATCH /shipments/' + firstShipmentId + ' (should succeed)...');
            const opsPatchRes = await fetch(`${API_URL}/shipments/${firstShipmentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${opsToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'transit' })
            });
            console.log('Ops PATCH status:', opsPatchRes.status, opsPatchRes.status === 200 ? '(Correct - OK)' : '(Incorrect)');
        } else {
            console.log("No shipments found to test update.");
        }

        console.log("Integration RBAC tests complete!");
    } catch (e) {
        console.error(e);
    }
}

runTests();
