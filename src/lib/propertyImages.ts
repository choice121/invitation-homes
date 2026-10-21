export function buildImageKitUrl(imageUrl: string, endpoint?: string, sourceOrigin = 'https://images.invitationhomes.com'): string {
  const imageKitEndpoint = endpoint?.trim().replace(/\/+$/, '');
  if (!imageKitEndpoint) return imageUrl;

  try {
    const sourceUrl = new URL(imageUrl);
    if (sourceUrl.origin !== sourceOrigin.replace(/\/+$/, '')) return imageUrl;
    return `${imageKitEndpoint}/tr:w-1200,q-auto,f-auto${sourceUrl.pathname}${sourceUrl.search}`;
  } catch {
    return imageUrl;
  }
}

export function getImageDeliveryUrl(imageUrl: string): string {
  const endpoint = import.meta.env?.VITE_IMAGEKIT_URL_ENDPOINT;
  const sourceOrigin = import.meta.env?.VITE_IMAGEKIT_SOURCE_ORIGIN || undefined;
  return buildImageKitUrl(imageUrl, endpoint, sourceOrigin);
}

export function getPropertyImages(images: readonly string[] | null | undefined, featuredImage?: string | null): string[] {
  return [...new Set([...(images ?? []), featuredImage ?? ''].map((image) => image.trim()).filter(Boolean))]
    .map(getImageDeliveryUrl);
}