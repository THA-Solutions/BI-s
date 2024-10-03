import { UrlPathToFetch } from "./urlPathToFetch.enum";

export class RequestParams {
  private currentApiUrlRoute: UrlPathToFetch;

  private actualRequest: number;

  private maximumRequest: number;

  private maximumRequestInParallel: number;

  private numberOfRequestsInProgress: number;

  constructor(
    actualRequest: number,
    maximumRequest: number,
    maximumRequestInParallel: number,
  ) {
    this.currentApiUrlRoute = 0;

    this.actualRequest = actualRequest;

    this.maximumRequest = maximumRequest;

    this.maximumRequestInParallel = maximumRequestInParallel;

    this.numberOfRequestsInProgress = 0;
  }

  changeCurrentApiUrlRoute(currentApiUrlRoute: UrlPathToFetch) {
    if (currentApiUrlRoute == 0) {
      this.currentApiUrlRoute = 1;
    } else {
      this.currentApiUrlRoute = 0;
    }
  }

  getCurrentApiUrlRoute() {
    return this.currentApiUrlRoute;
  }

  setActualRequest(actualRequest: number) {
    this.actualRequest = actualRequest;
  }

  setNumberOfRequestsInProgress(numberOfequestsInProgress: number) {
    this.numberOfRequestsInProgress = numberOfequestsInProgress;
  }

  increaseActualRequestByOne() {
    this.actualRequest = this.actualRequest + 1;
  }

  increaseNumberOfRequestsInProgresstByOne() {
    this.numberOfRequestsInProgress = this.numberOfRequestsInProgress + 1;
  }

  getActualRequest() {
    return this.actualRequest;
  }

  getMaximumRequest() {
    return this.maximumRequest;
  }

  getMaximumRequestInParallel() {
    return this.maximumRequestInParallel;
  }

  getNumberOfRequestsInProgress() {
    return this.numberOfRequestsInProgress;
  }

  checkIfNumberOfRequestsInProgressIsLowerThanMaximumRequestInParallel() {
    if (
      this.getNumberOfRequestsInProgress() < this.getMaximumRequestInParallel()
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIfNumberOfActualRequestIsLowerThatMaximumRequest() {
    if (this.getActualRequest() < this.getMaximumRequest()) {
      return true;
    } else {
      return false;
    }
  }
}
