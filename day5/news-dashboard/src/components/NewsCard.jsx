import React from "react";

class NewsCard extends React.Component {
  render() {
    return (
      <div className="bg-gray-900 p-5 rounded-xl">

        <h2 className="text-2xl font-bold">
          {this.props.title}
        </h2>

        <p className="text-gray-400 mt-2">
          {this.props.description}
        </p>

      </div>
    );
  }
}

export default NewsCard;