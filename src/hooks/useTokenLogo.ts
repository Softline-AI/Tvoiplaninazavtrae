import { useState, useEffect } from 'react';
import { tokenMetadataService } from '../services/tokenMetadataService';

/**
 * Hook to fetch and cache token logo
 * @param tokenMint - Token mint address
 * @returns Token logo URL
 */
const DEFAULT_LOGO = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

export const useTokenLogo = (tokenMint: string | null | undefined): string => {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);

  useEffect(() => {
    if (!tokenMint) {
      setLogoUrl(DEFAULT_LOGO);
      return;
    }

    let isMounted = true;

    const fetchLogo = async () => {
      try {
        const logo = await tokenMetadataService.getTokenLogo(tokenMint);
        if (isMounted && logo && logo !== DEFAULT_LOGO) {
          const img = new Image();
          img.onload = () => {
            if (isMounted) setLogoUrl(logo);
          };
          img.onerror = () => {
            if (isMounted) setLogoUrl(DEFAULT_LOGO);
          };
          img.src = logo;
        }
      } catch (error) {
        console.error('Error loading token logo:', error);
        if (isMounted) setLogoUrl(DEFAULT_LOGO);
      }
    };

    fetchLogo();

    return () => {
      isMounted = false;
    };
  }, [tokenMint]);

  return logoUrl;
};

/**
 * Hook to fetch multiple token logos
 * @param tokenMints - Array of token mint addresses
 * @returns Map of token mint to logo URL
 */
export const useTokenLogos = (tokenMints: string[]): Record<string, string> => {
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!tokenMints || tokenMints.length === 0) {
      return;
    }

    let isMounted = true;

    const fetchLogos = async () => {
      const newLogos: Record<string, string> = {};
      setLoading(new Set(tokenMints));

      const results = await Promise.allSettled(
        tokenMints.map(async (mint) => {
          const logo = await tokenMetadataService.getTokenLogo(mint);
          return { mint, logo };
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newLogos[result.value.mint] = result.value.logo;
        }
      });

      if (isMounted) {
        setLogos((prev) => ({ ...prev, ...newLogos }));
        setLoading(new Set());
      }
    };

    fetchLogos();

    return () => {
      isMounted = false;
    };
  }, [tokenMints.join(',')]);

  return logos;
};
