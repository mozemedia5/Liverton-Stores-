import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, CloudUpload, Copy, Image, Loader2, ShieldCheck, Video } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const cloudinaryUploadUrl = (cloudName: string, resourceType: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

export default function CloudinaryMediaAdmin() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/admin/media" });
  const signUpload = trpc.cloudinary.signUpload.useMutation();
  const [resourceType, setResourceType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [assetUrl, setAssetUrl] = useState("");
  const [assetId, setAssetId] = useState("");
  const [message, setMessage] = useState("");

  if (loading) {
    return <main className="admin-media-page"><div className="admin-media-card"><Loader2 className="spin" /> Loading admin access…</div></main>;
  }

  if (!user || user.role !== "admin") {
    return <main className="admin-media-page"><div className="admin-media-card"><ShieldCheck size={28} /><h1>Admin access required</h1><p>This media workspace is restricted to Liverton administrators.</p><Link href="/" className="cta-button">Return to storefront <ArrowLeft size={15} /></Link></div></main>;
  }

  const upload = async (file: File) => {
    setUploading(true);
    setMessage("");
    setAssetUrl("");
    setAssetId("");
    try {
      const signed = await signUpload.mutateAsync({ folder: "liverton/media", resourceType });
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("signature", signed.signature);
      form.append("folder", signed.folder);
      form.append("resource_type", signed.resourceType);
      if (signed.uploadPreset) form.append("upload_preset", signed.uploadPreset);
      const response = await fetch(cloudinaryUploadUrl(signed.cloudName, signed.resourceType), { method: "POST", body: form });
      const result = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
      if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Cloudinary upload failed");
      setAssetUrl(result.secure_url);
      setAssetId(result.public_id || "");
      setMessage("Upload complete. This asset is now available in Cloudinary.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Check the Cloudinary variables and preset.");
    } finally {
      setUploading(false);
    }
  };

  return <main className="admin-media-page"><div className="admin-media-shell"><div className="admin-media-heading"><div><span className="eyebrow"><CloudUpload size={14} /> Liverton media control</span><h1>Upload once.<br /><span>Use everywhere.</span></h1><p>Signed uploads keep Cloudinary secrets on the server while the admin workspace sends approved images and video directly to your media library.</p></div><Link href="/" className="quiet-link"><ArrowLeft size={15} /> Storefront</Link></div><section className="admin-media-card"><div className="admin-media-card-top"><div><span className="eyebrow">Cloudinary workspace</span><h2>Publish media for banners and catalog content.</h2></div><span className="admin-badge"><ShieldCheck size={14} /> Admin only</span></div><div className="admin-media-type"><button className={resourceType === "image" ? "active" : ""} onClick={() => setResourceType("image")}><Image size={18} /> Image</button><button className={resourceType === "video" ? "active" : ""} onClick={() => setResourceType("video")}><Video size={18} /> Video</button></div><label className="admin-upload-drop"><input type="file" accept={resourceType === "image" ? "image/*" : "video/*"} disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><CloudUpload size={28} /><strong>{uploading ? "Uploading to Cloudinary…" : `Choose ${resourceType} media`}</strong><span>Stored under <code>liverton/media</code> with the signed admin upload flow.</span></label>{uploading && <div className="admin-progress"><Loader2 className="spin" size={16} /> Uploading securely…</div>}{message && <div className={`admin-result ${assetUrl ? "success" : "error"}`}><CheckCircle2 size={18} /><span>{message}</span></div>}{assetUrl && <div className="admin-asset-result"><div className="admin-asset-preview">{resourceType === "video" ? <video controls src={assetUrl} /> : <img src={assetUrl} alt="Uploaded Liverton media" />}</div><div className="admin-asset-meta"><strong>Cloudinary asset ready</strong><span>{assetId}</span><button onClick={() => void navigator.clipboard?.writeText(assetUrl)}><Copy size={14} /> Copy delivery URL</button></div></div>}</section></div></main>;
}
