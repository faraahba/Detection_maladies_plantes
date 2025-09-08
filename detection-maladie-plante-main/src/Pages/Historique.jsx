import React, { useEffect, useState } from 'react';
import { Loader2, X,Sprout } from "lucide-react";

const PredictionResults = () => {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('http://localhost:5000/predictions');
        const data = await response.json();
        setPredictions(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

    const Modal = ({ imageUrl, onClose }) => (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="relative max-w-3xl max-h-[80vh] w-full h-full flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt="Full size"
                    className="w-auto max-w-full max-h-full object-contain rounded-lg"
                />
            </div>
        </div>
    );


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="flex justify-center items-center text-3xl font-bold text-center text-gray-900 mb-12">
          <Sprout className="h-8 w-8 text-green-600"/> History Prediction Results
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {predictions.map((prediction) => (
            <div 
              key={prediction.id} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div 
                className="w-full h-64 cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(`http://localhost:5000/image/${prediction.id}`)}
              >
                <img
                  src={`http://localhost:5000/image/${prediction.id}`}
                  alt={prediction.filename}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <p className="text-lg font-medium text-gray-500">
                  Diagnosis
                </p>
                <p className={`text-xl font-bold ${prediction.class_name === 'good_Cucumber' ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction.class_name === "Ill_cucumber" ? "Diseased" : "Healty"}
                </p>
                <p className="text-lg font-medium text-gray-500">
                  Confidence
                </p>
                <p className="text-xl font-bold">
                  {prediction.confidence.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <Modal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default PredictionResults;