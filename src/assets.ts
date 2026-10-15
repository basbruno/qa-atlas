/** Resolve public files under the same base as the deployed application. */
export const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
