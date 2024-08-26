const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const archiver = require('archiver');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.static(__dirname));  // Stellt sicher, dass ZIP-Dateien im Root-Verzeichnis bereitgestellt werden

// Route zum Hochladen und Verarbeiten von Bildern
app.post('/upload', upload.array('images'), async (req, res) => {
  const files = req.files;
  const outputFolder = req.body.outputFolder || 'output';

  const outputDir = path.join(__dirname, outputFolder);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const getMaxDimensions = async (files) => {
    let maxWidth = 0;
    let maxHeight = 0;

    for (const file of files) {
      const metadata = await sharp(file.path).metadata();
      if (metadata.width > maxWidth) maxWidth = metadata.width;
      if (metadata.height > maxHeight) maxHeight = metadata.height;
    }

    return { maxWidth, maxHeight };
  };

  const resizeAndPad = (file, maxWidth, maxHeight, outputDir) => {
    const outputFilePath = path.join(outputDir, file.originalname);
    return sharp(file.path)
      .resize(maxWidth, maxHeight, {
        fit: sharp.fit.contain,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(outputFilePath);
  };

  const { maxWidth, maxHeight } = await getMaxDimensions(files);

  await Promise.all(files.map(file => resizeAndPad(file, maxWidth, maxHeight, outputDir)));

  // Erstelle ein ZIP-Archiv der Ausgabeordner
  const zipFilePath = path.join(__dirname, `${outputFolder}.zip`);
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(outputDir, false);
  
  output.on('close', () => {
    res.json({ zipUrl: `/${outputFolder}.zip` });
  });

  archive.finalize();
});

// Starte den Server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
