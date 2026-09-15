import React from "react";
import NewsCard from "./components/NewsCard";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      category: "all",
      search: "",
      articles: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;

    fetch(
      `https://newsdata.io/api/1/latest?apikey=${API_KEY}`
    )
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
            error: "Failed to load news",
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);

        this.setState({
          error: "Failed to load news",
          loading: false,
        });
      });
  }

  render() {
    return (
      <div className="min-h-screen bg-gray-950 text-white">

        <h1 className="text-4xl font-bold text-center pt-10">
          News Dashboard
        </h1>

        <p className="text-center mt-4">
          Current category: {this.state.category}
        </p>

        <button
          onClick={() =>
            this.setState({
              category: "technology",
            })
          }
          className="mt-5 mx-auto block bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
        >
          Technology
        </button>

        {this.state.loading && (
          <p className="text-center mt-10 text-xl">
            Loading news...
          </p>
        )}

        {this.state.error && (
          <p className="text-center mt-10 text-red-500">
            {this.state.error}
          </p>
        )}

        {!this.state.loading && !this.state.error && (
          <div className="max-w-2xl mx-auto mt-10 space-y-5">
            {this.state.articles.map((article) => (
              <NewsCard
                key={article.article_id}
                title={article.title}
                description={article.description}
              />
            ))}
          </div>
        )}

      </div>
    );
  }
}

export default App;