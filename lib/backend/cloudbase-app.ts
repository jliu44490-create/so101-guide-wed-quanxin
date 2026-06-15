/**
 * Lazily-initialised, shared CloudBase app instance for the CN region.
 *
 * Both the auth adapter (cloudbase-backend) and the community adapter
 * (cloudbase-community) use this single instance so they share one SDK session.
 * The SDK is pulled in via a dynamic import so it only ships in the CN bundle.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const ENV = process.env.NEXT_PUBLIC_CLOUDBASE_ENV
const REGION = process.env.NEXT_PUBLIC_CLOUDBASE_REGION
const ACCESS_KEY = process.env.NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY

export const cloudbaseConfigured = Boolean(ENV && ACCESS_KEY)

let appPromise: Promise<any> | null = null

export async function getCloudbaseApp(): Promise<any> {
  if (!appPromise) {
    appPromise = import('@cloudbase/js-sdk').then((mod) => {
      const cloudbase = (mod as any).default ?? mod
      const app = cloudbase.init({ env: ENV, region: REGION, accessKey: ACCESS_KEY })
      // Set up auth with local persistence once, so the session survives reloads
      // and is shared by both auth and community calls.
      app.auth({ persistence: 'local' })
      return app
    })
  }
  return appPromise
}
