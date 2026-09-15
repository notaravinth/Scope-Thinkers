import React from "react";
import NewsCard from "./components/NewsCard";
import FoldText from "./components/FoldText";
import BubbleMenu from "./components/BubbleMenu";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      category: "all",
      articles: [],
      loading: true,
      error: null,
      selectedArticle: null,
    };
  }

  componentDidMount() {
    this.fetchNews("all");
  }

  fetchNews = (category) => {
    const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;

    this.setState({
      loading: true,
      error: null,
      category: category,
    });

    let url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&image=1`;

    if (category !== "all") {
      url += `&category=${category}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === "success") {
          this.setState({
            articles: data.results,
            loading: false,
          });
        } else {
          this.setState({
            articles: [],
            error: "Failed to load news",
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);

        this.setState({
          articles: [],
          error: "Failed to load news",
          loading: false,
        });
      });
  };

  openArticle = (article) => {
    this.setState({
      selectedArticle: article,
    });
  };

  closeArticle = () => {
    this.setState({
      selectedArticle: null,
    });
  };

  handleCategoryClick = (item) => {
    const categoryMap = {
      Home: "all",
      Technology: "technology",
      Sports: "sports",
      Business: "business",
      Entertainment: "entertainment",
    };

    const category = categoryMap[item.label];

    if (category) {
      this.fetchNews(category);
    }
  };

  render() {
    const categoryNames = {
      all: "Home",
      technology: "Technology",
      sports: "Sports",
      business: "Business",
      entertainment: "Entertainment",
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white">

        {/* Header */}
        <header className="text-center pt-12 px-4 mt-45">
          <FoldText
            text="News Dashboard"
            fontSize={60}
            fontWeight={800}
            color="#ffffff"
            hinge="top"
            duration={0.7}
            stagger={0.06}
            trigger="mount"
          />

          <p className="text-gray-400 mt-3">
            Latest English News
          </p>
        </header>

        {/* Categories */}
        <section className="relative h-64 mt-8">
          <BubbleMenu
            menuBg="#ffffff"
            menuContentColor="#111111"
            items={[
              {
                label: "Home",
                href: "#",
                ariaLabel: "Home",
                rotation: -8,
                hoverStyles: {
                  bgColor: "#3b82f6",
                  textColor: "#ffffff",
                },
              },
              {
                label: "Technology",
                href: "#",
                ariaLabel: "Technology",
                rotation: 8,
                hoverStyles: {
                  bgColor: "#8b5cf6",
                  textColor: "#ffffff",
                },
              },
              {
                label: "Sports",
                href: "#",
                ariaLabel: "Sports",
                rotation: -8,
                hoverStyles: {
                  bgColor: "#10b981",
                  textColor: "#ffffff",
                },
              },
              {
                label: "Business",
                href: "#",
                ariaLabel: "Business",
                rotation: 8,
                hoverStyles: {
                  bgColor: "#f59e0b",
                  textColor: "#ffffff",
                },
              },
              {
                label: "Entertainment",
                href: "#",
                ariaLabel: "Entertainment",
                rotation: -8,
                hoverStyles: {
                  bgColor: "#ef4444",
                  textColor: "#ffffff",
                },
              },
            ]}
            onItemClick={this.handleCategoryClick}
          />
        </section>

        {/* Current Category */}
        <section className="text-center px-4">
          <p className="text-gray-400">
            Showing:{" "}
            <span className="text-white font-semibold">
              {categoryNames[this.state.category]}
            </span>
          </p>
        </section>

        {/* Loading */}
        {this.state.loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-xl text-gray-300">
              Loading news...
            </p>
          </div>
        )}

        {/* Error */}
        {this.state.error && (
          <div className="flex justify-center items-center py-20">
            <p className="text-red-500">
              {this.state.error}
            </p>
          </div>
        )}

        {/* News Grid */}
        {!this.state.loading && !this.state.error && (
          <main className="max-w-7xl mx-auto px-6 pt-8 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {this.state.articles.map((article) => (
                <NewsCard
                  key={article.article_id}
                  article={article}
                  onReadMore={this.openArticle}
                />
              ))}
            </div>
          </main>
        )}

        {/* Article Popup */}
        {this.state.selectedArticle && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 z-50"
            onClick={this.closeArticle}
          >
            <div
              className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(event) => event.stopPropagation()}
            >

              {/* Popup Image */}
              {this.state.selectedArticle.image_url && (
                <img
                  src={this.state.selectedArticle.image_url}
                  alt={this.state.selectedArticle.title}
                  className="w-full h-72 object-cover rounded-t-2xl"
                />
              )}

              <div className="p-7">

                {/* Close Button */}
                <button
                  onClick={this.closeArticle}
                  className="float-right text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>

                {/* Title */}
                <h2 className="text-3xl font-bold pr-10">
                  {this.state.selectedArticle.title}
                </h2>

                {/* Source + Date */}
                <div className="flex gap-3 text-sm text-gray-400 mt-4">
                  <span>
                    {this.state.selectedArticle.source_name}
                  </span>

                  <span>•</span>

                  <span>
                    {this.state.selectedArticle.pubDate}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-lg leading-relaxed mt-6">
                  {this.state.selectedArticle.description ||
                    "No description available."}
                </p>

                {/* Original Article */}
                {this.state.selectedArticle.link && (
                  <a
                    href={this.state.selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-7 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Read Full Article →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}

export default App;