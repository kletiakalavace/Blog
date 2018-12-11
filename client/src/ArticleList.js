import React, {Component} from "react";
import ArticleItems from "./ArticleItems";

class ArticleList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            response: "",
            message: ""
        };

        this.addItem = this.addItem.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
        this.sortDateItems = this.sortDateItems.bind(this);
        this.loadPostsFromServer = this.loadPostsFromServer.bind(this);
    }

    addItem(e) {
        e.preventDefault();
        if (this._inputElement.value !== "" && this._textareaElement.value !== "") {
            let newItem = {
                id: Date.now(),
                username: this._inputElement.value,
                comment: this._textareaElement.value,
            };

            return fetch('http://localhost:5000/create',{
                method: 'POST',
                body: JSON.stringify(newItem),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => response.json()
                .then((resp) => {
                   if (resp.errorCode === 200){
                       this.setState((prevState) => {
                           return {
                               items: prevState.items.concat(newItem),
                               message: resp.message
                           };
                       });
                   }
                   else {
                      this.setState({
                          message: resp.message
                      });
                   }

                    setTimeout(() => {
                        this.setState({
                            message: ''
                        });
                    }, 3000)
                }));


        }

        this._inputElement.value = "";
        this._textareaElement.value = "";
        e.preventDefault();
    }

    deleteItems(id) {
        return fetch(`http://localhost:5000/delete/${id}`, {
            method: 'DELETE'
        }).then((response) => response.json()
            .then((rsp) => {
                    if (rsp.errorCode === 200) {
                        let filteredItems = this.state.items.filter(function (item) {
                            return (item.id !== id)
                        });
                        this.setState({
                            message: rsp.message,
                            items: filteredItems
                        });
                    } else {
                        this.setState({
                            message: rsp.message
                        });
                    }
                setTimeout(() => {
                    this.setState({
                        message: ''
                    });
                }, 3000)
                }
            ));
    };

    sortDateItems(key) {

    }


    componentDidMount() {
        this.loadPostsFromServer()
            .then(response => this.setState({items: response.data}))
            .catch(err => console.log(err));
    }


    loadPostsFromServer = async () => {
        const response = await fetch('http://localhost:5000/posts');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    render() {
        return (
            <div className="main">
                <div className="put-content">
                    {
                        this.state.message !== '' ?
                            <div className="alert alert-info">
                                { this.state.message }
                                <button className="close" type="button" data-dismiss="alert">
                                    <span>&times;</span>
                                </button>
                            </div>
                            : null
                    }
                    <form onSubmit={this.addItem}>
                        <input ref={(a) => this._inputElement = a}
                               type="text" placeholder="Enter title">
                        </input>
                        <textarea ref={(a) => this._textareaElement = a} placeholder="Enter text here..."></textarea>
                        <button type="submit">Add</button>
                    </form>
                </div><br/>
                <ArticleItems posts={this.state.items} onDeletePost={this.deleteItems}/>
            </div>
        );
    }
}

export default ArticleList;