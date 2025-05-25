// JavaScript code for the TID operation webpage

// TID OAuth 2.0 / OIDC Integration
const TID_CLIENT_ID = 'cd29109c-ee79-4c6c-9e2c-06b796093610'; // TODO: Replace with your actual TID Client ID
const TID_REDIRECT_URI = 'http://127.0.0.1:53773/'; // TODO: Replace with your actual redirect URI
const TID_CALLBACK_URI = 'http://127.0.0.1:53773/index.html'; // New callback page
const TID_AUTH_URL = 'https://stage.id.trimblecloud.com/oauth/authorize';
const TID_TOKEN_URL = 'https://stage.id.trimblecloud.com/oauth2/token';
const TID_SCOPE = 'openid+Spectrum-Assistant';

function getAuthUrl() {
    // Manually build the query string to avoid encoding + and redirect_uri
    const url = `${TID_AUTH_URL}?scope=openid+Spectrum-Assistant&response_type=code&redirect_uri=https://tidwebstoragewebapp.z19.web.core.windows.net&client_id=${TID_CLIENT_ID}`;
    console.log('Auth URL:', url); 
    //alert('Auth URL: ' + url); // Show the value in an alert box

    // Parse params from the URL and display in tid-user-info div
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    const userInfoDiv = document.getElementById('tid-user-info');
    // if (userInfoDiv) {
    //     userInfoDiv.style.display = 'block';
    //     userInfoDiv.innerHTML = '<b>Auth URL Params:</b><br>' +
    //         Object.entries(params).map(([k, v]) => `${k}: ${v}`).join('<br>');
    // }
    return url;
}

function parseQueryString() {
    const params = {};
    window.location.search.replace(/\??([^=&]+)=([^&]*)/g, function(_, k, v) {
        params[k] = decodeURIComponent(v);
    });
    return params;
}

async function exchangeCodeForToken(code) {
    // This should be done on a backend server for security in production!
    // For demo purposes only (CORS may block this request)
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: TID_REDIRECT_URI,
        client_id: TID_CLIENT_ID
        // client_secret: 'YOUR_CLIENT_SECRET' // Not safe in frontend!
    });
    const response = await fetch(TID_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('tid-input');
    const resultField = document.getElementById('tid-result');
    const submitButton = document.getElementById('tid-submit');
    const loginBtn = document.getElementById('tid-login-btn');
    const userInfoDiv = document.getElementById('tid-user-info');

    submitButton.addEventListener('click', () => {
        const tidValue = inputField.value;
        if (tidValue) {
            // Call performTIDOperation with the value from tid-input
            performTIDOperation(tidValue);
        } else {
            resultField.textContent = 'Please enter a value.';
        }
    });

    let lastAccessToken = null; // Store the last access token

    // Update performTIDOperation to fetch user info after token
    function performTIDOperation(code) {
        const url = 'https://stage.id.trimblecloud.com/oauth/token';
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: 'cd29109c-ee79-4c6c-9e2c-06b796093610',
            client_secret: 'ec8dc155938648e3aaedd0eabe765a05',
            redirect_uri: 'https://tidwebstoragewebapp.z19.web.core.windows.net'
        });
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                lastAccessToken = data.access_token;
                // Fetch user info immediately after getting token
                fetch('https://stage.id.trimblecloud.com/oauth/userinfo', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + lastAccessToken
                    }
                })
                .then(response => response.json())
                .then(userData => {
                    if (resultField) {
                        // Professional, modern card UI for user info (show only a few key fields)
                        let card = `<div style=\"max-width:400px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:sans-serif;\">`;
                        card += `<h2 style='margin-top:0;color:#2d6cdf;font-size:1.3em;'>User Profile</h2>`;
                        if (userData.name) card += `<div style='margin-bottom:10px;'><b>Name:</b> <span style='color:#333;'>${userData.name}</span></div>`;
                        if (userData.email) card += `<div style='margin-bottom:10px;'><b>Email:</b> <span style='color:#333;'>${userData.email}</span></div>`;
                        if (userData.sub) card += `<div style='margin-bottom:10px;'><b>User ID:</b> <span style='color:#333;'>${userData.sub}</span></div>`;
                        if (userData.given_name) card += `<div style='margin-bottom:10px;'><b>Given Name:</b> <span style='color:#333;'>${userData.given_name}</span></div>`;
                        if (userData.family_name) card += `<div style='margin-bottom:10px;'><b>Family Name:</b> <span style='color:#333;'>${userData.family_name}</span></div>`;
                        card += `<div style='margin-top:18px;font-size:0.9em;color:#888;'>Some fields may be hidden for privacy.</div>`;
                        card += `</div>`;
                        resultField.innerHTML = card;
                    }
                })
                .catch(error => {
                    if (resultField) {
                        resultField.textContent = 'User Info API Error: ' + error;
                    }
                });
            } else {
                // If no access token, show token response as table
                if (resultField) {
                    if (typeof data === 'object' && data !== null) {
                        let table = '<table border="1" style="border-collapse:collapse;max-width:100%">';
                        table += '<tr><th>Key</th><th>Value</th></tr>';
                        Object.entries(data).forEach(([key, value]) => {
                            table += `<tr><td>${key}</td><td style="word-break:break-all;">${typeof value === 'object' ? JSON.stringify(value) : value}</td></tr>`;
                        });
                        table += '</table>';
                        resultField.innerHTML = table;
                    } else {
                        resultField.textContent = JSON.stringify(data);
                    }
                }
            }
        })
        .catch(error => {
            if (resultField) {
                resultField.textContent = 'API Error: ' + error;
            }
        });
    }

    // Show user info if available from sessionStorage
    const tidUser = sessionStorage.getItem('tid_user');
    if (tidUser && userInfoDiv) {
        const user = JSON.parse(tidUser);
        userInfoDiv.style.display = 'block';
        userInfoDiv.innerHTML = `<b>Signed in as:</b> ${user.email || user.name}`;
    }

    // Check for 'code' param in URL and set it in tid-input textbox
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        if (inputField) {
            inputField.value = code;
        }
    }

    // Remove OAuth callback handling from index page, as it will now be handled in callback.html

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            window.location.href = getAuthUrl();
        });
    }
});