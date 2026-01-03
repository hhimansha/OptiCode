import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const Face = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModelsAndStart = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    loadModelsAndStart();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <video
        ref={videoRef}
        width="720"
        height="560"
        autoPlay
        muted
        className="absolute top-4 left-4 rounded-lg shadow-lg border border-gray-700"
      ></video>
      <canvas
        ref={canvasRef}
        width="720"
        height="560"
        className="absolute top-4 left-4"
      ></canvas>
    </div>
  );
};

export default Face;
