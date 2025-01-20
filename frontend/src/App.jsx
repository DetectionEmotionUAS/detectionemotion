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
      setResult(null); // Reset hasil sebelumnya
      setError("");
    } else {
      setError("Pilih satu gambar untuk analisis.");
    }
  };

  const handleUploadClick = () => {
    if (!image) {
      alert("Pilih satu gambar untuk analisis!");
      return;
    }

    const fileInput = document.querySelector("#fileInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    fetch("https://flaskbackend-mu.vercel.app/upload", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengunggah gambar.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.predicted_class) {
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
      <div className={`content ${result ? "detected" : ""}`}>
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
                <img
                  src="https://cdn-icons-png.flaticon.com/128/11529/11529610.png"
                  alt="Icon"
                  className="icon"
                />
                <p>Klik untuk memilih file</p>
                <p className="support-text">Mendukung: JPG, PNG</p>
              </>
            )}
          </label>
        </div>

        {result && (
          <div className="result-box">
            <h2>Hasil Deteksi</h2>
            <p>
              <strong>Ekspresi:</strong> {result.predicted_class}
            </p>
            <p>
              <strong>Akurasi:</strong> {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="upload-btn"
          onClick={handleUploadClick}
          disabled={loading || !image}
        >
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            "Unggah"
          )}
        </button>
        <button className="cancel-btn" onClick={handleCancelClick}>
          Batal
        </button>
      </div>

    </div>
  );
}

export default App;
