# Liverton Cloudinary setup

Liverton now uses Cloudinary for image and video storage. The protected `/admin/media` workspace requests a short-lived signed upload payload from the server and then uploads directly to Cloudinary. The Cloudinary API secret never reaches the browser.

## Vercel variables

Add these variables to both Vercel Preview and Production. The `CLOUDINARY_*` values are server-only. Only the cloud name and public IDs use the `VITE_` prefix because they are delivery configuration, not secrets.

| Variable | Required | Purpose |
|---|---:|---|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary product environment name |
| `CLOUDINARY_API_KEY` | Yes | Server-side Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Server-side Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Yes | Signed preset used by `/admin/media` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes for browser delivery | Public cloud name used to construct delivery URLs |
| `VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID` | Optional | Cloudinary public ID for the home video banner |
| `VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID` | Optional | Cloudinary public ID for the home banner poster image |

Use the same cloud name for `CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_CLOUD_NAME`.

## Presets to create

Create the following preset in Cloudinary Console → Settings → Upload → Upload presets.

| Preset name | Signing mode | Folder | Resource types | Recommended restrictions |
|---|---|---|---|---|
| `liverton_admin_media` | **Signed** | `liverton/media` | Image, video, and raw only if needed | Limit file size, disable overwrite, use automatic format/quality delivery, and restrict allowed formats to `jpg,jpeg,png,webp,gif,mp4,webm,mov` |
| `liverton_public_media` | **Unsigned** | `liverton/public` | Image only | Optional future preset for explicitly public customer submissions; do not use it for admin catalog or campaign media |

Set `CLOUDINARY_UPLOAD_PRESET=liverton_admin_media` in Vercel. The current app uses the signed preset. The unsigned preset is only a future option and is not used by the storefront.

## Admin workflow

Open `/admin/media` while signed in with a user whose Manus role is `admin`. Choose Image or Video, select a file, and upload it. Cloudinary returns a secure delivery URL and public ID. For homepage banner delivery, store the returned public ID in `VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID` or `VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID`, then redeploy Vercel. This avoids pasting full media URLs into the application.

Do not place `CLOUDINARY_API_SECRET`, Shopify Admin secrets, or any real credential in GitHub, source files, browser code, or chat. Rotate any credential that has previously been exposed before adding the replacement to Vercel.
