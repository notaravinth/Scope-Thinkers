import "dotenv/config";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const indianFoodKeywords = [
  "biryani",
  "dosa",
  "idli",
  "vada",
  "sambar",
  "paneer",
  "butter chicken",
  "chicken tikka",
  "tikka masala",
  "naan",
  "roti",
  "paratha",
  "parotta",
  "korma",
  "kofta",
  "curry",
  "masala",
  "tandoori",
  "tandoor",
  "samosa",
  "pakora",
  "pakoda",
  "chaat",
  "pav bhaji",
  "chole",
  "chana",
  "rajma",
  "dal",
  "dal makhani",
  "palak",
  "aloo",
  "gobi",
  "haleem",
  "fish amritsari",
  "fish curry",
  "mutton",
  "keema",
  "vindaloo",
  "thali",
];

const indianDessertKeywords = [
  "gulab jamun",
  "jalebi",
  "rasmalai",
  "rasgulla",
  "kheer",
  "kulfi",
  "barfi",
  "burfi",
  "ladoo",
  "laddu",
  "halwa",
  "gajar halwa",
  "soan papdi",
  "sandesh",
  "peda",
  "payasam",
  "sheer korma",
  "shahi tukda",
  "malpua",
  "mysore pak",
  "modak",
];

const getCategory = (item) => {
  const name = item.itemName?.toLowerCase() || "";
  const description =
    item.itemDescription?.toLowerCase() || "";

  const text = `${name} ${description}`;

  if (
    indianDessertKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "dessert";
  }

  if (
    indianFoodKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return "food";
  }

  return null;
};

const syncMenu = async () => {
  try {
    console.log("Fetching menu from Restaurant API...");

    const response = await fetch(
      "https://fakerestaurantapi.runasp.net/api/Restaurant/items"
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(`Received ${data.length} items.`);

    const uniqueItems = Array.from(
      new Map(
        data.map((item) => [
          item.itemName?.trim().toLowerCase(),
          item,
        ])
      ).values()
    );

    console.log(
      `After removing duplicates: ${uniqueItems.length} items.`
    );

    let synced = 0;
    let skipped = 0;

    for (const item of uniqueItems) {
      const category = getCategory(item);

      if (!category) {
        skipped++;
        continue;
      }

      const itemId = String(item.itemID);

      await setDoc(doc(db, "menuItems", itemId), {
        itemID: item.itemID,
        itemName: item.itemName,
        itemDescription: item.itemDescription || "",
        itemPrice: Number(item.itemPrice) || 0,
        imageUrl: item.imageUrl || "",
        category,
      });

      synced++;

      console.log(`Synced: ${item.itemName}`);
    }

    console.log("\n----------------------------");
    console.log("Menu sync completed.");
    console.log(`Synced: ${synced}`);
    console.log(`Skipped: ${skipped}`);
    console.log("----------------------------\n");
  } catch (error) {
    console.error("Menu sync failed:", error);
    process.exit(1);
  }
};

syncMenu();