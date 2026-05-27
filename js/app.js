const API_URL = 'https://script.google.com/macros/s/AKfycbyWouaByUpSZT9Q8nTqFXdK352uLAc6y2yGRjpxP3Nn4SALScWNVN_-SsHPBClCjuWQ0w/exec';

let productCount = 0;
const MAX_PRODUCTS = 5;

// Auto-check for ?ref= in the URL when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
        document.getElementById('clientCode').value = refParam;
        handleAuth();
    }
});

// Authenticate Client Reference
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
            addProductUI(); // Load the first empty product box
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

// Add Dynamic Product UI
function addProductUI() {
    if (productCount >= MAX_PRODUCTS) return;
    productCount++;
    
    const container = document.getElementById('productContainer');
    const html = `
        <div class="product-box" id="prodBox_${productCount}">
            <h4>Item ${productCount}</h4>
            <div class="grid-2">
                <div class="input-group">
                    <label>Brand *</label>
                    <input type="text" id="brand_${productCount}" required>
                </div>
                <div class="input-group">
                    <label>Model *</label>
                    <input type="text" id="model_${productCount}" required>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:0;">
                <label>Serial Number *</label>
                <input type="text" id="serial_${productCount}" required>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    
    if (productCount >= MAX_PRODUCTS) {
        document.getElementById('addProdBtn').classList.add('hidden');
    }
}

// Helper to convert files to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            filename: file.name,
            mimeType: file.type,
            base64: reader.result.split(',')[1] // Remove the data URI prefix
        });
        reader.onerror = error => reject(error);
    });
}

async function submitForm() {
    const btn = document.getElementById('submitBtn');
    
    // Gather General Info
    const reqName = document.getElementById('reqName').value.trim();
    const reqEmail = document.getElementById('reqEmail').value.trim();
    const reqLocation = document.getElementById('reqLocation').value.trim();
    const reqRoom = document.getElementById('reqRoom').value.trim();
    const reqCategory = document.getElementById('reqCategory').value;
    const reqServiceType = document.getElementById('reqServiceType').value;
    
    // NEW: Capture the description
    const reqDescription = document.getElementById('reqDescription').value.trim();

    // NEW: Added reqDescription to validation
    if (!reqName || !reqEmail || !reqLocation || !reqRoom || !reqCategory || !reqServiceType || !reqDescription) {
        alert("Please fill out all mandatory general fields, including the Issue Description.");
        return;
    }

    // Gather Products
    let productsArray = [];
    for (let i = 1; i <= productCount; i++) {
        const brand = document.getElementById(`brand_${i}`).value.trim();
        const model = document.getElementById(`model_${i}`).value.trim();
        const serial = document.getElementById(`serial_${i}`).value.trim();
        
        if (!brand || !model || !serial) {
            alert(`Please fill out all fields for Item ${i}`);
            return;
        }
        productsArray.push({ brand, model, serial });
    }

    btn.innerText = "Processing...";
    btn.disabled = true;

    // Process File if attached
    let fileDataObj = null;
    const fileInput = document.getElementById('reqInvoice');
    if (fileInput.files.length > 0) {
        try {
            fileDataObj = await getBase64(fileInput.files[0]);
        } catch (e) {
            alert("Error reading the file. Please try again.");
            btn.innerText = "Submit Request";
            btn.disabled = false;
            return;
        }
    }

    // NEW: Added issueDescription to the payload
    const payload = {
        action: 'submitRequest',
        ref: window.sessionClientRef,
        requesterName: reqName,
        email: reqEmail,
        location: reqLocation,
        roomName: reqRoom,
        category: reqCategory,
        serviceType: reqServiceType,
        issueDescription: reqDescription, 
        products: productsArray,
        fileData: fileDataObj
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
            alert("Database Error: " + data.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Submission failed. Please check your internet connection.");
    } finally {
        btn.innerText = "Submit Request";
        btn.disabled = false;
    }
}
