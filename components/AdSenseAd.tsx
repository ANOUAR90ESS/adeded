import React, { useEffect } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = ''
}) => {
  useEffect(() => {
    try {
      // Push ad to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9054863881104831"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSenseAd;

// Preset ad components for different placements

// Ad for top of page (horizontal banner)
export const AdSenseTopBanner: React.FC = () => (
  <AdSenseAd
    adSlot="5652456930"
    adFormat="horizontal"
    className="my-4"
  />
);

// Ad for sidebar (vertical banner)
export const AdSenseSidebar: React.FC = () => (
  <AdSenseAd
    adSlot="2400574262"
    adFormat="vertical"
    className="my-4"
  />
);

// Ad for in-feed (responsive)
export const AdSenseInFeed: React.FC = () => (
  <AdSenseAd
    adSlot="5652456930"
    adFormat="fluid"
    className="my-6"
  />
);

// AMP Ad Component (for AMP pages if needed)
export const AMPAdComponent: React.FC<{ adSlot: string }> = ({ adSlot }) => {
  return (
    <amp-ad
      width="100vw"
      height="320"
      type="adsense"
      data-ad-client="ca-pub-9054863881104831"
      data-ad-slot={adSlot}
      data-auto-format="mcrspv"
      data-full-width=""
    >
      <div overflow=""></div>
    </amp-ad>
  );
};
