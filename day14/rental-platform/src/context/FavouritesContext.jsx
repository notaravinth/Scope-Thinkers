import {
  createContext,
  useContext,
  useState,
} from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (property) => {
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (item) => item.id === property.id
      );

      if (alreadyFavorite) {
        return currentFavorites;
      }

      return [...currentFavorites, property];
    });
  };

  const removeFavorite = (propertyId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (item) => item.id !== propertyId
      )
    );
  };

  const toggleFavorite = (property) => {
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (item) => item.id === property.id
      );

      if (alreadyFavorite) {
        return currentFavorites.filter(
          (item) => item.id !== property.id
        );
      }

      return [...currentFavorites, property];
    });
  };

  const isFavorite = (propertyId) => {
    return favorites.some(
      (item) => item.id === propertyId
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
};