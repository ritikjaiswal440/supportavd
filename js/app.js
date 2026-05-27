// Automatically check URL for the ?ref= parameter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');

    if (refParam) {
        // Auto-fill the hidden input and immediately trigger authentication
        document.getElementById('clientCode').value = refParam;
        handleAuth();
    }
});

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const API_URL = 'https://script.google.com/macros/s/AKfycbwvBinI66lL_HvT25fP8qGR7mgpLd8LFzBVvBl9vJpEWkK8jl6YgwMh2mdKMfwd53keWQ/exec';

async function handleAuth() {
    const code = document.getElementById('clientCode').value.trim();
    const btn = document.getElementById('authBtn');
    const errorMsg = document.getElementById('authError');
    
    if (!code) {
        errorMsg.innerText = "Please enter a reference code.";
        errorMsg.classList.remove('hidden');
        return;
    }
    
    btn.innerText = "Loading...";
    btn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'validateRef', ref: code })
        });
        
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('formView').classList.remove('hidden');
            document.getElementById('companyDisplay').innerText = `Company: ${data.data.companyName}`;
            window.sessionClientRef = code; 
        } else {
            throw new Error(data.message || "Invalid reference code.");
        }
    } catch (error) {
        errorMsg.innerText = error.message || "Network error. Please try again.";
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerText = "Continue to Portal";
        btn.disabled = false;
    }
}

async function submitForm() {
    const btn = document.getElementById('submitBtn');
    const reqName = document.getElementById('reqName').value.trim();
    const reqEmail = document.getElementById('reqEmail').value.trim();
    const reqLocation = document.getElementById('reqLocation').value.trim();
    const reqRoom = document.getElementById('reqRoom').value.trim();

    if (!reqName || !reqEmail || !reqLocation || !reqRoom) {
        alert("Please fill out all mandatory fields.");
        return;
    }

    btn.innerText = "Submitting Request...";
    btn.disabled = true;

    const payload = {
        action: 'submitRequest',
        ref: window.sessionClientRef,
        requesterName: reqName,
        email: reqEmail,
        location: reqLocation,
        roomName: reqRoom,
        category: "Hardware",      // Static for this example, you can add dropdowns later
        serviceType: "General",    // Static for this example, you can add dropdowns later
        products: [],
        fileData: null 
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload) 
        });
        
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('formView').classList.add('hidden');
            document.getElementById('reqIdDisplay').innerText = data.data.requestId;
            document.getElementById('successView').classList.remove('hidden');
        } else {
            alert("Backend Database Error: " + data.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Submission failed. Please check your internet connection.");
    } finally {
        btn.innerText = "Submit Request";
        btn.disabled = false;
    }
}
