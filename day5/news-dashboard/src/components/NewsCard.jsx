import React from "react";

class NewsCard extends React.Component {
  handleReadMore = () => {
    this.props.onReadMore(this.props.article);
  };

  render() {
    const { article } = this.props;

    return (
      <div
        className="
          group relative overflow-hidden rounded-2xl
          bg-gray-900 border border-gray-800
          transition-all duration-300
          hover:-translate-y-2
          hover:border-gray-500
          hover:shadow-2xl
        "
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="
                w-full h-full object-cover
                transition-transform duration-500
                group-hover:scale-110
              "
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Source badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
              {article.source_name || "News"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">

          {/* Category */}
          {article.category && article.category.length > 0 && (
            <p className="text-blue-400 text-xs uppercase tracking-widest mb-2">
              {article.category[0]}
            </p>
          )}

          {/* Title */}
          <h2 className="
            text-xl font-bold leading-tight
            line-clamp-3
            group-hover:text-blue-400
            transition-colors duration-300
          ">
            {article.title}
          </h2>

          {/* Description */}
          <p className="
            text-gray-400
            text-sm
            mt-3
            line-clamp-3
          ">
            {article.description || "No description available."}
          </p>

          {/* Date */}
          {article.pubDate && (
            <p className="text-gray-500 text-xs mt-4">
              {article.pubDate}
            </p>
          )}

          {/* Read More */}
          <button
            onClick={this.handleReadMore}
            className="
              mt-5
              w-full
              rounded-lg
              bg-white/5
              border border-white/10
              px-4 py-2.5
              text-sm font-semibold
              text-white
              transition-all duration-300
              hover:bg-blue-600
              hover:border-blue-500
            "
          >
            Read More →
          </button>

        </div>

        {/* Hover glow */}
        <div
          className="
            pointer-events-none
            absolute -inset-px
            rounded-2xl
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-500
            bg-gradient-to-r
            from-blue-500/10
            via-purple-500/10
            to-pink-500/10
          "
        />
      </div>
    );
  }
}

export default NewsCard;

