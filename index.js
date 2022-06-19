import http from 'http'
import { users } from './data.js'
import { v4 as uuidv4, validate } from 'uuid';
import dotenv from 'dotenv'

const PORT = dotenv.config().parsed.PORT

const server = http.createServer(async (req, res) => {
    try {
        if (req.url === "/api/user" && req.method === "GET") {

            res.writeHead(200, { "Content-Type": "application/json" });

            res.write(JSON.stringify(users));

            res.end();
        } else if (req.url.match(/\/api\/user\/(.*)/) && req.method === "GET") {
            try {
                const id = req.url.split("/")[3];

                if (validate(id)) {

                    const data = users.filter(el => el.id == id);

                    if (data[0] !== undefined) {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(data[0]));
                    } else {
                        res.writeHead(404, { "Content-Type": "text/plain" });
                        res.end(JSON.stringify({ message: "uuid doesn't exist" }));
                    }
                } else {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    res.end(JSON.stringify({ message: "Invalid uuid" }));
                }


            } catch (error) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: error }));
            }
        } else if (req.url === "/api/user" && req.method === "POST") {

            let body = await getReqData(req);
            let userInput = JSON.parse(body);

            if (Object.keys(userInput).includes('username', 'age', 'hobbies')) {

                const user = {
                    id: uuidv4(),
                    username: userInput.username,
                    age: parseInt(userInput.age),
                    hobbies: userInput.hobbies
                };
                users.push(user);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(user));

            } else {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid json" }));
            }
        } else if (req.url.match(/\/api\/user\/(.*)/) && req.method === "PUT") {

            const id = req.url.split("/")[3];
            let body = await getReqData(req);
            let userInput = JSON.parse(body);

            if (validate(id)) {

                const elementIndex = users.findIndex((obj => obj.id === id));

                if (elementIndex !== -1) {

                    users[elementIndex].username = userInput.username;
                    users[elementIndex].age = parseInt(userInput.age);
                    users[elementIndex].hobbies = userInput.hobbies;

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(users[elementIndex]));
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end(JSON.stringify({ message: "uuid doesn't exist" }));
                }
            } else {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end(JSON.stringify({ message: "Invalid uuid" }));
            }
        } else if (req.url.match(/\/api\/user\/(.*)/) && req.method === "DELETE") {

            const id = req.url.split("/")[3];

            if (validate(id)) {
                const elementIndex = users.findIndex((obj => obj.id === id));
                if (elementIndex !== -1) {
                    const delUser = users[elementIndex];
                    users.splice(elementIndex, 1);

                    res.writeHead(204);
                    res.end();
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end(JSON.stringify({ message: "uuid doesn't exist" }));
                }
            } else {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end(JSON.stringify({ message: "Invalid uuid" }));
            }

        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Route not found" }));
        }
    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: err.message }));
    }
});

server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});


function getReqData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                resolve(body);
            });
        } catch (error) {
            reject(error);
        }
    });
}

