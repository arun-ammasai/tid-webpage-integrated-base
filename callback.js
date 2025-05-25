// Handles the OAuth callback for TID

const TID_CLIENT_ID = 'cd29109c-ee79-4c6c-9e2c-06b796093610';
const TID_CALLBACK_URI = 'http://127.0.0.1:53773/callback.html';
const TID_TOKEN_URL = 'https://identity.trimble.com/oauth2/token';

function parseQueryString() {
    const params = {};
    window.location.search.replace(/\??([^=&]+)=([^&]*)/g, function(_, k, v) {
        params[k] = decodeURIComponent(v);
    });
    return params;
}

async function exchangeCodeForToken(code) {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: TID_CALLBACK_URI,
        client_id: TID_CLIENT_ID
    });
    const response = await fetch(TID_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    return response.json();
}

window.addEventListener('DOMContentLoaded', async () => {
    const params = parseQueryString();
    const infoDiv = document.getElementById('callback-info');
    // After successful authentication, redirect to index.html with user info in sessionStorage
    if (params.code) {
        infoDiv.innerHTML = 'Exchanging code for token...';
        try {
            const tokenData = await exchangeCodeForToken(params.code);
            if (tokenData.id_token) {
                const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
                // Store user info in sessionStorage
                sessionStorage.setItem('tid_user', JSON.stringify(payload));
                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                infoDiv.textContent = 'Failed to sign in.';
            }
        } catch {
            infoDiv.textContent = 'Failed to sign in.';
        }
    } else {
        infoDiv.textContent = 'No code found in callback.';
    }
});
