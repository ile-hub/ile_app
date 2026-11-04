# Fictional demo portraits

Approved PNGs copied unchanged from `ile-api/demo/assets/portraits/` for the October 29 showcase.
These are fictional character portraits, not identity-verification evidence.

`src/lib/profilePortrait.ts` maps them only to six exact existing synthetic account IDs.
The mapping and asset requires are guarded by `__DEV__`; production builds do not use this fallback.
Valid remote HTTPS portraits take precedence. No profile records or URLs are changed.
