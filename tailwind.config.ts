import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./stitch/**/*.{html,js,ts,jsx,tsx}", // Include stitch folder
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#4361ee",
                    dark: "#3651d4",
                    light: "#6b83f2",
                },
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
