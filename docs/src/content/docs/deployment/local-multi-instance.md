---
title: "Running Several Local Umbraco Sites at Once"
description: "Give each local Umbraco instance its own backoffice cookie names so logging into one does not log you out of another."
---

If you run the UpDoc test site alongside another local Umbraco instance, logging into one logs you out of the other.

This is not a bug in UpDoc, and not a bug in Umbraco. It is a browser cookie rule, and it needs a small amount of configuration to work around.

## Why it happens

Umbraco 17 authenticates the backoffice with cookies.

Cookies are scoped to a **domain**, not to a **port**. The browser treats `localhost:44301` and `localhost:44350` as the same place. Two Umbraco sites running on different ports on `localhost` therefore share one cookie scope.

Both sites write a cookie with the same name. The second login overwrites the first. You are silently signed out of the site you were already using.

## The fix

Give each site its own cookie names.

Two settings are needed. Setting only one of them still leaves a collision, because Umbraco 17 uses two separate cookie mechanisms for backoffice login.

| Setting | Renames |
|---------|---------|
| `AuthCookieName` | `UMB_UCONTEXT` |
| `BackOfficeTokenCookie:SiteName` | `__Host-umbAccessToken`, `__Host-umbRefreshToken`, `umbPkceCode` |

Add both under `Umbraco:CMS` in the site's `appsettings.Development.json`:

```json
{
  "Umbraco": {
    "CMS": {
      "Security": {
        "AuthCookieName": "UMB_UCONTEXT_UPDOC",
        "BackOfficeTokenCookie": {
          "SiteName": "-updoc"
        }
      }
    }
  }
}
```

Restart the site. You will need to log in again, because the cookie your browser is holding is now under a name the site no longer reads. That is expected, and it means the change has taken effect.

## The leading hyphen is deliberate

`SiteName` is appended to the cookie name **verbatim**. No separator is added for you.

- `"-updoc"` gives `__Host-umbAccessToken-updoc`
- `"updoc"` gives `__Host-umbAccessTokenupdoc`

Both work. The first is far easier to read when you are looking through browser dev tools.

## Every site needs its own values

This is the part that is easy to get wrong.

The values must be **unique per site**. Copying the same pair into two sites recreates the exact problem you are trying to solve, because both sites are once again writing identically named cookies.

| Site | `AuthCookieName` | `SiteName` |
|------|------------------|------------|
| UpDoc test site | `UMB_UCONTEXT_UPDOC` | `-updoc` |
| Your other site | `UMB_UCONTEXT_MYSITE` | `-mysite` |

A site left unconfigured keeps the default cookie names. That is fine on its own. It only becomes a problem when a second unconfigured site appears, and then those two collide with each other.

## Version requirement

`BackOfficeTokenCookie:SiteName` shipped in **Umbraco 17.3.0**.

On earlier versions the setting does not exist and is silently ignored. Adding it does nothing. Check the Umbraco version in your `.csproj` before assuming the configuration has taken effect.

`AuthCookieName` has been available since Umbraco 13.

## Development only

Put this in `appsettings.Development.json`, not `appsettings.json`.

It solves a problem that only exists when several sites share `localhost`. Real environments have distinct hostnames, so the collision does not arise, and there is no reason to ship custom cookie names to production.

## A note on Umbraco 19

Umbraco is planning to drop token-based backoffice login and return to the `UMB_UCONTEXT` cookie in version 19.

When that lands, the `BackOfficeTokenCookie:SiteName` half becomes redundant. It will not break anything, it will simply stop doing anything, and you can delete it. `AuthCookieName` continues to work.

`BackOfficeTokenCookieSettings` is already marked obsolete in the Umbraco source, so treat this section of your configuration as temporary.

## Reference

- [Umbraco Security Settings documentation](https://docs.umbraco.com/umbraco-cms/develop-with-umbraco/configuration/securitysettings#site-name)
- [umbraco/Umbraco-CMS#23476](https://github.com/umbraco/Umbraco-CMS/issues/23476), where this was raised and closed as configuration rather than a bug
- [umbraco/Umbraco-CMS#22057](https://github.com/umbraco/Umbraco-CMS/pull/22057), the pull request that added the `SiteName` setting
