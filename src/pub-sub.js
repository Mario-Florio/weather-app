
let events = {
    events: {},
    on: function (eventName, fn) {//subscribe
        this.events[eventName] = this.events[eventName] || []
        this.events[eventName].push(fn)
    },
    off: function (eventName, fn) {//unsubscribe
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1)
                    break
                }
            }
        }
    },
    emit: function (eventName, data) {//publish
        if (this.events[eventName]) {
            this.events[eventName].forEach(function(fn) {
                fn(data)
            })
        }
    }
}

export { events }
