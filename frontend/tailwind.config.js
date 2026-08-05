/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#08111f",
                panel: "#101c30",
                muted: "#94a3b8",
                brand: "#7c3aed",
                accent: "#16a34a"
            }
        }
    },
    plugins: []
};
