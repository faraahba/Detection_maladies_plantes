import { useState, useEffect } from 'react'
import { Clock, Leaf, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react'
import image from '../../FlaskApp/uploads/5.jpg'

const getPlantStatus = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(Math.random() > 0.5)
        }, 2000)
    })
}


const Home = () => {
    const [isHealthy, setIsHealthy] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
        setCurrentTime(new Date())
        }, 1000)

        return () => {
        clearInterval(timer)
        }
    }, [])

    const fetchPlantStatus = async () => {
        setIsLoading(true)
        const status = await getPlantStatus()
        setIsHealthy(status)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchPlantStatus()
    }, [])

  return (
    <div className="bg-gradient-to-b from-green-100 to-green-150  relative overflow-hidden">
        <main className="container mx-auto mt-8 px-4 relative z-10">

            <h1 className="text-3xl font-bold mb-8 text-center text-green-800 flex items-center justify-center">
                <Leaf className="mr-2" />
                Real-time Disease Detection
            </h1>

            <div className="p-8 rounded-lg  max-w-2xl mx-auto">
                {isLoading ? (

                    <div className='mt-8'>
                        <p className="flex flex-col text-xl items-center justify-center">
                            <Loader className='animate-spin'/>
                            Chargement des données...
                        </p>
                    </div>
                ) : (
                    <>
                    <div className='grid grid-cols sm:grid-cols-2 gap-8 items-center'>

                        <div className="relative">
                            {false ? (
                                <img src={image} alt="Captured by Raspberry Pi" className="w-full rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
                                    <Loader className='animate-spin'/>
                                    Chargement d'image...
                                </div>
                            )}
                        </div>

                        <div className='space-y-6'>
                            <div>
                                <p className="text-lg font-medium text-gray-500">Diagnosis</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {false ? Healty :"-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-500">Confidence</p>
                                <p className="text-2xl font-bold">
                                    {false ? "100%" : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-500">Recommendation</p>
                                <p className="text-lg font-bold">
                                    {false ? "Recommendation" : "-"}
                                </p>
                            </div>
                        </div>

                    </div>
                    {false && 
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={fetchPlantStatus}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                            >
                                <RefreshCw className="mr-2" />
                                Recharger les données
                            </button>
                        </div>
                    }
                    </>
                )}
            </div>
        </main>
    </div>
  )
}

export default Home
