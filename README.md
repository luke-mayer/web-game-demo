# Web Game Demo

## Purpose

To create a functional, browser-based, multiplayer web game.
This is intended to be a simple implementation with a very simple game.
The main focus is on constructing the infrastructure for a web-based, multiplayer game and gaining some basic practice with developing web-games.

## Architecture

### Coding Language
* Javascript (or Typescript)
    * Has a lot of established engines and libraries for web-games.

### Potential Frameworks/Engines/Technologies

* [Phaser](https://phaser.io/) 
    * Full game engine.
    * Object-oriented style
    * Optional paid GUI 2d editor that might streamline the process.
    * *leaning towards this due to popularity (increased libraries and community support)*
* [Kaplay](https://kaplayjs.com/)
    * Not object-oriented.
    * Component system.
    * Open-Source, completely free.

### Infrastructure/Architecture

#### Handling Multiplayer

I need to implement a way for two players to be able to connect to the server and play against each other in real time. Using a backend server with "rooms" that players connect to via websockets seems like the go-to method of real-time multiplayer in web-games.

Here is a short video with a good overview explanation - [Video](https://www.youtube.com/watch?v=1fjICYqfUG4)

* [Socket.io](https://socket.io/) - for websockets.
* [Express](https://expressjs.com/) - for webserver.

#### Hosting Options

* [Heroku](https://www.heroku.com/home)
* [Render](https://render.com/)
* [AWS EC2](https://aws.amazon.com/ec2/)

#### Back-End

#### Front-End

### Running & Testing

* Node.js http-server running in a docker container.
    * Allows easy development in neovim in wsl2 while allowing running and testing the game on chrome (on windows).

