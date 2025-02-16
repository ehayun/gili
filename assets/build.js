const sassPlugin = require("esbuild-plugin-sass");
const copyStaticFiles = require('esbuild-copy-static-files')

// SCSS build with font handling
require("esbuild").build({
    entryPoints: ["./scss/App.scss"],
    outfile: "../public/css/main.css",
    bundle: true,
    minify: true,
    loader: {
        ".woff": "file",
        ".woff2": "file",
        ".eot": "file",
        ".ttf": "file",
        ".otf": "file",
        ".svg": "file"
    },
    assetNames: "fonts/[name]-[hash]",
    publicPath: "/",
    plugins: [sassPlugin()]
})
    .then(() => console.log("⚡ SCSS Done"))
    .catch(() => process.exit(1));

// Images copy
require("esbuild").build({
    outdir: "../public/images",
    plugins: [
        copyStaticFiles({
            src: './images',
            dest: '../public/images',
            dereference: true,
            errorOnExist: false,
            preserveTimestamps: true,
            recursive: true,
        })
    ]
})
    .then(() => console.log("⚡ Images Done"))
    .catch(() => process.exit(1));

// Fonts copy
require("esbuild").build({
    outdir: "../public/fonts",
    plugins: [
        copyStaticFiles({
            src: './fonts',
            dest: '../public/fonts',
            dereference: true,
            errorOnExist: false,
            preserveTimestamps: true,
            recursive: true,
        })
    ]
})
    .then(() => console.log("⚡ Fonts Done"))
    .catch(() => process.exit(1));

// JavaScript build
require("esbuild").build({
    entryPoints: ["./js/App.jsx"],
    outfile: "../public/js/main.js",
    bundle: true,
    minify: true,
    loader: { ".js": "jsx", ".jsx": "jsx" }
})
    .then(() => console.log("⚡ JS Done"))
    .catch(() => process.exit(1));
