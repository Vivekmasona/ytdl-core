const express = require('express');
const ytdl = require('yt-dlp-core');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).send('Video URL not provided in the "url" parameter.');
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

    const videoStream = ytdl(videoURL, { format });

    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters from the title
    const output = fs.createWriteStream(`${videoTitle}.mp4`);

    videoStream.pipe(output);

    output.on('finish', () => {
      console.log(`Download completed for ${videoTitle}!`);
      res.send(`Download completed for ${videoTitle}!`);
    });

    output.on('error', (err) => {
      console.error(`Error downloading ${videoTitle}:`, err);
      res.status(500).send(`Error downloading ${videoTitle}: ${err.message}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

