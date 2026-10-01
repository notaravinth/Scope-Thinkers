import { createContext, useContext, useEffect, useState } from "react";

const PropertyContext = createContext();


const findListings = (data) => {
  if (Array.isArray(data)) {
    if (
      data.length > 0 &&
      typeof data[0] === "object"
    ) {
      return data;
    }

    return [];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  // Prefer known property names
  const preferredKeys = [
    "listings",
    "results",
    "properties",
    "placards",
    "items",
    "data",
  ];

  for (const key of preferredKeys) {
    if (Array.isArray(data[key]) && data[key].length > 0) {
      return data[key];
    }
  }

  // Search every nested object
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0) {
      if (
        typeof value[0] === "object" &&
        (
          value[0].listingKey ||
          value[0].address ||
          value[0].photos
        )
      ) {
        return value;
      }
    }

    if (
      value &&
      typeof value === "object"
    ) {
      const result = findListings(value);

      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
};


const findValue = (object, keys) => {
  if (!object || typeof object !== "object") {
    return null;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  for (const value of Object.values(object)) {
    if (
      value &&
      typeof value === "object"
    ) {
      const result = findValue(value, keys);

      if (
        result !== null &&
        result !== undefined &&
        result !== ""
      ) {
        return result;
      }
    }
  }

  return null;
};


const findImage = (property) => {
  const photos = findValue(property, [
    "photos",
    "images",
    "photoUrls",
    "imageUrls",
  ]);

  if (Array.isArray(photos)) {
    const firstPhoto = photos[0];

    if (typeof firstPhoto === "string") {
      return firstPhoto;
    }

    if (
      firstPhoto &&
      typeof firstPhoto === "object"
    ) {
      return (
        firstPhoto.url ||
        firstPhoto.href ||
        firstPhoto.src ||
        firstPhoto.imageUrl ||
        firstPhoto.photoUrl ||
        null
      );
    }
  }

  if (
    photos &&
    typeof photos === "object"
  ) {
    return (
      photos.url ||
      photos.href ||
      photos.src ||
      photos.imageUrl ||
      photos.photoUrl ||
      null
    );
  }

  return findValue(property, [
    "image",
    "imageUrl",
    "thumbnail",
    "thumbnailUrl",
    "primaryImage",
  ]);
};

const findPrice = (property) => {
  const price = findValue(property, [
    "rent",
    "price",
    "monthlyRent",
    "monthlyPrice",
    "rentMin",
    "priceMin",
    "startingRent",
    "startingPrice",
  ]);

  if (price !== null) {
    return price;
  }

  const rentRange = findValue(property, [
    "rentRange",
    "priceRange",
  ]);

  if (rentRange) {
    if (typeof rentRange === "string") {
      return rentRange;
    }

    if (typeof rentRange === "object") {
      return (
        rentRange.min ||
        rentRange.low ||
        rentRange.start ||
        rentRange.from ||
        null
      );
    }
  }

  return null;
};


export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://apartments.realtyapi.io/search/bylocation?location=Austin%2C%20TX&resultCount=50",
        {
          headers: {
            "x-realtyapi-key":
              import.meta.env.VITE_REALTY_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "RealtyAPI response:",
        data
      );

      const listings = findListings(data);

      console.log(
        "Listings found:",
        listings
      );

      console.log(
        "Number of listings:",
        listings.length
      );

      const formattedProperties =
        listings.map((property, index) => {
          /* -------------------------- */
          /* ID                         */
          /* -------------------------- */

          const id =
            findValue(property, [
              "listingKey",
              "listingId",
              "propertyId",
              "id",
            ]) ||
            `property-${index}`;

          /* -------------------------- */
          /* Title                       */
          /* -------------------------- */

          const title =
            findValue(property, [
              "name",
              "title",
              "propertyName",
              "buildingName",
            ]) ||
            "Rental Property";

          /* -------------------------- */
          /* Address                     */
          /* -------------------------- */

          const rawAddress =
            findValue(property, [
              "address",
              "location",
            ]);

          let address =
            "Location unavailable";

          if (typeof rawAddress === "string") {
            address = rawAddress;
          } else if (
            rawAddress &&
            typeof rawAddress === "object"
          ) {
            address = [
              rawAddress.street,
              rawAddress.streetAddress,
              rawAddress.city,
              rawAddress.state,
              rawAddress.zip,
              rawAddress.zipCode,
            ]
              .filter(Boolean)
              .join(", ");
          }

          /* -------------------------- */
          /* Bedrooms                    */
          /* -------------------------- */

          const bedrooms =
            findValue(property, [
              "beds",
              "bedrooms",
              "bedroomCount",
            ]);

          /* -------------------------- */
          /* Bathrooms                   */
          /* -------------------------- */

          const bathrooms =
            findValue(property, [
              "baths",
              "bathrooms",
              "bathroomCount",
            ]);

          /* -------------------------- */
          /* Price                       */
          /* -------------------------- */

          const price = findPrice(property);

          /* -------------------------- */
          /* Property type               */
          /* -------------------------- */

          const type =
            findValue(property, [
              "propertyType",
              "type",
            ]) ||
            "Property";

          const image = findImage(property);

          const formatted = {
            id,
            title,
            address,
            bedrooms,
            bathrooms,
            price,
            type,
            image,

            // Keep the original object.
            originalData: property,
          };

          /*
            Debugging one property.
          */

          if (index === 0) {
            console.log(
              "FIRST RAW PROPERTY:",
              property
            );

            console.log(
              "FIRST FORMATTED PROPERTY:",
              formatted
            );
          }

          return formatted;
        });

      console.log(
        "Formatted properties:",
        formattedProperties
      );

      setProperties(
        formattedProperties
      );
    } catch (err) {
      console.error(
        "RealtyAPI request failed:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        error,
        fetchProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};


export const useProperties = () => {
  return useContext(PropertyContext);
};