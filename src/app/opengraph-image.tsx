import { createSocialImage, socialImageSize } from "@/lib/seo/social-image";

export const alt = "Direção Segura — Mais que dirigir, é evoluir.";
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
