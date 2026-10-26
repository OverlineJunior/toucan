import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc from "starlight-typedoc";

export default defineConfig({
  site: "https://OverlineJunior.github.io",
  base: "/toucan",
  integrations: [
    starlight({
      title: "Toucan",
      logo: {
        dark: "./public/toucan.png",
        light: "./public/toucan_light.png",
      },
      favicon: "./public/toucan.png",
      customCss: ["./src/styles.css"],
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../src/index.ts"],
          tsconfig: "./tsconfig.json",
          typeDoc: {
            skipErrorChecking: true,
            router: "group",
            gitRevision: "master",
          },
        }),
      ],
      sidebar: [
        {
          label: "Guide",
          items: [{ autogenerate: { directory: "guide" } }],
        },
        {
          label: "API",
          items: [
            {
              label: "Core",
              items: [{ autogenerate: { directory: "api/Core" } }],
              collapsed: true,
            },
            {
              label: "Types",
              items: [{ autogenerate: { directory: "api/Types" } }],
              collapsed: true,
            },
            { label: "Built-ins", link: "api/variables/builtin/" },
          ],
        },
      ],
    }),
  ],
});
