import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
  const [audioOnly, setAudioOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically track clipboard and set URL
  useEffect(() => {
    const getClipboardContent = async () => {
      try {
        const text = await navigator.clipboard.readText();

        // Regular expression for both formats: youtube.com/watch?v=xxxx and youtu.be/xxxx
        const youtubeUrlPattern =
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/\S+|(?:v|e(?:mbed)?)\/?([\w-]+)|\S+))|youtu\.be\/([\w-]+)/;

        if (youtubeUrlPattern.test(text)) {
          setUrl(text);
        }
      } catch (err) {
        console.error("Failed to read clipboard:", err);
      }
    };

    // Set interval to check clipboard every 2 seconds
    const clipboardInterval = setInterval(getClipboardContent, 2000);

    return () => clearInterval(clipboardInterval); // Cleanup on component unmount
  }, []);

  const handleDownload = async () => {
    if (!url) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        "https://youtube-video-downloader-jade-six.vercel.app/download",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, quality, audioOnly }),
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = audioOnly ? "audio.mp3" : "video.mp4";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      setError("Download failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="loader-overlay">
          {/* Custom Spinner */}
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
      <div className={`app-content ${loading ? "blur" : ""}`}>
        <h1 className="app-title">Seamless YouTube Downloads Await!</h1>
        {error && <p className="app-error">{error}</p>}
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="app-input"
        />
        <div className="app-options">
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="app-select"
          >
            <option value="best">Best Quality</option>
            <option value="worst">Worst Quality</option>
          </select>
          <label className="app-checkbox-label">
            <input
              type="checkbox"
              checked={audioOnly}
              onChange={() => setAudioOnly(!audioOnly)}
              className="app-checkbox"
            />
            Audio Only
          </label>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className={`app-button ${loading ? "loading" : ""}`}
        >
          {loading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
}

export default App;
