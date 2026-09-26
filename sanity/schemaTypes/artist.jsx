export default {
  name: 'artist',
  title: 'Artists',
  type: 'document',
  // Sort list view in Studio by order field
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  fields: [
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first on the website. E.g. 1 = first, 2 = second…',
      validation: Rule => Rule.integer().min(0),
    },
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

