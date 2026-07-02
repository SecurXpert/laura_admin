import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const subadminResolverPlugin = () => {
  const mainSrc = path.resolve(__dirname, "./src").replace(/\\/g, "/");
  const subadminSrc = path.resolve(__dirname, "./src/subadmin/src").replace(/\\/g, "/");

  return {
    name: "subadmin-resolver",
    enforce: "pre" as const,
    async resolveId(source: string, importer: string | undefined, options: any) {
      if (!importer) return null;
      const normalizedImporter = importer.replace(/\\/g, "/");
      if (!normalizedImporter.includes("/subadmin/src/")) return null;

      let target: string | null = null;
      const normalizedSource = source.replace(/\\/g, "/");

      if (normalizedSource.startsWith("@/")) {
        target = path.resolve(subadminSrc, normalizedSource.slice(2));
      } else if (normalizedSource.startsWith(mainSrc) && !normalizedSource.startsWith(subadminSrc)) {
        const relativePath = normalizedSource.slice(mainSrc.length);
        target = path.join(subadminSrc, relativePath);
      }

      if (target) {
        const resolved = await this.resolve(target, importer, { skipSelf: true, ...options });
        if (resolved) return resolved;
      }
      return null;
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    subadminResolverPlugin(),
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
