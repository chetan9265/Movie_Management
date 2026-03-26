const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Upload a file to Cloudinary via backend
 * @param {File} file - The file to upload
 * @param {string} folder - Folder name: "movies", "posters", "trailers"
 * @param {function} onProgress - Callback(percent: number)
 * @returns {Promise<string>} - Download URL
 */
export const uploadToCloudinary = async (file, folder = "movies", onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        if (onProgress) onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.url);
      } else {
        reject(new Error("Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload error")));

    xhr.open("POST", `${API}/api/upload`);

    // Add JWT token
    const token = localStorage.getItem("token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
};