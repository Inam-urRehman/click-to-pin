import { OAuthScopeEnum, Client, PinsController, MediaSourceFile, NewPinRequest, ApiError, BoardsController } from "pinterest-apilib";
// Custom adapter for axios
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

export class APIClient {
  static instance?: APIClient;

  client: Client;

  static getInstance(oAuthClientId = '1479682', oAuthClientSecret = '135695e829a511b80a3f5fff2dabeb51d85a1fc5', oAuthRedirectUri = 'https://developers.pinterest.com/') {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient(oAuthClientId, oAuthClientSecret, oAuthRedirectUri)
    }

    return APIClient.instance;
  }

  private constructor(oAuthClientId: string, oAuthClientSecret: string, oAuthRedirectUri: string) {
    this.client = new Client({
      timeout: 230000,
      oAuthClientId,
      oAuthClientSecret,
      oAuthRedirectUri,
      oAuthScopes: [
        OAuthScopeEnum.BoardReadAccess,
        OAuthScopeEnum.BoardsWriteAccess,
        OAuthScopeEnum.PinsReadAccess,
        OAuthScopeEnum.PinsWriteAccess
      ],
      unstable_httpClientOptions: {
        adapter: fetchAdapter
      }
    })
  }

  setClient(client: Client) {
    this.client = client
  }

  getClient() {
    return this.client;
  }

  getPermissionUrl() {
    return this.client.authorizationCodeAuthManager.buildAuthorizationUrl('');
  }

  getAuthToken(authCode: string) {
    return this.client.authorizationCodeAuthManager.fetchToken(authCode)
  }

  async pinImage(imageUrl: string, boardId: string, onSuccess?: VoidFunction, onFailure?: (ex: any) => void) {
    const pinsController = new PinsController(this.client);
    const bodyMediaSource: MediaSourceFile = {
      sourceType: 'image_url',
      url: imageUrl,
    };

    const body: NewPinRequest = {
      boardId,
      mediaSource: bodyMediaSource,
    };

    try {
      const { result } = await pinsController.createPin(body);
      if (result) {
        onSuccess?.();
      }
    } catch (error) {
      onFailure?.(error);
      if (error instanceof ApiError) {
        console.log(error.result);
      }
    }
  }

  async getBoards() {
    const boardsController = new BoardsController(this.client);
    return boardsController.getAllBoards()
  }

}