# Chears Milestone moments

To increase employee engagement, company milestones can be displayed on the Flip Dot Board. Examples include birthdays and work anniversaries.

OWOW uses Slack for internal communication. Selected Slack messages can be shown on the Flip Dot Board with a matching animation to highlight an employee or team. Colleagues can respond to the milestone, and these reactions are displayed after the animation.

OpenAI can be used to filter relevant Slack messages, ensuring that only appropriate content appears on the Flip Dot Board.


## Installation

This application is made in Node.js make sure you have installed it.


```bash
npm install 
npm install @slack/bolt
npm install openai
npm install dotenv
```

## Running the Application
Start the development server with:

```
npm run dev
```
This runs the application with nodemon for automatic reloading when files are modified.

Once running:

1: Open your browser and navigate to http://localhost:3000/view

2: You'll see the real-time preview of the flipdot display output

## Project Structure
````
project-root/
├── src/
│   ├── animations/
│   │   ├── birthday-animation.js      # Birthday animation frames
│   │   ├── time-for-beer.js           # Celebration animation
│   │   ├── we-rock-animation.js       # Team milestone animation
│   │   └── welcome-to-team.js         # New employee animation
│   │
│   ├── index.js                       # Main entry point: canvas setup, rendering, text scrolling, Slack message queue
│   ├── animation.js                   # Triggers animations based on Slack keywords
│   ├── ticker.js                      # Timing mechanism (Node.js animation loop)
│   ├── websocket-slack.js             # Slack WebSocket (Socket Mode) connection
│   ├── preview.js                     # HTTP server for real-time browser preview
│   └── settings.js                    # Display resolution, panel layout, and framerate config
│
├── output/
│   └── *.png                          # Generated animation frames
│
├── .env                               # Environment variables (API keys, secrets)
├── .env.example                       # Example environment configuration
├── package.json
└── README.md
````
## Settings and Configuration

The display settings can be modified in `src/settings.js`:

```javascript
export const FPS = 15;                    // Frames per second
export const PANEL_RESOLUTION = [28, 14]; // Size of each panel in dots
export const PANEL_LAYOUT = [3, 2];       // Layout of panels (horizontal, vertical)
export const RESOLUTION = [               // Total resolution calculation
    PANEL_RESOLUTION[0] * PANEL_LAYOUT[0],
    PANEL_RESOLUTION[1] * PANEL_LAYOUT[1],
];
```

## Creating Your Own Animations

The main rendering loop is in `src/index.js`. To create your own animations:

1. Modify the callback function in the `ticker.start()` method
2. Use the canvas 2D context (`ctx`) to draw your graphics
3. The graphics are automatically converted to black and white for the flipdot display

Example of drawing a simple animation:

```javascript
ticker.start(({ deltaTime, elapsedTime }) => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    
    // Draw something (e.g., moving circle)
    const x = Math.floor(((Math.sin(elapsedTime / 1000) + 1) / 2) * width);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, height/2, 5, 0, Math.PI * 2);
    ctx.fill();
});
```

## Advanced Usage

### Binary Thresholding

The application automatically converts all drawn graphics to pure black and white using thresholding:

```javascript
// Any pixel with average RGB value > 127 becomes white, otherwise black
const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
const binary = brightness > 127 ? 255 : 0;
```

### Output

The rendered frames are saved as PNG files in the `output` directory and can be accessed via the web preview or directly from the filesystem.

## Roadmap

For the future the following features can be changed/added:
- Instead of animations and scrolling text, the company prefers a creatively generated picture from OpenAI to appear on the Flip Dot Board.

## Dependencies

- [`canvas`](https://www.npmjs.com/package/canvas) - For creating and manipulating graphics
- [`nodemon`](https://www.npmjs.com/package/nodemon) - For development auto-reloading

## License
This project is created for the company OWOW.

## Demo video
[Watch the demo video](https://youtu.be/Ka2r0qe9rbo)


