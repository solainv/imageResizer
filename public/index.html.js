<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Resizer</title>
</head>
<body>
  <h1>Image Resizer</h1>
  <form id="upload-form" enctype="multipart/form-data">
    <label for="input-folder">Select Input Folder:</label>
    <input type="file" id="input-folder" webkitdirectory directory multiple><br><br>
    <label for="output-folder">Output Folder Name:</label>
    <input type="text" id="output-folder" name="output-folder" required><br><br>
    <button type="submit">Upload and Process</button>
  </form>

  <div id="download-link" style="display: none;">
    <a id="download-zip" href="#" download>Download Processed Images</a>
  </div>

  <script>
    document.getElementById('upload-form').onsubmit = async function(e) {
      e.preventDefault();

      const inputFolder = document.getElementById('input-folder').files;
      const outputFolder = document.getElementById('output-folder').value;

      const formData = new FormData();
      for (let i = 0; i < inputFolder.length; i++) {
        formData.append('images', inputFolder[i]);
      }
      formData.append('outputFolder', outputFolder);

      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const downloadLink = document.getElementById('download-link');
        downloadLink.style.display = 'block';
        document.getElementById('download-zip').href = data.zipUrl;
      } else {
        alert('Error processing images');
      }
    }
  </script>
</body>
</html>
