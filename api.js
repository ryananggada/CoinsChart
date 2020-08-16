const API = 'https://min-api.cryptocompare.com';  // api_key={768caccc207013b80ae593ff2a0db6cd12e13df0f23bd9af838a8c1201a27aca}

const headers = {
    'Accept': 'applicaiton/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
};

export const get = async (uri: string): Promise<Object> => {
    const response = await fetch(`${API}/${uri}`, {
        method: 'GET',
        headers
    });
    return response.json();
};