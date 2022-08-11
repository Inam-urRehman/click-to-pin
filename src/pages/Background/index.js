import { APIClient } from "../../utils/api-client"
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


async function pinImage(imageUrl) {
  const { authToken } = await chrome.storage.sync.get(["authToken"]);
  const apiClient = APIClient.getInstance();

  const onSuccess = () => {
    console.log("Image pinned")
  };

  const onFailure = ex => {
    if (ex?.message?.includes("OAuth token is expired")) {
      chrome.tabs.create({ url: apiClient.getPermissionUrl() });
    }
    console.log("Something went wrong: " + ex)
  }

  console.log("authToken", authToken)
  if (!authToken) {
    chrome.tabs.create({ url: apiClient.getPermissionUrl() });
  } else {
    apiClient.setClient(apiClient.getClient().withConfiguration({
      oAuthToken: authToken
    }))
    apiClient.pinImage(imageUrl, onSuccess, onFailure)
  }
}