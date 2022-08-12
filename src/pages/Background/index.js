import { APIClient } from "../../utils/api-client"
import { getCodeUrl } from "../../utils"
import "regenerator-runtime/runtime.js";

chrome.contextMenus.create({
  id: "click-to-pin",
  title: "click-to-pin",
  contexts: ["image"]
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { srcUrl, menuItemId } = info;

  if (menuItemId === "click-to-pin") {
    pinImage(srcUrl)
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { oAuthRedirectUri } = await chrome.storage.sync.get(["oAuthRedirectUri"]);
  const codeUrl = getCodeUrl(oAuthRedirectUri);

  if (tab.url.includes(codeUrl) && changeInfo.status === "complete") {
    const { oAuthClientId, oAuthClientSecret, oAuthRedirectUri } = await chrome.storage.sync.get(["oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri"]);
    const apiClient = APIClient.getInstance(oAuthClientId, oAuthClientSecret, oAuthRedirectUri);
    const authCode = tab.url.replace(codeUrl, "");
    try {
      const authToken = await apiClient.getAuthToken(authCode)
      await chrome.storage.sync.set({ authToken });
      chrome.tabs.remove(tabId)
    } catch (ex) {
      console.log("Something wrong in token fetching", ex)
    }
  }
})

async function pinImage(imageUrl) {
  const { authToken, oAuthClientId, oAuthClientSecret, oAuthRedirectUri, boardId } = await chrome.storage.sync.get(["authToken", "oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri", "boardId"]);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!oAuthClientId || !oAuthClientSecret || !oAuthRedirectUri) {
    const selfInfo = await chrome.management.getSelf();
    chrome.windows.create(
      {
        tabId: tab.id,
        focused: true,
        width: 700,
        height: 700,
        type: "popup",
        url: selfInfo.optionsUrl,
      }
    );
    return;
  }

  const apiClient = APIClient.getInstance(oAuthClientId, oAuthClientSecret, oAuthRedirectUri);
  const onSuccess = () => {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: './icon-34.png',
      title: `Success`,
      message: "Image pinned",
      priority: 1
    })
  };

  const onFailure = ex => {
    if (ex?.message?.includes("OAuth token is expired")) {
      chrome.windows.create(
        {
          tabId: tab.id,
          focused: true,
          width: 700,
          height: 700,
          type: "popup",
          url: apiClient.getPermissionUrl(),
        }
      );
      // chrome.tabs.create({ url: apiClient.getPermissionUrl() });
    }
    chrome.notifications.create({
      type: 'basic',
      iconUrl: './icon-34.png',
      title: `Failure`,
      message: "Something went wrong: " + ex,
      priority: 1,
    })
  }

  if (!authToken) {
    chrome.windows.create(
      {
        tabId: tab.id,
        focused: true,
        width: 700,
        height: 700,
        type: "popup",
        url: apiClient.getPermissionUrl(),
      }
    );
    // chrome.tabs.create({ url: apiClient.getPermissionUrl() });
  } else {
    apiClient.setClient(apiClient.getClient().withConfiguration({
      oAuthToken: authToken
    }))
    apiClient.pinImage(imageUrl, boardId, onSuccess, onFailure)
  }
}