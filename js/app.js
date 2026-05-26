// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const API_URL = 'https://script.google.com/macros/s/AKfycbxvw4P-48RWN29dzKMgDicq3WJsr9Bvs8uicJzmbP6qqmkXWSlzmNrSyc0Nq3mcc3B8mQ/exec';

// 1. Handle the Authentication Step
async function handleAuth() {
    const code = document.getElementById('clientCode').value.trim();
    const btn = document.getElementById('authBtn');
    const errorMsg = document.getElementById('authError');
    
    if (!code) return;
    
    btn.innerText = "Loading...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        // Fetch API request to GAS
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // THIS IS MANDATORY
            },
            body: JSON.stringify({ action: 'validateRef', ref: code })
        });
        const data = await response.json();

        if (data.status === 'success') {
            // Hide Auth view, Show Form View
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('formView').classList.remove('hidden');
            
            // Set the company name internally
            document.getElementById('companyDisplay').innerText = data.data.companyName;
            
            // Save the ref code securely in memory for submission
            window.sessionClientRef = code; 
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        errorMsg.innerText = error.message || "Failed to connect.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "Continue to Portal";
        btn.disabled = false;
    }
}

// 2. Handle the Form Submission Step
async function submitForm() {
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Submitting...";
    btn.disabled = true;

    const payload = {
        action: 'submitRequest',
        ref: window.sessionClientRef,
        requesterName: document.getElementById('reqName').value,
        email: document.getElementById('reqEmail').value,
        // Add other form fields here (location, room, products array, etc.)
        products: [] 
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
            alert("Error: " + data.message);
        }
    } catch (error) {
        alert("Submission failed. Please try again.");
    } finally {
        btn.innerText = "Submit Request";
        btn.disabled = false;
    }
}
