// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const API_URL = 'https://script.google.com/macros/s/AKfycbwvBinI66lL_HvT25fP8qGR7mgpLd8LFzBVvBl9vJpEWkK8jl6YgwMh2mdKMfwd53keWQ/exec';

// 1. Handle the Authentication / Reference Code Verification Step
async function handleAuth() {
    const code = document.getElementById('clientCode').value.trim();
    const btn = document.getElementById('authBtn');
    const errorMsg = document.getElementById('authError');
    
    if (!code) return;
    
    btn.innerText = "Loading...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        // Fetch API request to GAS to validate code
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Bypasses CORS pre-flight
            body: JSON.stringify({ action: 'validateRef', ref: code })
        });
        
        const data = await response.json();

        if (data.status === 'success') {
            // Smooth transition: Hide Auth view, Show Form View
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('formView').classList.remove('hidden');
            
            // Lock in the company name returned safely by the backend server
            document.getElementById('companyDisplay').innerText = `Company: ${data.data.companyName}`;
            
            // Save the ref code securely in runtime memory for final submission
            window.sessionClientRef = code; 
        } else {
            throw new Error(data.message || "Invalid reference code.");
        }
    } catch (error) {
        errorMsg.innerText = error.message || "Failed to connect to the server.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "Continue to Portal";
        btn.disabled = false;
    }
}

// 2. Handle the Complete Form Submission Step
async function submitForm() {
    const btn = document.getElementById('submitBtn');
    const reqName = document.getElementById('reqName').value.trim();
    const reqEmail = document.getElementById('reqEmail').value.trim();

    // Simple validation check before sending
    if (!reqName || !reqEmail) {
        alert("Please fill out your Name and Email address.");
        return;
    }

    btn.innerText = "Submitting Request...";
    btn.disabled = true;

    // DEFINING THE PAYLOAD VARIABLE (Fixes the "payload is not defined" error)
    const payload = {
        action: 'submitRequest',
        ref: window.sessionClientRef,
        requesterName: reqName,
        email: reqEmail,
        location: "Main Office", // Placeholder fields matching your database sheets setup
        roomName: "Conference Room A",
        category: "Hardware",
        serviceType: "Repair",
        products: [
            { brand: "Default Brand", model: "Default Model", serial: "00000" }
        ],
        fileData: null 
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Bypasses CORS pre-flight
            body: JSON.stringify(payload) // Payload is safely stringified here
        });
        
        const data = await response.json();

        if (data.status === 'success') {
            // Transition to Success Card State
            document.getElementById('formView').classList.add('hidden');
            document.getElementById('reqIdDisplay').innerText = data.data.requestId;
            document.getElementById('successView').classList.remove('hidden');
        } else {
            alert("Backend Database Error: " + data.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Submission failed to cross network lines. Please check internet connection.");
    } finally {
        btn.innerText = "Submit Request";
        btn.disabled = false;
    }
}
