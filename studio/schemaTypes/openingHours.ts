import {defineField, defineType} from 'sanity'

const hoursLine = {
  type: 'object' as const,
  name: 'hoursLine',
  title: 'Zeile',
  fields: [
    defineField({
      name: 'days',
      title: 'Tage',
      type: 'string',
      description: 'z. B. Mittwoch bis Freitag',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hours',
      title: 'Uhrzeit',
      type: 'string',
      description: 'z. B. 11:00 – 16:00 Uhr',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {days: 'days', hours: 'hours'},
    prepare: ({days, hours}: {days?: string; hours?: string}) => ({
      title: days || 'Zeile',
      subtitle: hours || '',
    }),
  },
}

export const openingHours = defineType({
  name: 'openingHours',
  title: 'Öffnungszeiten',
  type: 'document',
  fields: [
    defineField({
      name: 'cafe',
      title: 'Café & Konditorei / Backstube',
      type: 'object',
      fields: [
        defineField({
          name: 'lines',
          title: 'Zeiten',
          type: 'array',
          of: [hoursLine],
        }),
      ],
    }),
    defineField({
      name: 'restaurant',
      title: 'Restaurant',
      type: 'object',
      fields: [
        defineField({
          name: 'lines',
          title: 'Zeiten',
          type: 'array',
          of: [hoursLine],
        }),
      ],
    }),
    defineField({
      name: 'brunch',
      title: 'Brunch',
      type: 'object',
      fields: [
        defineField({
          name: 'intro',
          title: 'Kurztext auf der Brunch-Seite',
          type: 'string',
          description: 'z. B. Jeden Sonntag von 10:00 bis 13:30 Uhr',
        }),
        defineField({
          name: 'lines',
          title: 'Zeiten',
          type: 'array',
          of: [hoursLine],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Öffnungszeiten'}),
  },
})
