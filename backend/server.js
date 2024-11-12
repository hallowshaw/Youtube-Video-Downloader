const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = 5000;

const ffmpegPath = './ffmpeg/ffmpeg.exe';
app.use(express.json());

// Middleware to set CORS headers manually
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins or specific ones
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Preflight response
app.options('*', (req, res) => {
    res.sendStatus(200); // Send status 200 for preflight request
});

app.post('/download', (req, res) => {
    const { url, quality, audioOnly } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let output = audioOnly ? 'downloaded_audio.mp3' : 'downloaded_video.mp4';
    let formatOption = audioOnly ? 'bestaudio' : quality === "best" ? "bestvideo+bestaudio" : "worst";

    const command = audioOnly
        ? `yt-dlp -f ${formatOption} -x --audio-format mp3 --ffmpeg-location ${ffmpegPath} -o ${output} ${url}`
        : `yt-dlp -f ${formatOption} --merge-output-format mp4 --ffmpeg-location ${ffmpegPath} -o ${output} ${url}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Download Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        res.download(output, (err) => {
            if (err) {
                console.error(`Download Error: ${err}`);
            }
            fs.unlinkSync(output); // Remove file after sending
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
