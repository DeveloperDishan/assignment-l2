import { createServer, IncomingMessage, type Server } from "http";

const server: Server = createServer((req: IncomingMessage, res) => {
    console.log();
})

server.listen(5000, () => {
    console.log("Server is running on port 5000");
})