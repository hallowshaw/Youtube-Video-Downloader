const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

const ffmpegPath = './ffmpeg/ffmpeg.exe';  // Path to ffmpeg (remove .exe for Linux)
const ytDlpPath = path.join(__dirname, 'yt-dlp');  // Path to the Linux yt-dlp binary (no .exe)

app.use(cors());
app.use(express.json());

app.post('/download', (req, res) => {
    const { url, quality, audioOnly } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let output = audioOnly ? 'downloaded_audio.mp3' : 'downloaded_video.mp4';
    let formatOption = audioOnly ? 'bestaudio' : quality === "best" ? "bestvideo+bestaudio" : "worst";

    // Construct the yt-dlp command to download video/audio
    const command = audioOnly
        ? `"${ytDlpPath}" -f ${formatOption} -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o ${output} ${url}`
        : `"${ytDlpPath}" -f ${formatOption} --merge-output-format mp4 --ffmpeg-location "${ffmpegPath}" -o ${output} ${url}`;

    // Execute the yt-dlp command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Download Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        // Send the downloaded file to the client
        res.download(output, (err) => {
            if (err) {
                console.error(`Download Error: ${err}`);
            }
            fs.unlinkSync(output);  // Clean up the downloaded file after sending it
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
