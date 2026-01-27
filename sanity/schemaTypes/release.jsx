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
    }
  ]
}
