export default {
  name: 'release',
  title: 'Releases',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Release Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{ type: 'artist' }]
    },
    {
      name: 'cover',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date'
    },
    {
      name: 'bandcamp',
      title: 'Bandcamp Link',
      type: 'url'
    },
    // PROMO PAGE FIELDS
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'promoActive',
      title: 'Active Promo',
      type: 'boolean',
      initialValue: false,
      description: 'Enable this to make the hidden promo page accessible.'
    },
    {
      name: 'promoDescription',
      title: 'Promo Description',
      type: 'text',
      description: 'Text shown on the promo page (credits, info, etc.)',
      hidden: ({ document }) => !document?.promoActive
    },
    {
      name: 'audioPreview',
      title: 'Audio Preview (MP3) - LEGACY',
      type: 'file',
      options: {
        accept: 'audio/*'
      },
      description: 'Legacy upload. Use the tracks list below for new releases.',
      hidden: ({ document }) => !document?.promoActive
    },
    {
      name: 'audioTracks',
      title: 'Audio Tracks (MP3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Track Title', type: 'string', validation: Rule => Rule.required() },
            { name: 'file', title: 'Audio File', type: 'file', options: { accept: 'audio/*' }, validation: Rule => Rule.required() }
          ]
        }
      ],
      description: 'Upload the tracks for the promo page. You can upload multiple for an EP.',
      hidden: ({ document }) => !document?.promoActive
    },
    {
      name: 'downloadLink',
      title: 'Download Link (URL)',
      type: 'url',
      description: 'Direct link to the file (Dropbox, WeTransfer, etc.) unlocked after feedback.',
      hidden: ({ document }) => !document?.promoActive
    }
  ]
}
