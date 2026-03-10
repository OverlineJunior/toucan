import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc from 'starlight-typedoc';

export default defineConfig({
  integrations:[
    starlight({
      title: 'Toucan',
      logo: {
        src: '../assets/toucan.png',
      },
      favicon: './public/toucan.png',
      customCss: [
        './src/styles.css',
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints:['../src/index.ts'],
          tsconfig: './tsconfig.json',
          skipErrorChecking: true,
          typeDoc: {
            router: 'group',
          },
        }),
      ],
      sidebar: [
        { label: 'Guide', autogenerate: { directory: 'guide' } },
        {
          label: 'API',
          items: [
            { label: 'Core ECS', autogenerate: { directory: 'api/Core_ECS' }, collapsed: true },
            { label: 'Hooks', autogenerate: { directory: 'api/Hooks' }, collapsed: true },
            { label: 'Built-in Entities', autogenerate: { directory: 'api/Built-in_Entities' }, collapsed: true },
            { label: 'Built-in Phases', autogenerate: { directory: 'api/Built-in_Phases' }, collapsed: true },
          ]
        },
      ],
    }),
  ],
});
