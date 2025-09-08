import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader, Sprout } from 'lucide-react';

const PredictManual = () => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  function getRandomRecommendationsFromList(recommendations) {
    const randomRecommendations = [];
    while (randomRecommendations.length < 3) {
      const randomIndex = Math.floor(Math.random() * recommendations.length);
      const recommendation = recommendations[randomIndex];
      if (!randomRecommendations.includes(recommendation)) {
        randomRecommendations.push(recommendation);
      }
    }
  
    return randomRecommendations;
  }

  // Function to get recommendations for Ill_cucumber
  function getIllCucumberRecommendations() {
    const illRecommendations = [
      'Remove affected leaves immediately to prevent further spread of the disease.',
      'Apply appropriate fungicides or bactericides based on the disease type.',
      'Ensure proper spacing between plants to reduce humidity and prevent fungal growth.',
      'Use drip irrigation to avoid water splashing on leaves, which can spread diseases.',
      'Inspect the soil for any nutrient deficiencies and apply necessary fertilizers.',
      'Monitor the plant regularly for any additional symptoms or pests.'
    ];

    return getRandomRecommendationsFromList(illRecommendations);
  }

  // Function to get recommendations for Good_cucumber
  function getGoodCucumberRecommendations() {
    const goodRecommendations = [
      'The cucumber is in good condition. Ensure it receives adequate water and nutrients.',
      'Monitor regularly for pests or disease signs, even if the plant looks healthy.',
      'Prune dead or yellow leaves to encourage better airflow and growth.',
      'Ensure proper support for the cucumber vine to prevent damage.',
      'Keep the plant well-mulched to conserve moisture and suppress weeds.',
      'Continue with regular care, such as watering and fertilizing as needed.'
    ];

    return getRandomRecommendationsFromList(goodRecommendations);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setImage(file); // Store the file directly, not as base64
    }
  };

  const removeImage = () => {
    setImage(null);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image); // Use the actual file here

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      console.log('Prediction Response:', response);
      console.log('data:', data);
      setPrediction({
        disease: data.class_name,
        confidence: `${data.confidence.toFixed(2)}%`,
        recommendation: data.class_name === 'Ill_cucumber'
        ? getIllCucumberRecommendations()
        : getGoodCucumberRecommendations()
      });
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {!image && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center
              ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'}
              transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg mb-2">Drag and drop your plant image here</p>
              <p className="text-sm text-gray-500">or click to select a file</p>
            </label>
          </div>
        )}

        {image && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 space-y-4">
              <div className="relative">
                <img
                  src={URL.createObjectURL(image)} // Use ObjectURL for image preview
                  alt="Preview"
                  className="w-full h-[60vh] object-contain rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <button
                onClick={handlePredict}
                className={`w-full py-3 px-6 rounded-lg transition-colors text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed opacity-70' // Disabled state
                    : prediction
                    ? 'bg-green-400 cursor-not-allowed opacity-70' // Prediction state
                    : 'bg-green-600 hover:bg-green-700' // Normal state
                }`}
                disabled={isLoading || prediction}
              >
                {isLoading ? 'Predicting...' : prediction ? 'Prediction Done' : 'Predict Disease'}
              </button>
            </div>

            <div className="md:w-1/2">
              {isLoading ? (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 h-full flex flex-col items-center justify-center">
                  <Loader className="animate-spin" />
                  Chargement des données...
                </div>
              ) : prediction ? (
                <div className="bg-white p-6 rounded-lg h-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Sprout className="h-6 w-6 text-green-600" />
                    Plant Health Analysis
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                      <p className={`text-2xl font-bold ${prediction.disease === 'good_Cucumber' ? 'text-green-600' : 'text-red-600'}`}>
                        {prediction.disease === "Ill_cucumber" ? "Diseased" : "Healty"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Confidence</p>
                      <p className="text-2xl font-bold">{prediction.confidence}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Recommendation</p>
                      {prediction.recommendation && (
                        <div>
                          {prediction.recommendation.map((recommendation, index) => (
                            <p key={index} className="text-lg mb-2">• {recommendation}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">Prediction results will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictManual;
