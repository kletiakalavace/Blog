import React from "react";

function ArticleItems(props) {
    const {posts, onDeletePost} = props;

    const handleDeleteClick = function(event, postId) {
        event.preventDefault();
        onDeletePost(postId);
    };
    return (
        <ul className="theList">
            {posts.map((post) =>
                <li key={post.id}>
                    <h1>{post.username}</h1>
                    <div className="description-article">{post.comment}</div>
                    <button onClick={(event) => handleDeleteClick(event, post.id) }>Delete </button>
                </li>)}
        </ul>
    );
}

export default ArticleItems;