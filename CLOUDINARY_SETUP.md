# Liverton Cloudinary setup

Liverton now uses Cloudinary for image and video storage. The protected `/admin/media` workspace requests a short-lived signed upload payload from the server and then uploads directly to Cloudinary. The Cloudinary API secret never reaches the browser.

## Vercel variables

Add the server-only variables below to both the storefront and Admin-Store deployments when each deployment hosts the shared backend. Homepage banner media, copy, and publication state are not Vercel variables; they are managed in Admin-Store and stored in the shared `storefront_banners` table.

| Variable | Required | Purpose |
|---|---:|---|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary product environment name |
| `CLOUDINARY_API_KEY` | Yes | Server-side Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Server-side Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Yes | Signed preset used by `/admin/media` |
The customer storefront does not need any `VITE_CLOUDINARY_*` banner variables. Media URLs and public IDs are returned by the shared backend after Admin-Store publishes content.

## Presets to create

Create the following preset in Cloudinary Console → Settings → Upload → Upload presets.

| Preset name | Signing mode | Folder | Resource types | Recommended restrictions |
|---|---|---|---|---|
| `liverton_admin_media` | **Signed** | `liverton/media` | Image, video, and raw only if needed | Limit file size, disable overwrite, use automatic format/quality delivery, and restrict allowed formats to `jpg,jpeg,png,webp,gif,mp4,webm,mov` |
| `liverton_public_media` | **Unsigned** | `liverton/public` | Image only | Optional future preset for explicitly public customer submissions; do not use it for admin catalog or campaign media |

Set `CLOUDINARY_UPLOAD_PRESET=liverton_admin_media` in Admin-Store and any shared server deployment. The current app uses the signed preset. The unsigned preset is only a future option and is not used for admin catalog or campaign media.

## Admin workflow

Open `/admin/media` in Admin-Store while signed in with a user whose Manus role is `admin`. Choose Image or Video, select a file, and upload it. Then create and publish a banner in the Admin-Store Banner Manager. The shared backend stores the media URL, poster URL, Cloudinary public ID, copy, position, and publication state. The customer storefront reads only published records and does not require a redeploy when campaign content changes.

Do not place `CLOUDINARY_API_SECRET`, Shopify Admin secrets, or any real credential in GitHub, source files, browser code, or chat. Rotate any credential that has previously been exposed before adding the replacement to Vercel.
