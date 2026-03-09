import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

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
        }),
      ],
      sidebar: [
        { label: 'Guide', autogenerate: { directory: 'guide' } },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
