import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const defaultCards = [
  {
    id: 1,
    title: "Food Menu",
    description:
      "Explore a delicious selection of dishes, freshly prepared and full of flavor.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-orange-500/80 to-transparent",
    route: "/food-menu",
  },
  {
    id: 2,
    title: "Desert Menu",
    description:
      "Discover a selection of delicious desserts, sweet treats, and irresistible flavors.",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-pink-500/80 to-transparent",
    route: "/desert-menu",
  },
];

function ModalCards({ cards = defaultCards }) {
  const navigate = useNavigate();

  return (
    <div className="mx-20 mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className="group relative h-[420px] overflow-hidden rounded-3xl"
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Image */}
          <img
            src={card.image}
            alt={card.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${card.gradient} via-black/20 to-black/10`}
          />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-7">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {card.title}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-white/80">
              {card.description}
            </p>

            <button
              onClick={() => navigate(card.route)}
              className="mt-5 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/25"
            >
              Explore
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ModalCards;