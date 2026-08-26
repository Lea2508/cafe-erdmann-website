import {defineField, defineType} from 'sanity'

export const brunchMenu = defineType({
  name: 'brunchMenu',
  title: 'Frühstück / Brunch',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Seitentitel',
      type: 'string',
      initialValue: 'Frühstück',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lead',
      title: 'Kurzzeile oben',
      type: 'string',
      description: 'z. B. Inkl. O-Saft + Wasser',
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'items',
      title: 'Gerichte',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'brunchItem',
          fields: [
            defineField({
              name: 'text',
              title: 'Gericht',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Preis',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'note',
              title: 'Zusatzzeile (kursiv, optional)',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'text', price: 'price'},
            prepare: ({title, price}) => ({
              title: title || 'Gericht',
              subtitle: price != null ? `${price} €` : '',
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Frühstück / Brunch'}),
  },
})
