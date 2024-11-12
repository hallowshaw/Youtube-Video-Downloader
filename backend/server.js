const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

const ffmpegPath = './ffmpeg/ffmpeg.exe';

// Allow requests from your frontend origins
app.use(cors({
    origin: ['http://localhost:5173', 'https://ytd2.netlify.app'], // Add any other necessary origins here
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

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

    exec(command, (error, stdout, stderr) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
