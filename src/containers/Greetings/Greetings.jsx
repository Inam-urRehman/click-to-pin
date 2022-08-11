import React from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { APIClient } from '../../utils/api-client';

const REDIRECT_URL = "http://localhost:3000/?code=";

function GreetingComponent() {
  const [authCode, setAuthCode] = useState();

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const url = tabs[0].url;
    const code = url.includes(REDIRECT_URL) ? url.replace(REDIRECT_URL, "") : undefined

    setAuthCode(code);
  });

  const onSave = useCallback(async () => {
    const apiClient = APIClient.getInstance();
    try {
      const authToken = await apiClient.getAuthToken(authCode)
      await chrome.storage.sync.set({ authToken });
      alert("Token saved")
    } catch (ex) {
      console.log("Something wrong in token fetching", ex)
    }
  }, [authCode])

  return (
    <div>
      {authCode && <div>
        <label>Auth Code</label>
        <input value={authCode} disabled />
        <button onClick={onSave}>Click to save</button>
      </div>}
    </div>
  );
}

export default GreetingComponent;
