export default {
  name: 'artist',
  title: 'Artists',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Artist Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Artist Image',
      type: 'image',
      options: { hotspot: true }
    },
     {
      name: 'location',
      title: 'Artist Location',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text'
    },
    {
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'url' }]
    }
  ]
}
