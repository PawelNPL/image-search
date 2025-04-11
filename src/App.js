import React, { useState } from 'react';
import './App.css';

const ImageGrid = ({ images, onImageClick }) => {
  if (!images || images.length === 0) {
    return <p>Nie znaleziono obrazów lub nie przeprowadzono jeszcze wyszukiwania.</p>;
  }
  return (
              <div className="image-grid">
                {images.map((image) => (
                  <div key={image.id} className="grid-item" onClick={() => onImageClick(image.largeImageURL)}>
                    <img src={image.webformatURL} alt={image.tags} />
                  </div>
                ))}
              </div>
            );
          };
const Modal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={imageUrl} alt="Powiększony obraz" />
      </div>
    </div>
  );
};

function App() {
      const [images, setImages] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      const [selectedImage, setSelectedImage] = useState(null);

  const PIXABAY_API_KEY = '49702466-3769ed210c706947af5a47937'; 

  const searchCategories = {
    Zwierzęta: 'animals',
    Krajobrazy: 'nature,landscape',
    Miasta: 'city,buildings',
    Inne: 'people,objects'
  };

  const fetchImages = async (query) => {
    if (!PIXABAY_API_KEY) {
          setError('Brak klucza API. Podaj prawidłowy klucz');
        setImages([]);
        setIsLoading(false);
        return;
    }

            setIsLoading(true);
            setError(null);
            setImages([]);

    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `błąd HTTP: ${response.status}`;
         if (response.status === 400) {
             try {
                const errorData = await response.text(); 
                if (errorData.includes("[ERROR 400] \"key\" is invalid")) {
                    errorMessage = 'mieprawidłowy klucz API';
                } else if (errorData.includes("Invalid or missing API key")) {
                     errorMessage = 'nieprawidłowy lub brakujący klucz API';
                }
             } catch (parseError) {

             }
        } else if (response.status === 429) {
             errorMessage = 'przekroczono limit zapytań';
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        setImages(data.hits);
      } else {
        setImages([]);
        setError(`nie znaleziono obrazów dla zapytania: "${query}"`);
      }

            } catch (err) {
              console.error("błąd podczas pobierania danych:", err);
              setError(`nie udało się pobrać obrazów: ${err.message}.`);
              setImages([]);
            } finally {
              setIsLoading(false);
            }
          };

          const handleImageClick = (imageUrl) => {
            setSelectedImage(imageUrl);
          };

          const handleCloseModal = () => {
            setSelectedImage(null);
          };

          return (
            <div className="App">
              <h1>Wyszukiwarka Obrazów</h1>

              <div className="search-buttons">
                {Object.keys(searchCategories).map((label) => (
                  <button
                    key={label}
                    onClick={() => fetchImages(searchCategories[label])}
                    disabled={isLoading}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="status-message">ładowanie obrazów</p>}

            {error && <p className="error-message">Błąd: {error}</p>}

            {!isLoading && !error && images.length === 0 && <p>kliknij przycisk, aby wyszukać obrazy</p>}
            {!isLoading && <ImageGrid images={images} onImageClick={handleImageClick} />}


            <Modal imageUrl={selectedImage} onClose={handleCloseModal} />
          </div>
        );
      }

      export default App;