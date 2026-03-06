const interceptor = (response) => {
    if (response.data && response.data.data !== undefined) {
        return response.data;
    }
    return response;
};

// Simulate axios raw response
const axiosRawResponse = {
    data: {
        data: { id: 1, status: 'rfq' },
        meta: [],
        error: null
    },
    status: 201,
    headers: {}
};

async function testMutation() {
    // This is what `apiClient.post` returns after interceptor
    const interceptedResponse = interceptor(axiosRawResponse);
    console.log("Intercepted Response:", interceptedResponse);

    // This is `response` inside useCreateShipment hook
    const response = interceptedResponse;

    // This is what the hook returns!
    const res = response.data?.data ?? response.data;
    console.log("Hook Returns (res):", res);

    // In component:
    console.log("res.id is:", res.id);
}

testMutation();
