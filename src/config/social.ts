export interface SocialLinkConfig {
  id: 'linkedin' | 'instagram' | 'x' | 'github' | 'dribbble';
  label: string;
  url: string;
}

function resolveUrl(envValue: string | undefined, fallback: string): string {
  const candidate = envValue?.trim();
  if (!candidate) {
    return fallback;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export const SOCIAL_LINKS: SocialLinkConfig[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: resolveUrl(import.meta.env.VITE_SOCIAL_LINKEDIN, 'https://www.linkedin.com'),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: resolveUrl(import.meta.env.VITE_SOCIAL_INSTAGRAM, 'https://www.instagram.com'),
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    url: resolveUrl(import.meta.env.VITE_SOCIAL_X, 'https://x.com'),
  },
  {
    id: 'github',
    label: 'GitHub',
    url: resolveUrl(import.meta.env.VITE_SOCIAL_GITHUB, 'https://github.com'),
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    url: resolveUrl(import.meta.env.VITE_SOCIAL_DRIBBBLE, 'https://dribbble.com'),
  },
];
