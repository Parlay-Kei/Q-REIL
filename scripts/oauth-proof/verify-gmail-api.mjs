#!/usr/bin/env node
/**
 * Verify Gmail API calls succeed using stored refresh token.
 * Tests: refresh token exchange, Gmail API call, user info.
 */

import { getOAuth2ClientFromTokensFile } from '../../connectors/gmail/lib/oauth.js';
import { google } from 'googleapis';

async function verifyGmailAPI() {
  try {
    console.log('1. Creating OAuth2 client from tokens file...');
    const oauth2 = getOAuth2ClientFromTokensFile();
    
    console.log('2. Refreshing access token...');
    const accessToken = await oauth2.getAccessToken();
    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }
    console.log('   ✅ Access token obtained');
    
    console.log('3. Testing Gmail API call...');
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    const res = await gmail.users.messages.list({ 
      userId: 'me', 
      maxResults: 1 
    });
    
    console.log('   ✅ Gmail API call succeeded');
    console.log('   Message count:', res.data.messages?.length || 0);
    console.log('   Result size estimate:', res.data.resultSizeEstimate || 0);
    
    console.log('4. Testing user info...');
    const userinfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken.token}` }
    });
    const userData = await userinfo.json();
    console.log('   ✅ User info retrieved');
    console.log('   Email:', userData.email);
    
    console.log('\n✅ All verification checks passed!');
    console.log(JSON.stringify({
      receipt: 'gmail_api_verify_success',
      access_token_obtained: true,
      gmail_api_success: true,
      message_count: res.data.messages?.length || 0,
      user_email: userData.email,
      errors: []
    }));
    
    return true;
  } catch (error) {
    const errorCode = error.code || error.message;
    const errorDesc = error.message;
    
    console.error('\n❌ Verification failed!');
    console.error('Error:', errorCode);
    console.error('Description:', errorDesc);
    
    // Check for specific error types
    const isDeletedClient = errorDesc?.includes('deleted_client') || errorCode === 'deleted_client';
    const isUnauthorizedClient = errorDesc?.includes('unauthorized_client') || errorCode === 'unauthorized_client';
    const isInvalidGrant = errorDesc?.includes('invalid_grant') || errorCode === 'invalid_grant';
    const isSigninRejected = errorDesc?.includes('signin/rejected') || errorDesc?.includes('signin_rejected');
    
    console.error(JSON.stringify({
      receipt: 'gmail_api_verify_failure',
      error: errorCode,
      error_description: errorDesc,
      deleted_client: isDeletedClient,
      unauthorized_client: isUnauthorizedClient,
      invalid_grant: isInvalidGrant,
      signin_rejected: isSigninRejected
    }));
    
    if (isDeletedClient || isUnauthorizedClient || isInvalidGrant || isSigninRejected) {
      console.error('\n❌ QAG FAIL: Critical error detected');
      process.exit(1);
    }
    
    return false;
  }
}

verifyGmailAPI().then(success => {
  process.exit(success ? 0 : 1);
});
