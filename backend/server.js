const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

const ffmpegPath = './ffmpeg/ffmpeg.exe';

// Custom CORS middleware to allow all origins (or specific ones)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // This allows all origins. Adjust for tighter security if needed
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow the required methods
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Allow necessary headers
    next();
});

// Continue with your existing code
app.use(express.json());

// Handle download request
app.post('/download', (req, res) => {
    const { url, quality, audioOnly } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const output = audioOnly ? 'downloaded_audio.mp3' : 'downloaded_video.mp4';
    const formatOption = audioOnly ? 'bestaudio' : quality === 'best' ? 'bestvideo+bestaudio' : 'worst';
    const cookiesPath = './youtube_cookies.txt';

    const command = audioOnly
        ? `yt-dlp -f ${formatOption} -x --audio-format mp3 --ffmpeg-location ${ffmpegPath} --cookies ${cookiesPath} -o ${output} ${url}`
        : `yt-dlp -f ${formatOption} --merge-output-format mp4 --ffmpeg-location ${ffmpegPath} --cookies ${cookiesPath} -o ${output} ${url}`;

    exec(command, { timeout: 60000 }, (error, stdout, stderr) => { // Added a timeout for better control over long-running commands
        if (error) {
            console.error(`Download Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to download video' });
        }

        res.download(output, (err) => {
            if (err) {
                console.error(`File Download Error: ${err}`);
            }
            fs.unlinkSync(output); // Clean up the downloaded file after sending it
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
