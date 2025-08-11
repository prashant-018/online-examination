// Google OAuth Configuration
// This file contains configuration for Google OAuth integration

const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// Google OAuth endpoints
const GOOGLE_OAUTH_URLS = {
  auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

// Generate Google OAuth URL
const generateGoogleAuthURL = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${GOOGLE_OAUTH_URLS.auth}?${params.toString()}`;
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(GOOGLE_OAUTH_URLS.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Get user info from Google
const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(GOOGLE_OAUTH_URLS.userInfo, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Google user info:', error);
    throw error;
  }
};

module.exports = {
  GOOGLE_OAUTH_CONFIG,
  GOOGLE_OAUTH_URLS,
  generateGoogleAuthURL,
  exchangeCodeForToken,
  getGoogleUserInfo
}; 