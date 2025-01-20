import React, { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setError("");
    } else {
      setError("Pilih satu gambar untuk analisis.");
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Pilih satu gambar untuk analisis!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data);
        if (data.expression) {
          setResult(data);
          setError("");
        } else {
          setResult(null);
          setError(data.error || "Ekspresi tidak terdeteksi.");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setResult(null);
        setError("Terjadi kesalahan saat mengunggah file.");
      })
      .finally(() => setLoading(false));
  };

  const handleCancelClick = () => {
    setImage(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="container">
      <h1>Sistem Deteksi Ekspresi Wajah</h1>
      <p>Unggah satu gambar untuk analisis.</p>
      <div className="content">
        <div className="upload-box">
          <input
            type="file"
            accept="image/*"
            id="fileInput"
            onChange={handleFileUpload}
            hidden
          />
          <label htmlFor="fileInput" className="upload-area">
            {image ? (
              <img src={image} alt="Preview" className="preview-image" />
            ) : (
              <>
                <img src="https://via.placeholder.com/100" alt="Icon" className="icon" />
                <p>Klik untuk memilih file</p>
                <p className="support-text">Mendukung: JPG, PNG</p>
              </>
            )}
          </label>
        </div>

        {loading && <p>Memproses...</p>}
        {result && (
          <div className="result-box">
            <h2>Hasil Deteksi</h2>
            <p>
              <strong>Ekspresi:</strong> {result.expression}
            </p>
            <p>
              <strong>Akurasi:</strong> {result.accuracy}%
            </p>
            <h3>Probabilitas:</h3>
            <div className="probabilities">
              {Object.entries(result.probabilities).map(([key, value]) => (
                <div key={key} className="probability-bar">
                  <span>{key}</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span>{(value * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="action-buttons">
        <button
          className="upload-btn"
          onClick={handleUploadClick}
          disabled={loading || !image}
        >
          {loading ? "Mengunggah..." : "Unggah"}
        </button>
        <button className="cancel-btn" onClick={handleCancelClick}>
          Batal
        </button>
      </div>
    </div>
  );
}

export default App;
