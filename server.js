const express = require('express'); //Library for handling requests
const bodyParser = require('body-parser'); //Library for parsing requests body parameters
const fs = require('fs'); //Library for reading and writing files
const app = express(); //Initialise express
const storageFile ='posts.json'; //File path where to store the data
const PORT = 5000 || process.env.PORT;


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//Body parser configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Default url.
app.get('/', (request, response) => {
    return returnJsonResponse(response, false, 200, 'Happy!');
});

//GET method to retrieve all posts.
app.get('/posts', (request, response) => {
    //Read storage file.
    fs.readFile(storageFile, 'utf8', function readFileCallback(err, data) {
        if (err) {
            return throwExeption(response,500);
        } else {
            return returnJsonResponse(response, false, 200, 'Posts retrieved successfully.',JSON.parse(data));
        }
    });
});

//POST method for creating a new post.
app.post('/create', (request, response) => {

    if (request.body.username.length === 0 || request.body.comment.length === 0){
        return throwExeption(response,400);
    }

    let success = savePostToFile(request.body);
    return success
        ? returnJsonResponse(response, false, 200, 'Post successfully stored.')
        : throwExeption(response,500);
});

//PUT method for updating a post with the given :id.
app.put('/update/:id', (request, response) => {

    if (request.body.title.length === 0 || request.body.description.length === 0){
        return throwExeption(response,400);
    }

    let postId = parseInt(request.params.id);

    fs.readFile(storageFile, 'utf8', function readFileCallback(err, data) {
        if (err) {
            return throwExeption(response,500);
        } else {

            let posts = JSON.parse(data);

            let postFound = false;

            let post = {};

            for (let i = 0;i<posts.length;i++){

                if(posts[i].id === postId){

                    postFound = true;

                    post = posts[i];

                    posts[i].title = request.body.title;
                    posts[i].description = request.body.description;
                }
            }

            //If the post was never found return 404 Not found.
            if (!postFound){
                return throwExeption(response,404);
            }

            //If everything went ok and the post object was updated in the posts array, parse the json array to string and store in file.
            posts = JSON.stringify(posts);
            fs.writeFile(storageFile,  posts, 'utf8', () => {

                //Return success and the updated post when the writing finishes.
                return  returnJsonResponse(response, false, 200, 'Post successfully updated.',post)
            });
        }
    });
});

//DELETE method for deleting a post with the given :id.
app.delete('/delete/:id', (request, response) => {

    let postId = parseInt(request.params.id);

    fs.readFile(storageFile, 'utf8', function readFileCallback(err, data) {
        if (err) {
            return throwExeption(response,500);
        } else {

            let posts = JSON.parse(data);

            let postFound = false;

            for (let i = 0;i<posts.length;i++){

                if(posts[i].id === postId){

                    postFound = true;

                    posts.splice(i, 1);
                }
            }

            //If the post was never found return 404 Not found.
            if (!postFound){
                return throwExeption(response,404);
            }

            //If everything went ok and the post object was deleted from the posts array, parse the json array to string and store in file.
            posts = JSON.stringify(posts);

            fs.writeFile(storageFile,  posts, 'utf8', () => {

                return  returnJsonResponse(response, false, 200, 'Post successfully deleted.')
            });
        }
    });
});

//Save new post to file
let savePostToFile = (post) => {

    let response = true;

    //Read storage file.
    fs.readFile(storageFile, 'utf8', function readFileCallback(err, data) {
        if (err) {
            return false;
        } else {

            let posts = JSON.parse(data);

            let lastId = getLastId(posts);

            post.id = lastId + 1;

            posts.push(post);

            posts = JSON.stringify(posts);

            fs.writeFile(storageFile,  posts, 'utf8', () => {

                //Return success when the writing finishes.
                return  true;
            });
        }
    });

    return response;
};

//Handle exception messages by their error code.
let throwExeption = (response,errorCode) => {
    let message;
    switch (errorCode) {
        case 404:
            message = "Post was not found.";
            break;
        case 400:
            message = "The request validation failed.";
            break;
        default:
            message = "A server side error occurred.";
    }
    return returnJsonResponse(response, true, errorCode, message);
};

//Return a standard JSON response.
let returnJsonResponse = (response, error, errorCode, message,data = null) => {
    return response.json({
        errorCode: errorCode,
        error: error,
        message: message,
        data:data
    });
};

//Get last id to simulate the autoincrement of database primary key.
let getLastId = (posts) => {
    return posts.length > 0 ? parseInt(posts[parseInt(posts.length) - 1].id) : 0;
};

//Start server on port 3000.
app.listen(PORT, () => console.log('Node micro server is up and running!',PORT));