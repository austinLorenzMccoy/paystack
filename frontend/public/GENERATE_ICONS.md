# Generate PWA Icons

The `icon.svg` file needs to be converted to PNG format for PWA support.

## Option 1: Using ImageMagick (Command Line)

```bash
# Install ImageMagick if not already installed
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Generate icons
convert -background none icon.svg -resize 192x192 icon-192.png
convert -background none icon.svg -resize 512x512 icon-512.png
```

## Option 2: Using Online Tool

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set output size to 192x192, download as `icon-192.png`
4. Repeat with 512x512, download as `icon-512.png`
5. Place both files in `frontend/public/`

## Option 3: Using Node.js Script

```bash
npm install -g sharp-cli
sharp -i icon.svg -o icon-192.png resize 192 192
sharp -i icon.svg -o icon-512.png resize 512 512
```

## Verify Icons

After generating, verify the files exist:
- `frontend/public/icon-192.png`
- `frontend/public/icon-512.png`

The PWA manifest is already configured to use these icons.
