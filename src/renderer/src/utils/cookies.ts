// src/utils/cookies.ts
export function deleteCookie(name: string, opts: { path?: string; domain?: string } = {}) {
  const parts = [
    `${encodeURIComponent(name)}=`,
    'Max-Age=0',
    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
    `path=${opts.path ?? '/'}`,
    opts.domain ? `domain=${opts.domain}` : undefined
  ].filter(Boolean)

  // Attempt to delete (works only if cookie is NOT HttpOnly)
  document.cookie = parts.join('; ')
}

/**
 * Try common paths/domains so you don’t need to know the exact one.
 * No harm if some attempts are redundant.
 */
export function deleteCookieEverywhere(
  name: string,
  paths: string[] = ['/', '/api'],
  domains: (string | undefined)[] = [undefined, window.location.hostname]
) {
  for (const p of paths) {
    for (const d of domains) {
      deleteCookie(name, { path: p, domain: d })
    }
  }
}
