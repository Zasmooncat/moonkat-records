import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    canonical,
    name = 'Moonkat Records',
    type = 'website'
}) => {
    const siteUrl = 'https://moonkatrecords.com';
    const defaultTitle = 'Moonkat Records | Underground Drum & Bass / Jungle Label';
    const defaultDesc = 'Independent label focused on deep, dubbed, emotional and futuristic Drum & Bass / Jungle music. Stream, download and buy our latest releases.';

    const fullTitle = title ? `${title} | Moonkat Records` : defaultTitle;
    const metaDesc = description || defaultDesc;
    const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDesc} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Facebook / Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@moonkatrecords" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDesc} />

            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Moonkat Records",
                    "url": siteUrl,
                    "logo": "https://moonkatrecords.com/moonkat-logo.png",
                    "sameAs": [
                        "https://moonkatrecords.bandcamp.com",
                        "https://www.instagram.com/moonkatrecords",
                        "https://soundcloud.com/moonkatrecords",
                        "https://www.facebook.com/moonkatrecords"
                    ],
                    "description": defaultDesc
                })}
            </script>
        </Helmet>
    );
};

export default SEO;
