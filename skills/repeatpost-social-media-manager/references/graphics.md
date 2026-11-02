# Graphics reference

Read this before you design a graphic with `renderGraphic` or put a logo on a photo with `brandImage`. Neither tool uses an AI model or AI credits.

## renderGraphic: SVG to PNG

### Sizes

| `size` | Pixels |
|---|---|
| square (default) | 1080x1080 |
| portrait | 1080x1350 |
| story | 1080x1920 |
| landscape | 1200x628 |
| wide | 1920x1080 |

For another size, send `width` and `height` (16 to 2160 px each) instead of `size`.

### Rules the SVG must follow

- **Match the aspect ratio.** The SVG's viewBox (or its width and height) must have the same aspect ratio as the output, within 1%. It's then scaled to exactly the output size. A mismatched ratio is refused, so nothing is letterboxed. An SVG with no size gets the output size as its viewBox. Simplest: use the output pixels, such as `viewBox="0 0 1080 1080"` for square or `viewBox="0 0 1080 1920"` for story.
- **Size limit:** up to 200 KB of SVG markup.
- **Background:** the PNG is always opaque. Transparent areas are filled with the root element's background colour (`style="background: #ffffff"` on the root `<svg>`), or with white.
- **Fonts:** Inter, Montserrat, Poppins, Playfair Display and Roboto, each in weights 400, 600 and 700. Any other font family renders in Inter.
- **Images inside the SVG:** base64 data URIs (PNG, JPEG or WebP), or `https://cdn.repeatpost.com` media URLs, with up to 10 images of 10 MB each. Other external references are rejected, and scripts aren't run.

### Use the brand

`getBrandVoice` returns the brand's colours (each role with its hex value, plus background and text pairs that are legible together), its logo file URLs and a one-line visual style. Design with those colours and pairs. A logo can go in as an image when its URL is on `https://cdn.repeatpost.com`.

### Save and use the result

- `fileName` (`.png` is added when missing), `folderId` (the root folder when omitted) and `caption` are optional.
- The result has the new file's url, `mediaId`, path, width, height and file size. Attach the url to a post with `mediaUrls`.

### Starting point

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" style="background: #ffffff">
  <!-- Replace the colours with the brand's colours from getBrandVoice. -->
  <text x="540" y="560" text-anchor="middle" font-family="Poppins" font-weight="700"
        font-size="96" fill="#1574ff">Weekend sale</text>
</svg>
```

Keep text well inside the edges, and show the user the design idea before saving it if they haven't described one.

## brandImage: logo on a photo

- **Source image:** `mediaId`, or `mediaUrl` (`https://cdn.repeatpost.com/...`), of a PNG, JPEG or WebP file in the media library. Upload a new photo first with `mediaUpload`.
- **Brand:** by default, the brand voice that applies to the workspace. Use `channelId` for a channel's voice, or `brandVoice` to name one.
- **`logoPosition`:** top-left, top-center, top-right, bottom-left, bottom-center or bottom-right. The default is bottom-right.
- **`logoScale`:** the logo's width as a fraction of the image's shorter edge, from 0.05 to 0.5. The default is 0.16.
- **`frame`:** true draws a border in the brand's primary colour.
- **`captionStrip`:** short text, up to 120 characters, on a band along the bottom in a brand colour.
- The logo variant for light or dark backgrounds is chosen from the brightness of the area it covers, and blank logo files are skipped.
- **Result:** a new file, saved by default in the original's folder (`folderId` changes it). The original stays unchanged. PNG stays PNG, and JPEG and WebP are saved as JPEG.

## Not available

RepeatPost can't generate AI images or videos through MCP. The user creates them in the RepeatPost app, and you can then use them from the media library.
