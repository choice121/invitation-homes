import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function packageExtension() {
  const zip = new JSZip();
  const extensionDir = path.resolve('public/extension');
  const files = ['manifest.json', 'popup.html', 'popup.js', 'content.js', 'background.js'];

  for (const file of files) {
    const filePath = path.join(extensionDir, file);
    if (fs.existsSync(filePath)) {
      zip.file(file, fs.readFileSync(filePath, 'utf8'));
    }
  }

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  const outputPath = path.join(extensionDir, 'invitation-homes-importer.zip');
  fs.writeFileSync(outputPath, content);
  console.log('Packaged Chrome extension into:', outputPath);
}

packageExtension().catch(console.error);
