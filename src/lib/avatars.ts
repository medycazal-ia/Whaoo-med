export const AVATARS = [
  { id: "avatar-01", label: "Portrait dégradé pastel" },
  { id: "avatar-02", label: "Portrait avec lunettes" },
  { id: "avatar-03", label: "Silhouette géométrique bleue" },
  { id: "avatar-04", label: "Portrait bouclé terracotta" },
  { id: "avatar-05", label: "Renard" },
  { id: "avatar-06", label: "Portrait avec turban" },
  { id: "avatar-07", label: "Chat" },
  { id: "avatar-08", label: "Portrait barbu" },
  { id: "avatar-09", label: "Portrait avec chapeau" },
  { id: "avatar-10", label: "Abstrait" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function avatarSrc(id: string | null | undefined): string {
  const trouve = AVATARS.find((a) => a.id === id);
  return `/avatars/${trouve?.id ?? AVATARS[0].id}.svg`;
}
