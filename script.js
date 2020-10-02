const fps = 10;
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext('2d');

let starScape;
let sun;
let planets = [];


//=====Classes=====//

class StarScape {
	constructor() {
		this.stars = [];
		this.resizeStarScape();
	}
	resizeStarScape() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		this.starts = [];
		this.generateStars();

	}
	generateStars() {
		let n = canvas.width * canvas.height / 750;
		for (let i = 0; i < n; i++) {
			this.stars[i] = {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				radius: Math.sqrt(Math.random() * 2),
				alpha: 1.0,
				decreasing: true,
				dRatio: Math.random() * 0.01
			};
		}
	}
	drawStars() {
		let stars = this.stars;

		ctx.save();
		ctx.fillStyle = "black"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i < stars.length; i++) {
			let star = stars[i];

			ctx.beginPath();
			ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.fillStyle = "rgba(255, 255, 255, " + star.alpha + ")";

			if (star.decreasing == true) {
				star.alpha -= star.dRatio;
				if (star.alpha < 0.1) {
					star.decreasing = false;
				}
			} else {
				star.alpha += star.dRatio;
				if (star.alpha > 0.95) {
					star.decreasing = true;
				}
			}

			ctx.fill();
		}
		ctx.restore();
	}
	render() {
		this.drawStars();
	}
}

class CelestialBody {
	constructor(radius) {
		this.radius = radius
	}
	drawCircle(x, y, radius, style) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = style;
		ctx.strokeStyle = style;
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.restore();
	}
	drawAtmosphere(x, y, depth, style) {
		let radius = this.radius + depth;

		this.drawCircle(x, y, radius, style);
	}
	drawGlow(glowDistance, style) {

		ctx.save();
		ctx.shadowBlur = glowDistance;
		ctx.shadowColor = style;
		ctx.restore();
	}
}

class Sun extends CelestialBody {
	constructor(radius) {
		super(radius);
		this.name = "Sun"
	}
	setPositionToCenter() {
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
	}
	render() {

		ctx.save();

		this.setPositionToCenter();
		let x = this.x;
		let y = this.y;
		let radius = this.radius;

		//Creates the Gradient
		let gradient = ctx.createRadialGradient(x, y, radius - 10, x, y, radius);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(1, "gold");

		//console.log("Drawing " + this.name + " at " + this.x + ", " + this.y + ".");

		//Draws the Atmosphere rings.
		this.drawAtmosphere(x, y, 15, "rgba(255, 164, 46, 0.1)");
		this.drawAtmosphere(x, y, 8, "rgba(255, 164, 46, 0.1)");
		this.drawAtmosphere(x, y, 5, "rgba(255, 164, 46, 0.2)");

		this.drawGlow(100, "yellow");

		//Draws the Circle
		this.drawCircle(x, y, radius, gradient);

		ctx.restore();


	}
}

class Planet extends CelestialBody {
	constructor(radius, name, orbitalRadius, style) {
		super(radius, name, orbitalRadius);
		this.name = name
		this.orbitalRadius = orbitalRadius
		this.orbitalAngle = Math.random() * 360;
		this.orbitalSpeed = Math.random()
		this.fillStyle = style
		this.moons = []
		this.setNextPosition();
		this.x = 0;
		this.y = 0;
		this.xCenter = canvas.width / 2;
		this.yCenter = canvas.height / 2;
	}

	render() {
		let x = this.x;
		let y = this.y;

		this.drawOrbitalPath(0.2);
		this.drawMoons();
		this.drawCircle(x, y, this.radius, this.fillStyle);
		this.drawShaddow();
		this.setNextPosition();
	}
	drawOrbitalPath(alpha) {
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "rgba(225, 225, 225, " +  alpha + ")";
		ctx.arc(this.xCenter, this.yCenter, this.orbitalRadius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.restore();
	}
	drawShaddow() {
		let x0, y0, x1, y1;

		let innerRadius = this.orbitalRadius - (this.radius * 0.5);
		let outerRadius = this.orbitalRadius + (this.radius * 0.2);
		let xCenter = canvas.width / 2;
		let yCenter = canvas.height / 2;
		let angle = (this.orbitalAngle) % 360;
		let rad = angle * Math.PI / 180;

		x0 = xCenter + innerRadius * Math.cos(rad);
		y0 = yCenter + innerRadius * Math.sin(rad);

		x1 = xCenter + outerRadius * Math.cos(rad);
		y1 = yCenter + outerRadius * Math.sin(rad);

		ctx.save();

		let gradient = ctx.createLinearGradient(x0, y0, x1, y1);
		gradient.addColorStop(0, "rgba(0,0,0,0)");
		gradient.addColorStop(1, "rgba(0,0,0,0.8)");

		ctx.beginPath();
		ctx.fillStyle = gradient;
		ctx.strokeStyle = gradient;
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.restore();
	}
	drawMoons() {
		if (this.moons.length > 0) {
			this.moons.forEach((moon) => {
				moon.xCenter = this.x;
				moon.yCenter = this.y;
				moon.render();
			});
		}
	}
	setCenterPosition() {
		this.xCenter = canvas.width / 2;
		this.yCenter = canvas.height / 2;
		console.log(this.xCenter);
	}
	setNextPosition() {
		let orbitalRadius = this.orbitalRadius;
		let xCenter = this.xCenter;
		let yCenter = this.yCenter;
		let angle = (this.orbitalAngle - this.orbitalSpeed) % 360;
		let rad = angle * Math.PI / 180;

		this.x = xCenter + orbitalRadius * Math.cos(rad);
		this.y = yCenter + orbitalRadius * Math.sin(rad);
		this.orbitalAngle = angle;
	}

}

class Moon extends Planet {
	constructor(radius, name, orbitalRadius, style) {
		super(radius, name, orbitalRadius, style);
		this.xCenter = 0;
		this.yCetner = 0;
	}
	render() {
		this.drawOrbitalPath(0.1);
		this.drawCircle(this.x, this.y, this.radius, this.fillStyle);
		this.drawShaddow();
		this.setNextPosition();
	}
}

//=====Functions=====//

function init() {
	createCelestialObjects();
	requestAnimationFrame(updateAnimations);
}

function updateAnimations() {
	starScape.render();
	sun.render();
	planets.forEach(planet => {
		planet.render()
	});
	requestAnimationFrame(updateAnimations);
}

function createCelestialObjects() {
	starScape = new StarScape();
	sun = new Sun(25);

	planets.push(new Planet(30, "TestPlanet1", 150, "blue"),
		new Planet(15, "TestPlanet2", 225, "green"),
		new Planet(10, "TestPlanet2", 250, "purple"),
		new Planet(20, "TestPlanet2", 350, "pink"));

	planets[0].moons[0] = new Moon(1, "moon1", 40, "orange");
	planets[0].moons[1] = new Moon(2, "moon1", 50, "pink");
	planets[3].moons[0] = new Moon(1, "moon1", 45, "yellow");
}

function testStuff() {
	console.log("testFunction called");
}

//=====||=====//

window.addEventListener('load', (event) => {
	init();
});

window.addEventListener('resize', (event) => {
	starScape.resizeStarScape();
	planets.forEach(planet => {
		planet.setCenterPosition();
	})
});



//TODO Add real world physics (Mass, gravitational constant, orbital periods etc).
