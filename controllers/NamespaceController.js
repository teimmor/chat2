// const { threadId } = require("worker_threads");

class NamespaceController {
    constructor(title, endpoint) {
        this.title = title;
        this.endpoint = endpoint;
        this.rooms = [];
    }

    addRoom(room) {
        this.rooms.push(room);
    }
}

module.exports = NamespaceController;