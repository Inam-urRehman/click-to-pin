import React, { useCallback, useState } from 'react';
import { APIClient } from '../../utils/api-client';

const REDIRECT_URL = "https://developers.pinterest.com/?code=";

function GreetingComponent() {
  const [authCode, setAuthCode] = useState();

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const url = tabs[0].url;
    const code = url.includes(REDIRECT_URL) ? url.replace(REDIRECT_URL, "") : undefined

    setAuthCode(code);
  });

  const onSave = useCallback(async () => {
    const { oAuthClientId, oAuthClientSecret, oAuthRedirectUri } = await chrome.storage.sync.get(["oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri"]);
    const apiClient = APIClient.getInstance(oAuthClientId, oAuthClientSecret, oAuthRedirectUri);
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
      {authCode ? (
        <div>
          <label>Auth Code</label>
          <input value={authCode} disabled />
          <button onClick={onSave}>Click to save</button>
        </div>
      )
        : (
          <p>Click on any image and select click-to-pin from menu to pin your image</p>
        )}
    </div>
  );
}

export default GreetingComponent;
