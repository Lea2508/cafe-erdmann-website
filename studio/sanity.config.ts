import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env and set your project id.',
  )
}

export default defineConfig({
  name: 'cafe-erdmann',
  title: 'Café Erdmann Speisekarte',
  projectId: projectId || 'missingProjectId',
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalte')
          .items([
            S.listItem()
              .title('Restaurant-Speisekarte')
              .id('restaurantMenu')
              .child(
                S.document().schemaType('restaurantMenu').documentId('restaurantMenu'),
              ),
            S.listItem()
              .title('Brunch-Menü')
              .id('brunchMenu')
              .child(S.document().schemaType('brunchMenu').documentId('brunchMenu')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
