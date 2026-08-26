import {defineField, defineType} from 'sanity'

export const restaurantMenu = defineType({
  name: 'restaurantMenu',
  title: 'Restaurant-Speisekarte',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Seitentitel',
      type: 'string',
      initialValue: 'Speisekarte',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'menus',
      title: 'Menüs (z. B. Erdmann´s Menü)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'setMenu',
          title: 'Menü',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Preis',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'courses',
              title: 'Gänge',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
          preview: {
            select: {title: 'name', price: 'price'},
            prepare: ({title, price}) => ({
              title: title || 'Menü',
              subtitle: price != null ? `${price} €` : '',
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Kategorien à la carte',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'category',
          title: 'Kategorie',
          fields: [
            defineField({
              name: 'name',
              title: 'Name (z. B. Antipasti)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Gerichte',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'dish',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Gericht',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'price',
                      title: 'Preis',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    }),
                  ],
                  preview: {
                    select: {title: 'name', price: 'price'},
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
            select: {title: 'name', items: 'items'},
            prepare: ({title, items}) => ({
              title: title || 'Kategorie',
              subtitle: `${items?.length || 0} Gerichte`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'note',
      title: 'Fußnotiz',
      type: 'string',
      initialValue: '*Für Infos zu Allergenen sprecht uns gerne an :)',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Restaurant-Speisekarte'}),
  },
})
