// Replace this with your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycby476ecukEizfce1mDME-1Y8h1y0oPqWAzbesy_fB5-0QmwXXJ_cHlEBsXvdGGXHdIEgw/exec';

async function sendToBackend(payload) {
    try {
        // Enforcing text/plain avoids the CORS preflight OPTIONS request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { status: 'error', message: 'Failed to connect to the server.' };
    }
}