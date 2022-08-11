import { APIClient } from "../../utils/api-client"
import "regenerator-runtime/runtime.js";

// (async function initialization() {
//   const { authToken, oAuthClientId, oAuthClientSecret, oAuthRedirectUri } = await chrome.storage.sync.get(["authToken", "oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri"]);
//   let title = ""
//   if (!oAuthClientId || !oAuthClientSecret || !oAuthRedirectUri) {
//     title = "Add credentials"
//   }
//   else if (!authToken) {
//     title = "Get token"
//   } else {
//     const apiClient = APIClient.getInstance(oAuthClientId, oAuthClientSecret, oAuthRedirectUri);
//     apiClient.setClient(apiClient.getClient().withConfiguration({
//       oAuthToken: authToken
//     }))
//     const boards = await apiClient.getBoards();
//     console.log("boards.result.items", boards.result.items)
//   }
//   chrome.contextMenus.create({
//     id: "click-to-pin",
//     title,
//     contexts: ["image"]
//   })
// })()

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


async function pinImage(imageUrl) {
  const { authToken, oAuthClientId, oAuthClientSecret, oAuthRedirectUri } = await chrome.storage.sync.get(["authToken", "oAuthClientId", "oAuthClientSecret", "oAuthRedirectUri"]);

  if (!oAuthClientId || !oAuthClientSecret || !oAuthRedirectUri) {
    const selfInfo = await chrome.management.getSelf()
    chrome.tabs.create({ url: selfInfo.optionsUrl });
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
      chrome.tabs.create({ url: apiClient.getPermissionUrl() });
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
    chrome.tabs.create({ url: apiClient.getPermissionUrl() });
  } else {
    apiClient.setClient(apiClient.getClient().withConfiguration({
      oAuthToken: authToken
    }))
    apiClient.pinImage(imageUrl, onSuccess, onFailure)
  }
}